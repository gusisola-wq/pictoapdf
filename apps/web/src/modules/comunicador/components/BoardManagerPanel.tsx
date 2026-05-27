import { useState } from 'react';
import type { CommunicatorBoard } from '@picto/core';
import { X, Pencil, Trash2, Plus, FolderOpen, ChevronRight, FileText, Download } from 'lucide-react';

interface Props {
  boards: CommunicatorBoard[];
  currentBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onSaveSettings: (board: CommunicatorBoard, data: { name: string; columns: number; rows: number }) => void;
  onCreateBoard: (data: { name: string; columns: number; rows: number }) => boolean;
  onDeleteBoard: (boardId: string) => void;
  onImportFromText: (text: string) => void;
  onExportToFile: () => void;
  onClose: () => void;
}

type View = 'list' | 'settings' | 'import';

export function BoardManagerPanel({
  boards,
  currentBoardId,
  onSelectBoard,
  onSaveSettings,
  onCreateBoard,
  onDeleteBoard,
  onImportFromText,
  onExportToFile,
  onClose,
}: Props) {
  const [view, setView] = useState<View>('list');
  const [editingBoard, setEditingBoard] = useState<CommunicatorBoard | null>(null);
  const [editName, setEditName] = useState('');
  const [editColumns, setEditColumns] = useState(3);
  const [editRows, setEditRows] = useState(3);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);
  const [isNewBoard, setIsNewBoard] = useState(false);

  const rootBoards = boards.filter((b) => b.parentCellId === null);
  const subBoardIds = new Set(boards.filter((b) => b.parentCellId !== null).map((b) => b.parentCellId));

  function getSubBoards(parentCellId: string): CommunicatorBoard[] {
    return boards.filter((b) => b.parentCellId === parentCellId);
  }

  function openSettings(board: CommunicatorBoard) {
    setEditingBoard(board);
    setEditName(board.name);
    setEditColumns(board.columns);
    setEditRows(board.rows);
    setConfirmDelete(null);
    setIsNewBoard(false);
    setView('settings');
  }

  function startNewBoard() {
    setEditingBoard(null);
    setEditName('');
    setEditColumns(4);
    setEditRows(3);
    setConfirmDelete(null);
    setIsNewBoard(true);
    setView('settings');
  }

  function handleSaveSettings() {
    if (!editName.trim()) return;
    const data = {
      name: editName.trim(),
      columns: Math.max(1, Math.min(10, editColumns)),
      rows: Math.max(1, Math.min(10, editRows)),
    };
    if (isNewBoard) {
      const ok = onCreateBoard(data);
      if (!ok) return;
    } else if (editingBoard) {
      onSaveSettings(editingBoard, data);
    }
    setView('list');
    setEditingBoard(null);
    setIsNewBoard(false);
  }

  function handleCancelSettings() {
    setView('list');
    setEditingBoard(null);
    setIsNewBoard(false);
  }

  function handleDelete(boardId: string) {
    onDeleteBoard(boardId);
    setConfirmDelete(null);
    if (editingBoard?.id === boardId) {
      setView('list');
      setEditingBoard(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h3 className="text-sm font-bold text-slate-100">
            {view === 'settings'
              ? (isNewBoard ? 'Nuevo tablero' : 'Configurar tablero')
              : view === 'import' ? 'Importar tableros' : 'Tableros'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'settings' && (editingBoard || isNewBoard) && (
            <div className="space-y-4">
              <button
                onClick={handleCancelSettings}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer mb-2"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
                Volver a tableros
              </button>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Columnas</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditColumns(Math.max(1, editColumns - 1))} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer">−</button>
                    <span className="w-8 text-center text-sm font-bold text-slate-200">{editColumns}</span>
                    <button onClick={() => setEditColumns(Math.min(10, editColumns + 1))} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Filas</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditRows(Math.max(1, editRows - 1))} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer">−</button>
                    <span className="w-8 text-center text-sm font-bold text-slate-200">{editRows}</span>
                    <button onClick={() => setEditRows(Math.min(10, editRows + 1))} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/50 border border-white/5 px-4 py-3 text-center">
                <span className="text-xs text-slate-400">{editColumns} × {editRows} = <strong className="text-slate-200">{editColumns * editRows}</strong> celdas</span>
              </div>

              <div className="flex gap-2 pt-2">
                {editingBoard && (
                  <button
                    onClick={() => {
                      if (confirmDelete === editingBoard.id) {
                        handleDelete(editingBoard.id);
                      } else {
                        setConfirmDelete(editingBoard.id);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      confirmDelete === editingBoard.id
                        ? 'bg-red-500 text-white'
                        : 'text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    {confirmDelete === editingBoard.id ? 'Confirmar eliminar' : 'Eliminar tablero'}
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={handleSaveSettings}
                  disabled={!editName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition cursor-pointer shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {view === 'list' && (
            <div className="space-y-1">
              {rootBoards.map((board) => (
                <BoardListItem
                  key={board.id}
                  board={board}
                  isCurrent={board.id === currentBoardId}
                  depth={0}
                  subBoards={getSubBoards(board.id)}
                  allBoards={boards}
                  onSelect={onSelectBoard}
                  onEdit={openSettings}
                  onDelete={(id) => { setConfirmDelete(id); handleDelete(id); }}
                  confirmDelete={confirmDelete}
                  setConfirmDelete={setConfirmDelete}
                />
              ))}

              {boards.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No hay tableros todavía</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={startNewBoard}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/15 rounded-2xl text-sm text-slate-400 hover:text-slate-200 hover:border-white/30 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo
                </button>
                <button
                  onClick={() => { setView('import'); setImportText(''); setImportResult(null); }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/15 rounded-2xl text-sm text-slate-400 hover:text-slate-200 hover:border-white/30 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Importar
                </button>
                <button
                  onClick={onExportToFile}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/15 rounded-2xl text-sm text-slate-400 hover:text-slate-200 hover:border-white/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          )}

          {view === 'import' && (
            <div className="space-y-3">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer mb-1"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
                Volver a tableros
              </button>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Formato: <code className="text-slate-300 bg-slate-900 px-1 rounded">Nombre,columnas,filas</code> en la primer línea, luego una celda por línea. <code className="text-slate-300 bg-slate-900 px-1 rounded">#Etiqueta</code> abre sub-tablero. Comportamientos opcionales: <code className="text-slate-300 bg-slate-900 px-1 rounded">hablar</code>, <code className="text-slate-300 bg-slate-900 px-1 rounded">frase</code>. Línea en blanco separa tableros.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Mi Comunicador,4,3&#10;Hola,hablar,frase&#10;Sí,hablar,frase&#10;#Quiero,hablar,frase&#10;Ayuda,hablar,frase&#10;&#10;#Quiero,3,3&#10;Dormir,hablar,frase&#10;Baño,hablar,frase"
                rows={12}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono"
              />
              {importResult && (
                <p className={`text-xs ${importResult.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {importResult}
                </p>
              )}
              <button
                onClick={() => {
                  if (!importText.trim()) return;
                  onImportFromText(importText);
                  setImportResult(`✓ Tableros importados correctamente`);
                }}
                disabled={!importText.trim()}
                className="w-full py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition cursor-pointer shadow-lg"
              >
                Importar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Board list item with recursive sub-boards ──

interface BoardListItemProps {
  board: CommunicatorBoard;
  isCurrent: boolean;
  depth: number;
  subBoards: CommunicatorBoard[];
  allBoards: CommunicatorBoard[];
  onSelect: (id: string) => void;
  onEdit: (board: CommunicatorBoard) => void;
  onDelete: (id: string) => void;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
}

function BoardListItem({
  board,
  isCurrent,
  depth,
  subBoards,
  allBoards,
  onSelect,
  onEdit,
  onDelete,
  confirmDelete,
  setConfirmDelete,
}: BoardListItemProps) {
  return (
    <>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition group cursor-pointer ${
          isCurrent ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5'
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        <button
          onClick={() => onSelect(board.id)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
        >
          <span className="text-slate-400 shrink-0">
            {subBoards.length > 0 ? <FolderOpen className="w-4 h-4" /> : <span className="w-4" />}
          </span>
          <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
            {board.name}
          </span>
          <span className="text-[10px] text-slate-500 shrink-0">{board.cells.length}/{board.columns * board.rows}</span>
          {isCurrent && <span className="text-[10px] text-blue-400 font-bold shrink-0 ml-auto">ACTUAL</span>}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onEdit(board); }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Configurar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirmDelete === board.id) {
              onDelete(board.id);
            } else {
              setConfirmDelete(board.id);
              setTimeout(() => setConfirmDelete(null), 3000);
            }
          }}
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            confirmDelete === board.id
              ? 'text-red-400 bg-red-500/20'
              : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
          }`}
          title={confirmDelete === board.id ? 'Confirmar' : 'Eliminar'}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {subBoards.map((sub) => {
        const subSubBoards = allBoards.filter((b) => b.parentCellId === sub.id);
        return (
          <BoardListItem
            key={sub.id}
            board={sub}
            isCurrent={sub.id === board.id ? isCurrent : false}
            depth={depth + 1}
            subBoards={subSubBoards}
            allBoards={allBoards}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
          />
        );
      })}
    </>
  );
}
