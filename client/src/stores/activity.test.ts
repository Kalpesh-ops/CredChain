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

  it("caps the events list and keeps the newest", () => {
    const state = useActivityStore.getState();
    for (let i = 0; i < 505; i++) {
      state.addEvent({
        type: "certificate_issued" as const,
        timestamp: i,
        txHash: `hash-${i}`,
        data: { id: i, issuer: "iss", recipient: "rec" },
      });
    }
    expect(useActivityStore.getState().events.length).toBe(500);
    expect(useActivityStore.getState().events[0].timestamp).toBe(504);
  });

  it("ignores an event already in the feed", () => {
    const event = {
      type: "certificate_issued" as const,
      timestamp: 10,
      txHash: "dupe",
      data: { id: 7, issuer: "iss", recipient: "rec" },
    };
    const state = useActivityStore.getState();
    state.addEvent(event);
    state.addEvent({ ...event });
    expect(useActivityStore.getState().events).toHaveLength(1);
  });

  it("merges backfilled events newest first without duplicating live ones", () => {
    const state = useActivityStore.getState();
    state.addEvent({
      type: "certificate_issued" as const,
      timestamp: 300,
      txHash: "live",
      data: { id: 3, issuer: "iss", recipient: "rec" },
    });
    state.mergeEvents([
      {
        type: "certificate_issued" as const,
        timestamp: 100,
        txHash: "old",
        data: { id: 1, issuer: "iss", recipient: "rec" },
      },
      {
        type: "certificate_issued" as const,
        timestamp: 300,
        txHash: "live",
        data: { id: 3, issuer: "iss", recipient: "rec" },
      },
    ]);
    const events = useActivityStore.getState().events;
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.timestamp)).toEqual([300, 100]);
  });

  it("treats different certificates in one transaction as separate events", () => {
    const state = useActivityStore.getState();
    state.addEvent({
      type: "certificate_issued" as const,
      timestamp: 5,
      txHash: "batch",
      data: { id: 1, issuer: "iss", recipient: "rec" },
    });
    state.addEvent({
      type: "certificate_issued" as const,
      timestamp: 5,
      txHash: "batch",
      data: { id: 2, issuer: "iss", recipient: "rec" },
    });
    expect(useActivityStore.getState().events).toHaveLength(2);
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
