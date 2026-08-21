import { create } from "zustand";
import type { ActivityEvent } from "@/types";

interface ActivityStore {
  events: ActivityEvent[];
  syncStatus: "connected" | "syncing" | "error";
  lastSyncedAt: number | null;
  historyStatus: "idle" | "loading" | "ready" | "error";
  addEvent: (event: ActivityEvent) => void;
  mergeEvents: (events: ActivityEvent[]) => void;
  clearEvents: () => void;
  setSyncStatus: (status: "connected" | "syncing" | "error") => void;
  setHistoryStatus: (status: "idle" | "loading" | "ready" | "error") => void;
  setLastSyncedAt: (timestamp: number) => void;
}

const MAX_EVENTS = 500;

/** Backfill and the live poller overlap, so events need a stable identity. */
function eventKey(event: ActivityEvent): string {
  const detail = event.data.id ?? event.data.addr ?? "";
  return `${event.txHash}:${event.type}:${detail}`;
}

function combine(
  existing: ActivityEvent[],
  incoming: ActivityEvent[]
): ActivityEvent[] {
  const byKey = new Map(existing.map((e) => [eventKey(e), e]));
  for (const event of incoming) {
    if (!byKey.has(eventKey(event))) byKey.set(eventKey(event), event);
  }
  return [...byKey.values()]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_EVENTS);
}

export const useActivityStore = create<ActivityStore>((set) => ({
  events: [],
  syncStatus: "connected",
  lastSyncedAt: null,
  historyStatus: "idle",

  addEvent: (event) =>
    set((state) => ({ events: combine(state.events, [event]) })),

  mergeEvents: (events) =>
    set((state) => ({ events: combine(state.events, events) })),

  clearEvents: () => set({ events: [] }),
  setHistoryStatus: (status) => set({ historyStatus: status }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
}));
