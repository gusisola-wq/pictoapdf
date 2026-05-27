import { uid, type CommunicatorBoard, type BoardCell } from '@picto/core';

function folder(label: string, subBoardId: string): Omit<BoardCell, 'position'> {
  return { id: uid('cell'), label, categoryId: 'verb', isFolder: true, subBoardId, speakOnTap: false, addToSentence: false };
}

function cell(label: string, categoryId: string): Omit<BoardCell, 'position'> {
  return { id: uid('cell'), label, categoryId, isFolder: false, speakOnTap: true, addToSentence: true };
}

function cellsWithPositions(cells: Omit<BoardCell, 'position'>[]): BoardCell[] {
  return cells.map((c, i) => ({ ...c, position: i }));
}

export function createDefaultBoards(userId: string): CommunicatorBoard[] {
  const necesidadesId = uid('board');
  const comidaId = uid('board');
  const bebidasId = uid('board');
  const actividadesId = uid('board');
  const lugaresId = uid('board');

  const needsCells = cellsWithPositions([
    cell('Dormir', 'verb'),
    cell('Baño', 'noun'),
    cell('Dolor', 'adjective'),
    cell('Cansado', 'adjective'),
    cell('Frío', 'adjective'),
    cell('Calor', 'adjective'),
    cell('Abrazo', 'social'),
  ]);

  const foodCells = cellsWithPositions([
    cell('Pan', 'noun'),
    cell('Fruta', 'noun'),
    cell('Galletas', 'noun'),
    cell('Arroz', 'noun'),
    cell('Pasta', 'noun'),
    cell('Carne', 'noun'),
    cell('Pescado', 'noun'),
  ]);

  const drinkCells = cellsWithPositions([
    cell('Agua', 'noun'),
    cell('Leche', 'noun'),
    cell('Jugo', 'noun'),
    cell('Refresco', 'noun'),
  ]);

  const activityCells = cellsWithPositions([
    cell('Pelota', 'noun'),
    cell('Columpio', 'noun'),
    cell('Pintar', 'verb'),
    cell('Música', 'noun'),
    cell('TV', 'miscellaneous'),
    cell('Libro', 'noun'),
    cell('Puzzle', 'noun'),
  ]);

  const placeCells = cellsWithPositions([
    cell('Casa', 'noun'),
    cell('Parque', 'noun'),
    cell('Colegio', 'noun'),
    cell('Médico', 'noun'),
    cell('Tienda', 'noun'),
  ]);

  const rootCells = cellsWithPositions([
    cell('Sí', 'social'),
    cell('No', 'social'),
    folder('Quiero', necesidadesId),
    folder('Comer', comidaId),
    folder('Beber', bebidasId),
    folder('Jugar', actividadesId),
    cell('Ayuda', 'social'),
    cell('Más', 'miscellaneous'),
    cell('Parar', 'verb'),
    folder('Ir', lugaresId),
  ]);

  return [
    {
      id: uid('board'),
      userId,
      name: 'Mi Comunicador',
      parentCellId: null,
      columns: 4,
      rows: 3,
      cells: rootCells,
    },
    {
      id: necesidadesId,
      userId,
      name: 'Necesidades',
      parentCellId: rootCells[2].id,
      columns: 3,
      rows: 3,
      cells: needsCells,
    },
    {
      id: comidaId,
      userId,
      name: 'Comida',
      parentCellId: rootCells[3].id,
      columns: 3,
      rows: 3,
      cells: foodCells,
    },
    {
      id: bebidasId,
      userId,
      name: 'Bebidas',
      parentCellId: rootCells[4].id,
      columns: 3,
      rows: 2,
      cells: drinkCells,
    },
    {
      id: actividadesId,
      userId,
      name: 'Actividades',
      parentCellId: rootCells[5].id,
      columns: 3,
      rows: 3,
      cells: activityCells,
    },
    {
      id: lugaresId,
      userId,
      name: 'Lugares',
      parentCellId: rootCells[9].id,
      columns: 3,
      rows: 2,
      cells: placeCells,
    },
  ];
}
