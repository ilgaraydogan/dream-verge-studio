import { useEditorStore } from '../../store/editorStore';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { DreamEditor } from './DreamEditor';
import { SoulEditor } from './SoulEditor';
import { serializeDreamFile } from '../../lib/project/dreamFile';
import { useEffect } from 'react';

export function Editor() {
  const { currentFile, currentDream, currentContent, isDirty, fileType, setDirty } = useEditorStore();

  const handleSave = async () => {
    if (!currentFile) {
      console.warn('[SAVE] No file selected');
      return;
    }

    if (!isDirty) {
      console.log('[SAVE] File not dirty, skipping save');
      return;
    }

    console.log('[SAVE] Starting save for file:', currentFile);
    console.log('[SAVE] File type:', fileType);

    try {
      let contentToSave: string;

      if (fileType === 'dream' && currentDream) {
        console.log('[SAVE] Serializing dream file...');
        contentToSave = serializeDreamFile(currentDream);
        console.log('[SAVE] Serialized content length:', contentToSave.length);
      } else {
        console.log('[SAVE] Using raw content...');
        contentToSave = currentContent;
      }

      console.log('[SAVE] Writing to file:', currentFile);
      await writeTextFile(currentFile, contentToSave);
      
      console.log('[SAVE] ✓ File saved successfully');
      setDirty(false);
    } catch (error) {
      console.error('[SAVE] ✗ Failed to save file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save file: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentFile) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <p className="text-sm">No file open</p>
      </div>
    );
  }

  const fileName = currentFile.split('/').pop() || '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-primary">{fileName}</span>
          {isDirty && <span className="text-xs text-accent">●</span>}
        </div>
        <Button
          onClick={handleSave}
          disabled={!isDirty}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span className="text-xs text-text-muted">⌘S</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {fileType === 'dream' ? (
          <DreamEditor />
        ) : fileType === 'soul' ? (
          <SoulEditor />
        ) : (
          <div className="p-4 text-text-muted">Unsupported file type</div>
        )}
      </div>
    </div>
  );
}
