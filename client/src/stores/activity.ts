import { create } from "zustand";
import type { ActivityEvent } from "@/types";

interface ActivityStore {
  events: ActivityEvent[];
  syncStatus: "connected" | "syncing" | "error";
  lastSyncedAt: number | null;
  addEvent: (event: ActivityEvent) => void;
  clearEvents: () => void;
  setSyncStatus: (status: "connected" | "syncing" | "error") => void;
  setLastSyncedAt: (timestamp: number) => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  events: [],
  syncStatus: "connected",
  lastSyncedAt: null,

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100),
    })),

  clearEvents: () => set({ events: [] }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
}));
