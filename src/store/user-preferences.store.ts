import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
  sessionsViewMode: "grid" | "list";
  setSessionsViewMode: (mode: "grid" | "list") => void;
}

export const useUserPreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      sessionsViewMode: "grid",
      setSessionsViewMode: (mode) => set({ sessionsViewMode: mode }),
    }),
    {
      name: "roomscluster-preferences",
    }
  )
);
