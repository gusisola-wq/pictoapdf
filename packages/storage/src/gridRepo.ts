import { db } from './db';
import type { GridStateRow } from './db';
import { DEFAULT_SETTINGS, uid, type GridSettings, type SheetPage, type SavedGridState } from '@picto/core';

function serializeGridState(state: SavedGridState): Omit<GridStateRow, 'userId'> {
  return {
    settings: JSON.stringify(state.settings),
    pages: JSON.stringify(state.pages),
    activePageIndex: state.activePageIndex,
  };
}

function deserializeGridState(row: GridStateRow): SavedGridState {
  return {
    settings: JSON.parse(row.settings) as GridSettings,
    pages: JSON.parse(row.pages) as SheetPage[],
    activePageIndex: row.activePageIndex,
  };
}

function initialPage(): SheetPage {
  return {
    id: uid('page'),
    name: 'Página 1',
    pictograms: {},
  };
}

function defaultState(): SavedGridState {
  return {
    settings: { ...DEFAULT_SETTINGS },
    pages: [initialPage()],
    activePageIndex: 0,
  };
}

export async function loadGridState(userId: string): Promise<SavedGridState | null> {
  const row = await db.gridStates.get(userId);
  if (!row) return null;
  return deserializeGridState(row);
}

export async function saveGridState(
  userId: string,
  state: SavedGridState,
): Promise<void> {
  const data = serializeGridState(state);
  await db.gridStates.put({ userId, ...data });
}

export async function deleteGridState(userId: string): Promise<void> {
  await db.gridStates.delete(userId);
}

const STORAGE_KEY_OLD = 'pictodraft-state';

interface LegacySavedState {
  settings: GridSettings;
  pages: SheetPage[];
  activePageIndex: number;
}

export async function migrateFromLocalStorage(userId: string): Promise<boolean> {
  const existing = await db.gridStates.get(userId);
  if (existing) return false;

  let legacy: LegacySavedState | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OLD);
    if (raw) {
      legacy = JSON.parse(raw) as LegacySavedState;
    }
  } catch { /* ignorar */ }

  if (!legacy) return false;

  await saveGridState(userId, legacy);
  return true;
}

export function clearLegacyStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OLD);
  } catch { /* ignorar */ }
}

export async function resetGridState(userId: string): Promise<void> {
  await saveGridState(userId, defaultState());
}
