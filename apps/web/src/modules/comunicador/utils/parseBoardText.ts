import { uid, type CommunicatorBoard, type BoardCell, FITZGERALD_CATEGORIES } from '@picto/core';

interface RawBoard {
  name: string;
  isSub: boolean;
  columns: number;
  rows: number;
  cells: { label: string; isFolder: boolean; tags: string[] }[];
}

export function parseBoardText(text: string, userId: string): CommunicatorBoard[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const raws: RawBoard[] = [];
  const errors: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    const header = lines[0];
    const cellLines = lines.slice(1);

    const isSub = header.startsWith('#');
    const headerClean = isSub ? header.slice(1).trim() : header;
    const parts = headerClean.split(',').map((p) => p.trim());

    let name: string;
    let columns = 4;
    let rows = 3;

    if (parts.length >= 3) {
      name = parts[0];
      columns = clampInt(parts[1], 1, 10, 4);
      rows = clampInt(parts[2], 1, 10, 3);
    } else if (parts.length === 2) {
      name = parts[0];
      columns = clampInt(parts[1], 1, 10, 4);
    } else {
      name = parts[0];
    }

    const cells: RawBoard['cells'] = [];
    for (const line of cellLines) {
      const cellParts = line.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
      if (cellParts.length === 0) continue;
      const first = cellParts[0];
      const isFolder = first.startsWith('#');
      const label = (isFolder ? first.slice(1).trim() : first) || '(sin etiqueta)';
      const tags = cellParts.slice(1).map((t) => t.toLowerCase().trim());
      cells.push({ label, isFolder, tags });
    }

    raws.push({ name, isSub, columns, rows, cells });
  }

  // Build boards with unique names
  const boardMap = new Map<string, CommunicatorBoard>();
  const nameToUnique = new Map<string, string>();
  const usedNames = new Set<string>();

  for (const raw of raws) {
    let uniqueName = raw.name;
    let suffix = 2;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${raw.name} ${suffix}`;
      suffix++;
    }
    usedNames.add(uniqueName);
    nameToUnique.set(raw.name, uniqueName);

    const board: CommunicatorBoard = {
      id: uid('board'),
      userId,
      name: uniqueName,
      parentCellId: null,
      columns: raw.columns,
      rows: raw.rows,
      cells: [],
    };
    boardMap.set(uniqueName, board);
  }

  // Link sub-boards and build cells
  for (const raw of raws) {
    const uniqueName = nameToUnique.get(raw.name)!;
    const board = boardMap.get(uniqueName)!;
    const positions: BoardCell[] = [];

    for (const c of raw.cells) {
      let subBoardId: string | undefined;
      if (c.isFolder) {
        const subUniqueName = nameToUnique.get(c.label);
        const sub = subUniqueName ? boardMap.get(subUniqueName) : undefined;
        if (sub) {
          subBoardId = sub.id;
        }
      }

      const cat = inferCategory(c.label, c.tags);

      const cell: BoardCell = {
        id: uid('cell'),
        position: positions.length,
        label: c.label,
        categoryId: cat,
        imageUrl: undefined,
        subBoardId,
        isFolder: c.isFolder,
        speakOnTap: c.tags.includes('hablar') || (!c.isFolder && !c.tags.includes('nohablar')),
        addToSentence: c.tags.includes('frase') || (!c.isFolder && !c.tags.includes('nofrase')),
      };

      if (c.isFolder && subBoardId) {
        const sub = boardMap.get(c.label)!;
        sub.parentCellId = cell.id;
      }

      positions.push(cell);
    }

    board.cells = positions;
  }

  return Array.from(boardMap.values());
}

function clampInt(val: string, min: number, max: number, fallback: number): number {
  const n = parseInt(val, 10);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

const CATEGORY_KEYWORDS: [string, string][] = [
  ['social', 'sí'],
  ['social', 'si'],
  ['social', 'no'],
  ['social', 'hola'],
  ['social', 'gracias'],
  ['social', 'abraz'],
  ['verb', 'quier'],
  ['verb', 'necesit'],
  ['verb', 'com'],
  ['verb', 'dorm'],
  ['verb', 'jug'],
  ['verb', 'habl'],
  ['verb', 'mir'],
  ['verb', 'ayud'],
  ['verb', 'par'],
  ['verb', 'camin'],
  ['verb', 'corr'],
  ['verb', 'salt'],
  ['verb', 'bail'],
  ['verb', 'cant'],
  ['noun', 'agua'],
  ['noun', 'lech'],
  ['noun', 'jug'],
  ['noun', 'pan'],
  ['noun', 'frut'],
  ['noun', 'gallet'],
  ['noun', 'arroz'],
  ['noun', 'past'],
  ['noun', 'carn'],
  ['noun', 'pesc'],
  ['noun', 'pelot'],
  ['noun', 'libro'],
  ['noun', 'cas'],
  ['noun', 'parqu'],
  ['noun', 'colegi'],
  ['noun', 'médic'],
  ['noun', 'medic'],
  ['noun', 'tiend'],
  ['adjective', 'dol'],
  ['adjective', 'cans'],
  ['adjective', 'frí'],
  ['adjective', 'fri'],
  ['adjective', 'cal'],
  ['adjective', 'bien'],
  ['adjective', 'mal'],
  ['adjective', 'grand'],
  ['adjective', 'chiqu'],
  ['adjective', 'bonit'],
  ['adjective', 'fe'],
  ['miscellaneous', 'músic'],
  ['miscellaneous', 'music'],
  ['miscellaneous', 'tv'],
  ['miscellaneous', 'más'],
  ['miscellaneous', 'mas'],
  ['miscellaneous', 'columpi'],
  ['miscellaneous', 'pint'],
  ['miscellaneous', 'puzzl'],
];

function inferCategory(label: string, tags: string[]): string {
  // Explicit tag overrides
  for (const tag of tags) {
    for (const [cat, kw] of CATEGORY_KEYWORDS) {
      if (tag.includes(kw)) return cat;
    }
  }
  // Infer from label
  const lower = label.toLowerCase();
  for (const [cat, kw] of CATEGORY_KEYWORDS) {
    if (lower.includes(kw)) return cat;
  }
  return 'none';
}
