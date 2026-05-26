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

export class PictoAACDB extends Dexie {
  users!: EntityTable<UserRow, 'id'>;
  gridStates!: EntityTable<GridStateRow, 'userId'>;

  constructor() {
    super('picto-aac');

    this.version(1).stores({
      users: 'id, name',
      gridStates: 'userId',
    });
  }
}

export const db = new PictoAACDB();
