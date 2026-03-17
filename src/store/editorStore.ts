import { create } from 'zustand';
import { DreamFile, DreamFrontmatter } from '../lib/project/dreamFile';

interface EditorStore {
  currentFile: string | null;
  currentDream: DreamFile | null;
  currentContent: string;
  isDirty: boolean;
  fileType: 'dream' | 'soul' | 'other';
  setCurrentFile: (file: string | null, type: 'dream' | 'soul' | 'other') => void;
  setCurrentDream: (dream: DreamFile) => void;
  setCurrentContent: (content: string) => void;
  updateFrontmatter: (frontmatter: Partial<DreamFrontmatter>) => void;
  updateBody: (body: string) => void;
  setDirty: (dirty: boolean) => void;
  clearEditor: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentFile: null,
  currentDream: null,
  currentContent: '',
  isDirty: false,
  fileType: 'other',
  setCurrentFile: (file: string | null, type: 'dream' | 'soul' | 'other') => 
    set({ currentFile: file, fileType: type }),
  setCurrentDream: (dream: DreamFile) => 
    set({ currentDream: dream, isDirty: false }),
  setCurrentContent: (content: string) => 
    set({ currentContent: content, isDirty: true }),
  updateFrontmatter: (frontmatter: Partial<DreamFrontmatter>) =>
    set((state) => {
      if (!state.currentDream) return state;
      return {
        currentDream: {
          ...state.currentDream,
          frontmatter: { ...state.currentDream.frontmatter, ...frontmatter },
        },
        isDirty: true,
      };
    }),
  updateBody: (body: string) =>
    set((state) => {
      if (!state.currentDream) return state;
      return {
        currentDream: { ...state.currentDream, content: body },
        isDirty: true,
      };
    }),
  setDirty: (dirty: boolean) => set({ isDirty: dirty }),
  clearEditor: () => set({ 
    currentFile: null, 
    currentDream: null,
    currentContent: '', 
    isDirty: false,
    fileType: 'other',
  }),
}));
