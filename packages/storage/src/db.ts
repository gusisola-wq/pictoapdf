import Dexie, { type EntityTable } from 'dexie';

export interface UserRow {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

export interface GridStateRow {
  userId: string;
  settings: string;
  pages: string;
  activePageIndex: number;
}

export interface CommunicatorBoardRow {
  id: string;
  userId: string;
  name: string;
  parentCellId: string | null;
  columns: number;
  rows: number;
  cells: string;
}

export class PictoAACDB extends Dexie {
  users!: EntityTable<UserRow, 'id'>;
  gridStates!: EntityTable<GridStateRow, 'userId'>;
  communicatorBoards!: EntityTable<CommunicatorBoardRow, 'id'>;

  constructor() {
    super('picto-aac');

    this.version(1).stores({
      users: 'id, name',
      gridStates: 'userId',
    });

    this.version(2).stores({
      users: 'id, name',
      gridStates: 'userId',
      communicatorBoards: 'id, userId, parentCellId',
    });
  }
}

export const db = new PictoAACDB();
