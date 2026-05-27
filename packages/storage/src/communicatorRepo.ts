import { db } from './db';
import type { CommunicatorBoardRow } from './db';
import { type CommunicatorBoard, type BoardCell } from '@picto/core';

function serializeBoard(board: CommunicatorBoard): Omit<CommunicatorBoardRow, 'id'> {
  return {
    userId: board.userId,
    name: board.name,
    parentCellId: board.parentCellId,
    columns: board.columns,
    rows: board.rows,
    cells: JSON.stringify(board.cells),
  };
}

function deserializeBoard(row: CommunicatorBoardRow): CommunicatorBoard {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    parentCellId: row.parentCellId,
    columns: row.columns,
    rows: row.rows,
    cells: JSON.parse(row.cells) as BoardCell[],
  };
}

export async function getRootBoard(userId: string): Promise<CommunicatorBoard | null> {
  const row = await db.communicatorBoards
    .where('userId')
    .equals(userId)
    .and(b => b.parentCellId === null)
    .first();
  return row ? deserializeBoard(row) : null;
}

export async function getBoard(id: string): Promise<CommunicatorBoard | null> {
  const row = await db.communicatorBoards.get(id);
  return row ? deserializeBoard(row) : null;
}

export async function getBoardsByUser(userId: string): Promise<CommunicatorBoard[]> {
  const rows = await db.communicatorBoards.where('userId').equals(userId).toArray();
  return rows.map(deserializeBoard);
}

export async function getSubBoard(parentCellId: string): Promise<CommunicatorBoard | null> {
  const row = await db.communicatorBoards
    .where('parentCellId')
    .equals(parentCellId)
    .first();
  return row ? deserializeBoard(row) : null;
}

export async function saveBoard(board: CommunicatorBoard): Promise<void> {
  const data = serializeBoard(board);
  await db.communicatorBoards.put({ id: board.id, ...data });
}

export async function deleteBoard(id: string): Promise<void> {
  await db.communicatorBoards.delete(id);
}

export async function deleteUserBoards(userId: string): Promise<void> {
  const boards = await getBoardsByUser(userId);
  await db.communicatorBoards.where('userId').equals(userId).delete();
}
