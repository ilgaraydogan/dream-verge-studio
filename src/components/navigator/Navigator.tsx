import { FolderOpen, Plus, FileText } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { readDir, writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { useEffect, useState } from 'react';
import { createNewDreamFile, parseDreamFile, serializeDreamFile } from '../../lib/project/dreamFile';
import { initializeProject } from '../../lib/project/project';
import { Button } from '../ui/Button';

export function Navigator() {
  const { projectPath, projectName, dreamFiles, setDreamFiles } = useProjectStore();
  const { setCurrentFile, setCurrentDream, setCurrentContent, setDirty } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [hasSoulFile, setHasSoulFile] = useState(false);

  useEffect(() => {
    if (projectPath) {
      initProject();
    }
  }, [projectPath]);

  const initProject = async () => {
    if (!projectPath) return;
    
    try {
      await initializeProject(projectPath);
      await loadDreamFiles();
      
      const soulExists = await exists(`${projectPath}/soul.md`);
      setHasSoulFile(soulExists);
    } catch (error) {
      console.error('Failed to initialize project:', error);
    }
  };

  const loadDreamFiles = async () => {
    if (!projectPath) return;
    
    setLoading(true);
    try {
      const entries = await readDir(projectPath);
      const dreams = entries
        .filter(entry => entry.name?.endsWith('.dream'))
        .map(entry => entry.name || '');
      setDreamFiles(dreams);
    } catch (error) {
      console.error('Failed to read directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (fileName: string, fileType: 'dream' | 'soul') => {
    if (!projectPath) return;
    
    try {
      const filePath = `${projectPath}/${fileName}`;
      const content = await readTextFile(filePath);
      
      if (fileType === 'dream') {
        const dream = parseDreamFile(content);
        setCurrentFile(filePath, 'dream');
        setCurrentDream(dream);
      } else {
        setCurrentFile(filePath, 'soul');
        setCurrentContent(content);
      }
      
      setDirty(false);
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };

  const handleNewDream = async () => {
    if (!projectPath) return;
    
    try {
      const sessionNumber = dreamFiles.length + 1;
      const newDream = createNewDreamFile(sessionNumber);
      const fileName = `dream-${newDream.frontmatter.session}.dream`;
      const filePath = `${projectPath}/${fileName}`;
      
      await writeTextFile(filePath, serializeDreamFile(newDream));
      await loadDreamFiles();
      
      setCurrentFile(filePath, 'dream');
      setCurrentDream(newDream);
      setDirty(false);
    } catch (error) {
      console.error('Failed to create new dream file:', error);
    }
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No project open</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Navigator
            </div>
            <div className="text-sm text-text-primary mt-1">{projectName}</div>
          </div>
          <Button
            onClick={handleNewDream}
            variant="ghost"
            className="flex items-center gap-1 px-2 py-1 text-xs"
          >
            <Plus className="w-4 h-4" />
            New Dream
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-text-muted">Loading...</div>
        ) : (
          <div className="py-2">
            {hasSoulFile && (
              <button
                onClick={() => handleFileClick('soul.md', 'soul')}
                className="w-full px-4 py-1.5 text-left text-sm text-accent hover:bg-surface transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                soul.md
              </button>
            )}
            
            {dreamFiles.length > 0 && (
              <div className="mt-2">
                <div className="px-4 py-1 text-xs text-text-muted uppercase tracking-wide">
                  Dream Sessions
                </div>
                {dreamFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => handleFileClick(file, 'dream')}
                    className="w-full px-4 py-1.5 text-left text-sm text-text-primary hover:bg-surface transition-colors"
                  >
                    {file}
                  </button>
                ))}
              </div>
            )}
            
            {dreamFiles.length === 0 && !hasSoulFile && (
              <div className="p-4 text-sm text-text-muted">No files yet. Click "New Dream" to start.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
