import { create } from "zustand";
import type { ActivityEvent } from "@/types";

interface ActivityStore {
  events: ActivityEvent[];
  addEvent: (event: ActivityEvent) => void;
  clearEvents: () => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  events: [],

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100),
    })),

  clearEvents: () => set({ events: [] }),
}));
