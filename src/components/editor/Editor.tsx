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
    if (!currentFile || !isDirty) return;

    try {
      if (fileType === 'dream' && currentDream) {
        const serialized = serializeDreamFile(currentDream);
        await writeTextFile(currentFile, serialized);
      } else {
        await writeTextFile(currentFile, currentContent);
      }
      setDirty(false);
    } catch (error) {
      console.error('Failed to save file:', error);
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
  }, [currentFile, currentDream, currentContent, isDirty, fileType]);

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
