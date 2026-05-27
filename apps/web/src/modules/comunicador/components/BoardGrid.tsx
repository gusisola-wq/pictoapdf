import { type CommunicatorBoard, type BoardCell } from '@picto/core';
import { BoardCellComponent } from './BoardCell';

interface Props {
  board: CommunicatorBoard;
  editMode: boolean;
  onCellClick: (cell: BoardCell) => void;
  onEmptySlotClick: (position: number) => void;
}

export function BoardGrid({ board, editMode, onCellClick, onEmptySlotClick }: Props) {
  const totalSlots = board.columns * board.rows;
  const cellMap = new Map(board.cells.map((c) => [c.position, c]));

  const slots = Array.from({ length: totalSlots }, (_, i) => cellMap.get(i) ?? null);

  return (
    <div
      className="grid gap-3 w-full max-w-2xl mx-auto h-full"
      style={{
        gridTemplateColumns: `repeat(${board.columns}, 1fr)`,
        gridTemplateRows: `repeat(${board.rows}, minmax(0, 1fr))`,
      }}
    >
      {slots.map((cell, i) => {
        if (!cell) {
          return (
            <button
              key={`empty-${i}`}
              onClick={() => onEmptySlotClick(i)}
              className="rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:border-white/30 hover:text-white/40 transition cursor-pointer"
            >
              {editMode && <span className="text-lg font-bold">+</span>}
            </button>
          );
        }
        return (
          <BoardCellComponent
            key={cell.id}
            cell={cell}
            editMode={editMode}
            onClick={() => onCellClick(cell)}
          />
        );
      })}
    </div>
  );
}
