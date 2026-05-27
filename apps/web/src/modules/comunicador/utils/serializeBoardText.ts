import { type CommunicatorBoard } from '@picto/core';

export function serializeBoardsToText(boards: CommunicatorBoard[]): string {
  const byName = (a: CommunicatorBoard, b: CommunicatorBoard) => a.name.localeCompare(b.name);
  const rootBoards = boards.filter((b) => b.parentCellId === null).sort(byName);
  const subBoards = boards.filter((b) => b.parentCellId !== null).sort(byName);

  const lines: string[] = [];

  function writeBoard(board: CommunicatorBoard, isSub: boolean) {
    const prefix = isSub ? '#' : '';
    lines.push(`${prefix}${board.name},${board.columns},${board.rows}`);

    const sorted = [...board.cells].sort((a, b) => a.position - b.position);
    for (const cell of sorted) {
      const parts: string[] = [];
      if (cell.isFolder) {
        parts.push(`#${cell.label}`);
      } else {
        parts.push(cell.label);
      }
      if (cell.speakOnTap) parts.push('hablar');
      if (cell.addToSentence) parts.push('frase');
      lines.push(parts.join(','));
    }
  }

  for (const board of rootBoards) {
    writeBoard(board, false);
    lines.push('');
  }

  for (const board of subBoards) {
    writeBoard(board, true);
    lines.push('');
  }

  // Remove trailing blank line
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
