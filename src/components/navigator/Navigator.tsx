import { FolderOpen, Plus, FileText } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { readDir, writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { useEffect, useState } from 'react';
import { createNewDreamFile, parseDreamFile, serializeDreamFile } from '../../lib/project/dreamFile';
import { initializeProject } from '../../lib/project/project';
import { Button } from '../ui/Button';

interface DreamFileInfo {
  name: string;
  date: Date;
  session: number;
}

export function Navigator() {
  const { projectPath, dreamFiles, setDreamFiles } = useProjectStore();
  const { currentFile, setCurrentFile, setCurrentDream, setCurrentContent, setDirty } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [sortedDreams, setSortedDreams] = useState<DreamFileInfo[]>([]);
  const [hasSoulFile, setHasSoulFile] = useState(false);
  const [hasConfigFile, setHasConfigFile] = useState(false);

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
      
      const configExists = await exists(`${projectPath}/.dreamconfig`);
      setHasConfigFile(configExists);
    } catch (error) {
      console.error('Failed to initialize project:', error);
    }
  };

  const loadDreamFiles = async () => {
    if (!projectPath) return;
    
    setLoading(true);
    try {
      const entries = await readDir(projectPath);
      const dreamFileNames = entries
        .filter(entry => entry.name?.endsWith('.dream'))
        .map(entry => entry.name || '');
      
      setDreamFiles(dreamFileNames);

      const dreamInfos: DreamFileInfo[] = [];
      for (const fileName of dreamFileNames) {
        try {
          const content = await readTextFile(`${projectPath}/${fileName}`);
          const dream = parseDreamFile(content);
          dreamInfos.push({
            name: fileName,
            date: new Date(dream.frontmatter.date),
            session: dream.frontmatter.session,
          });
        } catch {
          continue;
        }
      }

      dreamInfos.sort((a, b) => b.date.getTime() - a.date.getTime());
      setSortedDreams(dreamInfos);
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
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleNewDream}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white py-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Dream
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-text-muted">Loading...</div>
        ) : (
          <div className="py-2">
            {/* Project Files Section */}
            {(hasSoulFile || hasConfigFile) && (
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Project Files
                </div>
                {hasSoulFile && (
                  <button
                    onClick={() => handleFileClick('soul.md', 'soul')}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                      currentFile?.endsWith('soul.md') 
                        ? 'bg-accent/10 text-accent border-l-2 border-accent' 
                        : 'text-text-primary hover:bg-surface/50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    soul.md
                  </button>
                )}
                {hasConfigFile && (
                  <button
                    onClick={() => handleFileClick('.dreamconfig', 'soul')}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                      currentFile?.endsWith('.dreamconfig') 
                        ? 'bg-accent/10 text-accent border-l-2 border-accent' 
                        : 'text-text-muted hover:bg-surface/50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    .dreamconfig
                  </button>
                )}
              </div>
            )}
            
            {/* Dream Sessions Section */}
            {sortedDreams.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Dream Sessions ({sortedDreams.length})
                </div>
                {sortedDreams.map((dream) => (
                  <button
                    key={dream.name}
                    onClick={() => handleFileClick(dream.name, 'dream')}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      currentFile?.endsWith(dream.name) 
                        ? 'bg-accent/10 text-accent border-l-2 border-accent' 
                        : 'text-text-primary hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Session {dream.session}</span>
                      <span className="text-xs text-text-muted">
                        {dream.date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {sortedDreams.length === 0 && !hasSoulFile && (
              <div className="p-4 text-center text-sm text-text-muted">
                <p>No dream sessions yet.</p>
                <p className="mt-1">Create your first.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
