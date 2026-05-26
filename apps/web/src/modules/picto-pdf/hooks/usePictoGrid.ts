import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStore, useUIStore, uid, DEFAULT_SETTINGS,
  type SheetPage, type GridSettings, type PictogramItem } from '@picto/core';
import { loadGridState, saveGridState, resetGridState } from '@picto/storage';
import { INITIAL_SAMPLE_PICTOGRAMS } from '../data/samples';
import { generatePDF } from '../utils/pdfGenerator';
import { INITIAL_SCALE_WIDTH, getPrintArea } from '@picto/core';

export function usePictoGrid() {
  const currentUser = useUserStore((s) => s.currentUser);
  const onToast = useUIStore((s) => s.triggerToast);

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<GridSettings>(DEFAULT_SETTINGS);
  const [pages, setPages] = useState<SheetPage[]>([{
    id: 'page-1',
    name: 'Página 1',
    pictograms: { ...INITIAL_SAMPLE_PICTOGRAMS },
  }]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [moveSourceSlot, setMoveSourceSlot] = useState<number | null>(null);
  const [scaleWidth, setScaleWidth] = useState(INITIAL_SCALE_WIDTH);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    loadGridState(currentUser.id).then((saved) => {
      if (cancelled) return;
      if (saved) {
        setSettings(saved.settings);
        setPages(saved.pages);
        setActivePageIndex(saved.activePageIndex);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [currentUser]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) return;

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveGridState(currentUser.id, { settings, pages, activePageIndex });
    }, 300);

    return () => clearTimeout(saveTimerRef.current);
  }, [settings, pages, activePageIndex, isLoading, currentUser]);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(resetTimerRef.current);
  }, []);

  const activePage = pages[activePageIndex] ?? pages[0];

  const handleUpdateSlot = useCallback(
    (slotIdx: number, slotData: Partial<PictogramItem> | null) => {
      setPages((prev) => {
        const updated = [...prev];
        const page = updated[activePageIndex];
        if (slotData === null) {
          const updatedPictograms = { ...page.pictograms };
          delete updatedPictograms[slotIdx];
          page.pictograms = updatedPictograms;
        } else {
          const itemExists = page.pictograms[slotIdx];
          const updatedItem: PictogramItem = {
            id: itemExists?.id || uid('pic'),
            imageUrl: slotData.imageUrl ?? itemExists?.imageUrl,
            label: slotData.label ?? itemExists?.label ?? '',
            categoryId: slotData.categoryId ?? itemExists?.categoryId ?? 'none',
            customColor:
              slotData.customColor !== undefined
                ? slotData.customColor
                : itemExists?.customColor,
          };
          page.pictograms[slotIdx] = updatedItem;
        }
        page.pictograms = { ...page.pictograms };
        return updated;
      });
      if (slotData === null) {
        onToast(`Celda #${slotIdx + 1} vaciada con éxito`);
      }
    },
    [activePageIndex, onToast],
  );

  const handleBulkUpload = useCallback(
    (files: FileList) => {
      const capacity = (() => {
        if (settings.layoutMode === 'dimensions') {
          const area = getPrintArea(settings);
          const gapMm = settings.gap;
          const cols = Math.max(1, Math.floor((area.width + gapMm) / (settings.picWidth + gapMm)));
          const rows = Math.max(1, Math.floor((area.height + gapMm) / (settings.picHeight + gapMm)));
          return cols * rows;
        }
        return settings.columns * settings.rows;
      })();

      const fileArray = Array.from(files);
      const page = pages[activePageIndex] ?? pages[0];
      const occupiedSet = new Set(
        Object.entries(page?.pictograms ?? {})
          .filter(([, p]) => p.imageUrl)
          .map(([k]) => Number(k)),
      );

      const targets: { pageIdx: number; slotIdx: number }[] = [];
      let fileIdx = 0;

      for (let slot = 0; slot < capacity && fileIdx < fileArray.length; slot++) {
        if (!occupiedSet.has(slot)) {
          targets.push({ pageIdx: activePageIndex, slotIdx: slot });
          fileIdx++;
        }
      }

      const remaining = fileArray.length - fileIdx;
      const pagesToAdd = remaining > 0 ? Math.ceil(remaining / capacity) : 0;
      const firstNewPageIdx = pages.length;

      for (let p = 0; p < pagesToAdd; p++) {
        for (let slot = 0; slot < capacity && fileIdx < fileArray.length; slot++) {
          targets.push({ pageIdx: firstNewPageIdx + p, slotIdx: slot });
          fileIdx++;
        }
      }

      type BulkResult = { dataUrl: string; label: string; pageIdx: number; slotIdx: number };
      const results: (BulkResult | null)[] = [];
      let pending = fileArray.length;

      fileArray.forEach((file, idx) => {
        const { pageIdx, slotIdx } = targets[idx];
        const reader = new FileReader();
        reader.onload = () => {
          results[idx] = {
            dataUrl: reader.result as string,
            label: file.name.split('.')[0].replace(/[-_]/g, ' '),
            pageIdx,
            slotIdx,
          };
          pending--;
          if (pending === 0) flush();
        };
        reader.onerror = () => {
          results[idx] = null;
          pending--;
          if (pending === 0) flush();
        };
        reader.readAsDataURL(file);
      });

      function flush() {
        const valid = results.filter((r): r is BulkResult => r !== null);

        setPages((prev) => {
          const updated = [...prev];
          for (const r of valid) {
            while (updated.length <= r.pageIdx) {
              const n = updated.length + 1;
              updated.push({
                id: uid('page'),
                name: `Página ${n}`,
                pictograms: {},
              });
            }
            const pg = { ...updated[r.pageIdx], pictograms: { ...updated[r.pageIdx].pictograms } };
            pg.pictograms[r.slotIdx] = {
              id: uid('pic'),
              imageUrl: r.dataUrl,
              label: r.label,
              categoryId: 'none',
            };
            updated[r.pageIdx] = pg;
          }
          return updated;
        });

        if (pagesToAdd > 0) {
          setActivePageIndex(firstNewPageIdx + pagesToAdd - 1);
        }

        onToast(`Cargando ${valid.length} imágenes...`);
      }
    },
    [activePageIndex, settings, pages, onToast],
  );

  const clearAllSlots = useCallback(() => {
    setPages((prev) => {
      const updated = [...prev];
      updated[activePageIndex] = {
        ...updated[activePageIndex],
        pictograms: {},
      };
      return updated;
    });
    setSelectedSlot(null);
    setMoveSourceSlot(null);
    onToast('Se ha vaciado la página completa.');
  }, [activePageIndex, onToast]);

  const clearOnlyImages = useCallback(() => {
    setPages((prev) => {
      const updated = [...prev];
      const page = { ...updated[activePageIndex], pictograms: { ...updated[activePageIndex].pictograms } };
      Object.keys(page.pictograms).forEach((key) => {
        const idx = parseInt(key);
        if (page.pictograms[idx]) {
          page.pictograms[idx] = { ...page.pictograms[idx], imageUrl: undefined };
        }
      });
      updated[activePageIndex] = page;
      return updated;
    });
    onToast('Se eliminaron las imágenes. Se conservaron los textos.');
  }, [activePageIndex, onToast]);

  const handleLoadSamples = useCallback(() => {
    setPages((prev) => {
      const updated = [...prev];
      updated[activePageIndex] = {
        ...updated[activePageIndex],
        pictograms: { ...INITIAL_SAMPLE_PICTOGRAMS },
      };
      return updated;
    });
    setSelectedSlot(null);
    setMoveSourceSlot(null);
    onToast('Se ha cargado la rutina diaria de ejemplo.');
  }, [activePageIndex, onToast]);

  const handleSlotMoveStart = useCallback(
    (slotIndex: number, _e: React.MouseEvent) => {
      setMoveSourceSlot(slotIndex);
      onToast(`Seleccionada la Celda #${slotIndex + 1}. Ahora haz clic en cualquier otra celda para intercambiarlas.`);
    },
    [onToast],
  );

  const handleSlotDropToSwap = useCallback(
    (targetIndex: number) => {
      if (moveSourceSlot === null) return;
      if (moveSourceSlot === targetIndex) {
        setMoveSourceSlot(null);
        return;
      }
      setPages((prev) => {
        const updated = [...prev];
        const page = { ...updated[activePageIndex], pictograms: { ...updated[activePageIndex].pictograms } };
        const sourceItem = page.pictograms[moveSourceSlot];
        const targetItem = page.pictograms[targetIndex];
        if (sourceItem) {
          page.pictograms[targetIndex] = sourceItem;
        } else {
          delete page.pictograms[targetIndex];
        }
        if (targetItem) {
          page.pictograms[moveSourceSlot] = targetItem;
        } else {
          delete page.pictograms[moveSourceSlot];
        }
        updated[activePageIndex] = page;
        return updated;
      });
      setMoveSourceSlot(null);
      onToast(`Intercambiadas Celda #${moveSourceSlot + 1} y Celda #${targetIndex + 1}`);
    },
    [activePageIndex, moveSourceSlot, onToast],
  );

  const handleAddPage = useCallback(() => {
    const newIdx = pages.length + 1;
    setPages((prev) => [
      ...prev,
      {
        id: uid('page'),
        name: `Página ${newIdx}`,
        pictograms: {},
      },
    ]);
    setActivePageIndex(pages.length);
    setSelectedSlot(null);
    setMoveSourceSlot(null);
    onToast(`Nueva página A4 (${newIdx}) agregada.`);
  }, [pages.length, onToast]);

  const deletePage = useCallback(
    (idxToDelete: number) => {
      setPages((prev) => {
        const updated = prev.filter((_, idx) => idx !== idxToDelete);
        return updated;
      });
      setActivePageIndex((prev) => Math.max(0, idxToDelete - 1));
      setSelectedSlot(null);
      setMoveSourceSlot(null);
      onToast('Página eliminada.');
    },
    [onToast],
  );

  const handleExportPDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      onToast('Generando mapa vectorial de alta resolución y empaquetando PDF para imprimir...');
      const blob = await generatePDF(pages, settings);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoja-de-pictogramas-A4-${new Date().toISOString().substring(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onToast('¡PDF generado e iniciado descarga! Listo para imprimir en tamaño real.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      onToast('Error al generar el PDF. Verifica que las imágenes sean válidas.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pages, settings, onToast]);

  const handleReflowPictograms = useCallback(() => {
    const slotsPerPage = settings.columns * settings.rows;

    const allPictograms: PictogramItem[] = [];
    pages.forEach((page) => {
      const keys = Object.keys(page.pictograms).map(Number).sort((a, b) => a - b);
      keys.forEach((key) => {
        allPictograms.push(page.pictograms[key]);
      });
    });

    if (allPictograms.length === 0) {
      onToast('No hay pictogramas para reorganizar.');
      return;
    }

    const totalPages = Math.max(1, Math.ceil(allPictograms.length / slotsPerPage));
    const newPages: SheetPage[] = [];

    for (let p = 0; p < totalPages; p++) {
      const pictograms: Record<number, PictogramItem> = {};
      const start = p * slotsPerPage;
      const end = Math.min(start + slotsPerPage, allPictograms.length);
      for (let i = start; i < end; i++) {
        pictograms[i - start] = allPictograms[i];
      }
      newPages.push({
        id: uid('page'),
        name: `Página ${p + 1}`,
        pictograms,
      });
    }

    setPages(newPages);
    setActivePageIndex(0);
    setSelectedSlot(null);
    setMoveSourceSlot(null);
    onToast(`Pictogramas reordenados en ${totalPages} página(s).`);
  }, [pages, settings.columns, settings.rows, onToast]);

  const handleResetAll = useCallback(async () => {
    if (!currentUser) return;
    await resetGridState(currentUser.id);
    setSettings(DEFAULT_SETTINGS);
    setPages([{ id: uid('page'), name: 'Página 1', pictograms: { ...INITIAL_SAMPLE_PICTOGRAMS } }]);
    setActivePageIndex(0);
    setSelectedSlot(null);
    setMoveSourceSlot(null);
    setScaleWidth(INITIAL_SCALE_WIDTH);
    onToast('Configuración restablecida. La página se recargará.');
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => window.location.reload(), 800);
  }, [currentUser, onToast]);

  return {
    isLoading,
    settings,
    setSettings,
    pages,
    activePageIndex,
    setActivePageIndex,
    selectedSlot,
    setSelectedSlot,
    moveSourceSlot,
    setMoveSourceSlot,
    scaleWidth,
    setScaleWidth,
    isGeneratingPDF,
    activePage,
    handleUpdateSlot,
    handleBulkUpload,
    clearAllSlots,
    clearOnlyImages,
    handleLoadSamples,
    handleSlotMoveStart,
    handleSlotDropToSwap,
    handleAddPage,
    deletePage,
    handleExportPDF,
    handleReflowPictograms,
    handleResetAll,
  };
}
