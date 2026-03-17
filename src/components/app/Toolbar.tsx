import { FolderOpen, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/projectStore';
import { open } from '@tauri-apps/plugin-dialog';

interface ToolbarProps {
  onSettingsClick: () => void;
}

export function Toolbar({ onSettingsClick }: ToolbarProps) {
  const { projectName, setProjectPath } = useProjectStore();

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

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold text-text-primary">
          {projectName || 'Dream Verge Studio'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleOpenProject}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Open Project
        </Button>
        <Button
          onClick={onSettingsClick}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <SettingsIcon className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
