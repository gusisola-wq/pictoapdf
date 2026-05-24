import React from 'react';
import { GridSettings, PictogramItem } from '../types';
import { PageManager } from './PageManager';
import { GridControls } from './GridControls';
import { TextStyling } from './TextStyling';
import { CellEditor } from './CellEditor';
import { BulkActions } from './BulkActions';

interface ControlsProps {
  settings: GridSettings;
  onSettingsChange: (settings: GridSettings) => void;
  selectedSlot: number | null;
  selectedSlotItem: PictogramItem | undefined;
  onUpdateSlot: (slotIdx: number, item: Partial<PictogramItem> | null) => void;
  onClearAllSlots: () => void;
  onClearOnlyImages: () => void;
  onLoadSamples: () => void;
  onExportPDF: () => void;
  pagesCount: number;
  activePageIndex: number;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onSelectPage: (index: number) => void;
  onBulkUpload: (files: FileList) => void;
  isGeneratingPDF: boolean;
  onCloseCellEditor?: () => void;
}

export const Controls: React.FC<ControlsProps> = (props) => {
  return (
    <div className="flex flex-col gap-6 select-none max-h-full overflow-y-auto pr-1">
      <PageManager
        pagesCount={props.pagesCount}
        activePageIndex={props.activePageIndex}
        onAddPage={props.onAddPage}
        onDeletePage={props.onDeletePage}
        onSelectPage={props.onSelectPage}
      />

      <GridControls
        settings={props.settings}
        onSettingsChange={props.onSettingsChange}
      />

      <TextStyling
        settings={props.settings}
        onSettingsChange={props.onSettingsChange}
      />

      <CellEditor
        selectedSlot={props.selectedSlot}
        selectedSlotItem={props.selectedSlotItem}
        onUpdateSlot={props.onUpdateSlot}
        onClose={props.onCloseCellEditor}
      />

      <BulkActions
        onBulkUpload={props.onBulkUpload}
        onLoadSamples={props.onLoadSamples}
        onClearOnlyImages={props.onClearOnlyImages}
        onClearAllSlots={props.onClearAllSlots}
        onExportPDF={props.onExportPDF}
        isGeneratingPDF={props.isGeneratingPDF}
      />
    </div>
  );
};
