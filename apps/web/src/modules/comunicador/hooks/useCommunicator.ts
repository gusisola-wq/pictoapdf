import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStore, uid, type CommunicatorBoard, type BoardCell, FITZGERALD_CATEGORIES } from '@picto/core';
import {
  getRootBoard,
  getBoard,
  getBoardsByUser,
  saveBoard,
  deleteBoard as deleteBoardInDB,
} from '@picto/storage';
import { createDefaultBoards } from '../data/defaultBoards';
import { parseBoardText } from '../utils/parseBoardText';
import { serializeBoardsToText, downloadTextFile } from '../utils/serializeBoardText';

interface SentenceItem {
  id: string;
  label: string;
  categoryId: string;
}

export function useCommunicator() {
  const currentUser = useUserStore((s) => s.currentUser);
  const [loading, setLoading] = useState(true);
  const [boardCache, setBoardCache] = useState<Map<string, CommunicatorBoard>>(new Map());
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [boardHistory, setBoardHistory] = useState<string[]>([]);
  const [sentence, setSentence] = useState<SentenceItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<BoardCell | null>(null);
  const [editingCellPosition, setEditingCellPosition] = useState<number | null>(null);
  const [showBoardManager, setShowBoardManager] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const initBoards = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const allBoards = await getBoardsByUser(currentUser.id);
      const cache = new Map<string, CommunicatorBoard>();
      for (const b of allBoards) {
        cache.set(b.id, b);
      }

      if (allBoards.length === 0) {
        // No boards at all — seed defaults
        const defaults = createDefaultBoards(currentUser.id);
        for (const b of defaults) {
          await saveBoard(b);
          cache.set(b.id, b);
        }
      }

      const firstRoot = Array.from(cache.values()).find((b) => b.parentCellId === null) ?? Array.from(cache.values())[0];
      if (firstRoot) {
        setCurrentBoardId(firstRoot.id);
      }
      setBoardCache(cache);
      setBoardHistory([]);
      setSentence([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    initBoards();
  }, [initBoards]);

  const currentBoard = currentBoardId ? boardCache.get(currentBoardId) ?? null : null;

  const allBoards = currentUser
    ? Array.from(boardCache.values()).filter((b) => b.userId === currentUser.id)
    : [];

  // ── Navigation ──

  const navigateToBoard = useCallback(async (boardId: string) => {
    if (currentBoardId) {
      setBoardHistory((prev) => [...prev, currentBoardId]);
    }
    setCurrentBoardId(boardId);
    const cached = boardCache.get(boardId);
    if (cached) return;
    const board = await getBoard(boardId);
    if (board) {
      setBoardCache((prev) => new Map(prev).set(boardId, board));
    }
  }, [currentBoardId, boardCache]);

  const navigateBack = useCallback(() => {
    setBoardHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const prevBoardId = newHistory.pop()!;
      setCurrentBoardId(prevBoardId);
      return newHistory;
    });
  }, []);

  // ── TTS ──

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Cell click ──

  const handleCellClick = useCallback((cell: BoardCell) => {
    if (editMode) {
      setEditingCell(cell);
      setEditingCellPosition(cell.position);
      return;
    }
    if (cell.speakOnTap !== false) {
      speak(cell.label);
    }
    if (cell.addToSentence !== false) {
      setSentence((prev) => [...prev, { id: cell.id, label: cell.label, categoryId: cell.categoryId }]);
    }
    if (cell.isFolder && cell.subBoardId) {
      navigateToBoard(cell.subBoardId);
    }
  }, [editMode, navigateToBoard, speak]);

  const handleEmptySlotClick = useCallback((position: number) => {
    if (!editMode || !currentBoard) return;
    const firstCat = FITZGERALD_CATEGORIES[0]?.id ?? 'none';
    const newCell: BoardCell = {
      id: uid('cell'),
      position,
      label: '',
      categoryId: firstCat,
      isFolder: false,
      speakOnTap: true,
      addToSentence: true,
    };
    setEditingCell(newCell);
    setEditingCellPosition(position);
  }, [editMode, currentBoard]);

  // ── Sentence ──

  const removeFromSentence = useCallback((index: number) => {
    setSentence((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearSentence = useCallback(() => {
    setSentence([]);
  }, []);

  const speakSentence = useCallback(() => {
    const text = sentence.map((s) => s.label).join(' ');
    if (text) speak(text);
  }, [sentence, speak]);

  // ── Edit mode ──

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
    setEditingCell(null);
    setEditingCellPosition(null);
  }, [currentBoard, allBoards]);

  const closeCellEditor = useCallback(() => {
    setEditingCell(null);
    setEditingCellPosition(null);
  }, []);

  const saveCell = useCallback((cell: BoardCell) => {
    if (!currentBoard) return;

    let savedCell = cell;

    if (cell.isFolder && !cell.subBoardId) {
      const subBoardId = uid('board');
      savedCell = { ...cell, subBoardId };
      let subName = cell.label;
      let suffix = 2;
      const allB = allBoards;
      while (allB.some((b) => b.name.toLowerCase() === subName.toLowerCase())) {
        subName = `${cell.label} ${suffix}`;
        suffix++;
      }
      const newSubBoard: CommunicatorBoard = {
        id: subBoardId,
        userId: currentBoard.userId,
        name: subName,
        parentCellId: cell.id,
        columns: 3,
        rows: 3,
        cells: [],
      };
      setBoardCache((prev) => new Map(prev).set(subBoardId, newSubBoard));
      saveBoard(newSubBoard);
    }

    const newCells = currentBoard.cells.filter((c) => c.position !== savedCell.position);
    newCells.push(savedCell);
    const updatedBoard: CommunicatorBoard = { ...currentBoard, cells: newCells };
    setBoardCache((prev) => new Map(prev).set(currentBoard.id, updatedBoard));
    saveBoard(updatedBoard);
    setEditingCell(null);
    setEditingCellPosition(null);
  }, [currentBoard, allBoards]);

  const deleteCell = useCallback((position: number) => {
    if (!currentBoard) return;
    const cell = currentBoard.cells.find((c) => c.position === position);
    if (cell && cell.isFolder && cell.subBoardId) {
      setBoardCache((prev) => {
        const next = new Map(prev);
        next.delete(cell.subBoardId!);
        return next;
      });
    }
    const newCells = currentBoard.cells.filter((c) => c.position !== position);
    const updatedBoard: CommunicatorBoard = { ...currentBoard, cells: newCells };
    setBoardCache((prev) => new Map(prev).set(currentBoard.id, updatedBoard));
    saveBoard(updatedBoard);
    setEditingCell(null);
    setEditingCellPosition(null);
  }, [currentBoard]);

  // ── Board manager ──

  const openBoardManager = useCallback(() => setShowBoardManager(true), []);
  const closeBoardManager = useCallback(() => setShowBoardManager(false), []);

  const selectBoardFromManager = useCallback((boardId: string) => {
    setCurrentBoardId(boardId);
    setBoardHistory([]);
    setShowBoardManager(false);
  }, []);

  const saveBoardSettings = useCallback((board: CommunicatorBoard, data: { name: string; columns: number; rows: number }) => {
    const name = data.name.trim();
    const duplicate = allBoards.some((b) => b.id !== board.id && b.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      alert(`Ya existe un tablero llamado "${name}". Elegí otro nombre.`);
      return;
    }
    const updated: CommunicatorBoard = { ...board, name, columns: data.columns, rows: data.rows };
    setBoardCache((prev) => new Map(prev).set(board.id, updated));
    saveBoard(updated);
  }, [allBoards]);

  const createBoard = useCallback((data: { name: string; columns: number; rows: number }): boolean => {
    if (!currentUser) return false;
    const name = data.name.trim();
    const duplicate = allBoards.some((b) => b.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      alert(`Ya existe un tablero llamado "${name}". Elegí otro nombre.`);
      return false;
    }
    const boardId = uid('board');
    const newBoard: CommunicatorBoard = {
      id: boardId,
      userId: currentUser.id,
      name,
      parentCellId: null,
      columns: data.columns,
      rows: data.rows,
      cells: [],
    };
    setBoardCache((prev) => new Map(prev).set(boardId, newBoard));
    saveBoard(newBoard);
    setCurrentBoardId(boardId);
    setBoardHistory([]);
    setSentence([]);
    setEditMode(true);
    return true;
  }, [currentUser, allBoards]);

  const deleteBoard = useCallback(async (boardId: string) => {
    await deleteBoardInDB(boardId);
    setBoardCache((prev) => {
      const next = new Map(prev);
      next.delete(boardId);
      return next;
    });
    if (boardId === currentBoardId) {
      const remaining = allBoards.filter((b) => b.id !== boardId);
      const fallback = remaining.find((b) => b.parentCellId === null) ?? remaining[0];
      if (fallback) {
        setCurrentBoardId(fallback.id);
      }
      setBoardHistory([]);
    }
  }, [currentBoardId, allBoards]);

  const addNewBoard = useCallback(() => {
    if (!currentUser) return;
    const boardId = uid('board');
    let name = 'Nuevo tablero';
    let suffix = 2;
    while (allBoards.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      name = `Nuevo tablero ${suffix}`;
      suffix++;
    }
    const newBoard: CommunicatorBoard = {
      id: boardId,
      userId: currentUser.id,
      name,
      parentCellId: null,
      columns: 3,
      rows: 3,
      cells: [],
    };
    setBoardCache((prev) => new Map(prev).set(boardId, newBoard));
    saveBoard(newBoard);
    setCurrentBoardId(boardId);
    setBoardHistory([]);
    setSentence([]);
    setEditMode(true);
    setShowBoardManager(false);
  }, [currentUser, allBoards]);

  const importBoardsFromText = useCallback((text: string) => {
    if (!currentUser) return [];
    const boards = parseBoardText(text, currentUser.id);
    for (const board of boards) {
      saveBoard(board);
      setBoardCache((prev) => new Map(prev).set(board.id, board));
    }
    if (boards.length > 0) {
      setCurrentBoardId(boards[0].id);
      setBoardHistory([]);
      setSentence([]);
    }
    return boards;
  }, [currentUser]);

  const exportBoardsToFile = useCallback(() => {
    const text = serializeBoardsToText(allBoards);
    const name = currentBoard?.name ?? 'tableros';
    downloadTextFile(text, `${name}.txt`);
  }, [allBoards, currentBoard]);

  return {
    loading,
    currentBoard,
    allBoards,
    boardHistory,
    sentence,
    editMode,
    editingCell,
    editingCellPosition,
    showBoardManager,
    navigateToBoard,
    navigateBack,
    handleCellClick,
    handleEmptySlotClick,
    removeFromSentence,
    clearSentence,
    speakSentence,
    speak,
    toggleEditMode,
    closeCellEditor,
    saveCell,
    deleteCell,
    openBoardManager,
    closeBoardManager,
    selectBoardFromManager,
    saveBoardSettings,
    createBoard,
    deleteBoard,
    addNewBoard,
    importBoardsFromText,
    exportBoardsToFile,
  };
}
