import { Sparkles, FolderOpen, Folder } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useProjectStore } from '../store/projectStore';
import { open } from '@tauri-apps/plugin-dialog';

export function WelcomeScreen() {
  const { setMode, recentProjects, addRecentProject } = useAppStore();
  const { setProjectPath } = useProjectStore();

  const handleOpenProject = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Dream Project Folder',
      });

      if (selected && typeof selected === 'string') {
        setProjectPath(selected);
        addRecentProject(selected);
        setMode('project');
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const handleOpenRecent = (path: string) => {
    setProjectPath(path);
    setMode('project');
  };

  const handlePlayground = () => {
    setMode('playground');
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <div className="w-full max-w-5xl h-[600px] bg-surface border border-border flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center justify-center py-12 border-b border-border">
          <div className="flex items-center justify-center w-16 h-16 bg-accent text-white text-2xl font-bold mb-4">
            DV
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Dream Verge Studio</h1>
          <p className="text-sm text-text-muted mt-1">v0.1.0-alpha.2</p>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Recent Projects */}
          <div className="w-64 border-r border-border p-4">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Recent Projects
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="space-y-1">
                {recentProjects.map((path) => (
                  <button
                    key={path}
                    onClick={() => handleOpenRecent(path)}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Folder className="w-4 h-4 text-text-muted" />
                    <span className="truncate">{path.split('/').pop()}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No recent projects</p>
            )}

            <button
              onClick={handleOpenProject}
              className="w-full mt-4 px-3 py-2 text-sm text-accent hover:bg-background transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Open Other...
            </button>
          </div>

          {/* Right: Mode Cards */}
          <div className="flex-1 flex items-center justify-center gap-6 p-8">
            {/* Project Mode Card */}
            <button
              onClick={handleOpenProject}
              className="group w-80 p-6 bg-background border border-border hover:border-accent transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <FolderOpen className="w-6 h-6 text-accent" />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">New Project</h3>
                  <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent border border-accent/30">
                    Beta
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Professional dream analysis IDE. Patient folders, multi-model AI, flagging system, and cross-session pattern detection.
              </p>
            </button>

            {/* Playground Mode Card */}
            <button
              onClick={handlePlayground}
              className="group w-80 p-6 bg-background border border-border hover:border-accent transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-accent" />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">Playground</h3>
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 border border-green-500/30">
                    New
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Just type your dream and get instant AI analysis. No setup required. No API key needed.
              </p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-text-muted">
          <span>github.com/ilgaraydogan/dream-verge-studio</span>
          <span>MIT License</span>
        </div>
      </div>
    </div>
  );
}
