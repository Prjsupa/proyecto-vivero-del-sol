
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Branch = 'vivero-del-sol' | 'prueba';

interface BranchState {
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
}

const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      activeBranch: 'vivero-del-sol', // Default branch
      setActiveBranch: (branch) => set({ activeBranch: branch }),
    }),
    {
      name: 'branch-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useBranchStore;
