import { create } from 'zustand';
import { SoulUpdateProposal } from '../lib/soul/soulUpdater';

interface SoulStore {
  updateProposal: SoulUpdateProposal | null;
  showUpdateModal: boolean;
  setUpdateProposal: (proposal: SoulUpdateProposal | null) => void;
  setShowUpdateModal: (show: boolean) => void;
  clearProposal: () => void;
}

export const useSoulStore = create<SoulStore>((set) => ({
  updateProposal: null,
  showUpdateModal: false,
  setUpdateProposal: (proposal) => set({ updateProposal: proposal }),
  setShowUpdateModal: (show) => set({ showUpdateModal: show }),
  clearProposal: () => set({ updateProposal: null, showUpdateModal: false }),
}));
