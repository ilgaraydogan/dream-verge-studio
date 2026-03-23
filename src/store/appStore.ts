import { create } from 'zustand';

type AppMode = 'installer' | 'welcome' | 'project' | 'playground';

interface AppState {
  mode: AppMode;
  recentProjects: string[];
  setMode: (mode: AppMode) => void;
  addRecentProject: (path: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'installer',
  recentProjects: [],
  
  setMode: (mode) => set({ mode }),
  
  addRecentProject: (path) => 
    set((state) => {
      const filtered = state.recentProjects.filter(p => p !== path);
      return {
        recentProjects: [path, ...filtered].slice(0, 5),
      };
    }),
}));
