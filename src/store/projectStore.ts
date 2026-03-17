import { create } from 'zustand';

interface ProjectStore {
  projectPath: string | null;
  projectName: string | null;
  dreamFiles: string[];
  setProjectPath: (path: string) => void;
  setDreamFiles: (files: string[]) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projectPath: null,
  projectName: null,
  dreamFiles: [],
  setProjectPath: (path: string) => {
    const name = path.split('/').pop() || 'Untitled';
    set({ projectPath: path, projectName: name });
  },
  setDreamFiles: (files: string[]) => set({ dreamFiles: files }),
  clearProject: () => set({ projectPath: null, projectName: null, dreamFiles: [] }),
}));
