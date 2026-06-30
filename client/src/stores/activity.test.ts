import { describe, expect, it, beforeEach } from "vitest";
import { useActivityStore } from "./activity";

describe("useActivityStore", () => {
  beforeEach(() => {
    useActivityStore.getState().clearEvents();
  });

  it("starts with empty events", () => {
    expect(useActivityStore.getState().events).toEqual([]);
  });

  it("adds events", () => {
    const event = {
      type: "certificate_issued" as const,
      timestamp: 123456,
      txHash: "0x123",
      data: { id: 1, issuer: "iss", recipient: "rec" },
    };
    useActivityStore.getState().addEvent(event);
    expect(useActivityStore.getState().events).toEqual([event]);
  });

  it("limits events list to 100 items", () => {
    const state = useActivityStore.getState();
    for (let i = 0; i < 105; i++) {
      state.addEvent({
        type: "certificate_issued" as const,
        timestamp: i,
        txHash: `hash-${i}`,
        data: { id: i, issuer: "iss", recipient: "rec" },
      });
    }
    expect(useActivityStore.getState().events.length).toBe(100);
    expect(useActivityStore.getState().events[0].timestamp).toBe(104);
  });

  it("clears events", () => {
    const state = useActivityStore.getState();
    state.addEvent({
      type: "institution_registered" as const,
      timestamp: 123,
      txHash: "hash",
      data: { addr: "addr" },
    });
    state.clearEvents();
    expect(useActivityStore.getState().events).toEqual([]);
  });

  it("updates sync status and last synced timestamp", () => {
    const store = useActivityStore.getState();
    expect(store.syncStatus).toBe("connected");
    expect(store.lastSyncedAt).toBeNull();

    store.setSyncStatus("syncing");
    expect(useActivityStore.getState().syncStatus).toBe("syncing");

    const now = Math.floor(Date.now() / 1000);
    store.setLastSyncedAt(now);
    expect(useActivityStore.getState().lastSyncedAt).toBe(now);
  });
});
