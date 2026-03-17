import { Settings as SettingsIcon, Play, FolderOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { open } from '@tauri-apps/plugin-dialog';

interface ToolbarProps {
  onSettingsClick: () => void;
  onAnalyzeClick: () => void;
}

export function Toolbar({ onSettingsClick, onAnalyzeClick }: ToolbarProps) {
  const { projectName, setProjectPath } = useProjectStore();
  const { currentFile, isDirty } = useEditorStore();

  const handleOpenProject = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Dream Project Folder',
      });

      if (selected && typeof selected === 'string') {
        setProjectPath(selected);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const fileName = currentFile ? currentFile.split('/').pop() || '' : '';

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface h-12">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center justify-center w-6 h-6 bg-accent text-white text-xs font-bold">
          DV
        </div>
        <div className="text-sm font-semibold text-text-primary">
          {projectName || 'Dream Verge Studio'}
        </div>
      </div>

      {/* Center: Active File */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {fileName && (
          <>
            <span className="text-sm text-text-primary">{fileName}</span>
            {isDirty && <span className="text-xs text-accent">●</span>}
          </>
        )}
      </div>

      {/* Right: Open Project + Analyze + Settings */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <Button
          onClick={handleOpenProject}
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 text-sm"
        >
          <FolderOpen className="w-4 h-4" />
          Open
        </Button>
        <Button
          onClick={onAnalyzeClick}
          disabled={!currentFile}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-1.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          Analyze
        </Button>
        <button
          onClick={onSettingsClick}
          className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text-primary transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
