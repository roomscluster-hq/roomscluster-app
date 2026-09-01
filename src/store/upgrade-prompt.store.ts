import { create } from "zustand";

interface UpgradePromptState {
  isOpen: boolean;
  message: string;
  suggestedPlan: "PRO" | "BUSINESS" | null;
  show: (message: string, suggestedPlan: "PRO" | "BUSINESS" | null) => void;
  close: () => void;
}

export const useUpgradePromptStore = create<UpgradePromptState>((set) => ({
  isOpen: false,
  message: "",
  suggestedPlan: null,
  show: (message, suggestedPlan) => set({ isOpen: true, message, suggestedPlan }),
  close: () => set({ isOpen: false }),
}));