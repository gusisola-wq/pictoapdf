import { useCommunicator } from '../hooks/useCommunicator';
import { BoardGrid } from '../components/BoardGrid';
import { SentenceBar } from '../components/SentenceBar';
import { CellEditorModal } from '../components/CellEditorModal';
import { BoardManagerPanel } from '../components/BoardManagerPanel';
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Check,
  Settings,
} from 'lucide-react';

export default function CommunicatorPage() {
  const {
    loading,
    currentBoard,
    allBoards,
    boardHistory,
    sentence,
    editMode,
    editingCell,
    editingCellPosition,
    showBoardManager,
    navigateBack,
    handleCellClick,
    handleEmptySlotClick,
    removeFromSentence,
    clearSentence,
    speakSentence,
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
  } = useCommunicator();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        No hay tableros disponibles. Seleccioná un perfil primero.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        {boardHistory.length > 0 && (
          <button
            onClick={navigateBack}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-200 tracking-wide truncate">
            {editMode ? `Editando: ${currentBoard.name}` : currentBoard.name}
          </h2>
        </div>

        {editMode && (
          <button
            onClick={openBoardManager}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="Gestionar tableros"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            editMode
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-white/10 text-slate-300 hover:bg-white/20'
          }`}
        >
          {editMode ? (
            <><Check className="w-3.5 h-3.5" /> Hecho</>
          ) : (
            <><Pencil className="w-3.5 h-3.5" /> Editar</>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <BoardGrid
          board={currentBoard}
          editMode={editMode}
          onCellClick={handleCellClick}
          onEmptySlotClick={handleEmptySlotClick}
        />
      </div>

      {/* Sentence bar */}
      <SentenceBar
        sentence={sentence}
        onRemove={removeFromSentence}
        onClear={clearSentence}
        onSpeak={speakSentence}
      />

      {/* Cell editor modal */}
      {editingCell && editingCellPosition !== null && (
        <CellEditorModal
          cell={editingCell}
          position={editingCellPosition}
          onSave={saveCell}
          onDelete={deleteCell}
          onClose={closeCellEditor}
        />
      )}

      {/* Board manager modal */}
      {showBoardManager && (
        <BoardManagerPanel
          boards={allBoards}
          currentBoardId={currentBoard.id}
          onSelectBoard={selectBoardFromManager}
          onSaveSettings={saveBoardSettings}
          onCreateBoard={createBoard}
          onDeleteBoard={deleteBoard}
          onImportFromText={importBoardsFromText}
          onExportToFile={exportBoardsToFile}
          onClose={closeBoardManager}
        />
      )}
    </div>
  );
}
