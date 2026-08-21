import { describe, expect, it } from "vitest";
import { expiryFor, isExpired, parseSession } from "./wallet-session";

const NOW = 1_800_000_000_000;

describe("wallet session expiry", () => {
  it("gives a browser-session choice no expiry", () => {
    expect(expiryFor("session", NOW)).toBeNull();
  });

  it("offsets fixed durations from now", () => {
    expect(expiryFor("1d", NOW)).toBe(NOW + 86_400_000);
    expect(expiryFor("7d", NOW)).toBe(NOW + 7 * 86_400_000);
    expect(expiryFor("30d", NOW)).toBe(NOW + 30 * 86_400_000);
  });

  it("never expires a session with no expiry", () => {
    const session = { address: "G1", walletName: null, expiresAt: null };
    expect(isExpired(session, NOW + 10 * 365 * 86_400_000)).toBe(false);
  });

  it("expires only after the deadline passes", () => {
    const session = { address: "G1", walletName: null, expiresAt: NOW };
    expect(isExpired(session, NOW - 1)).toBe(false);
    expect(isExpired(session, NOW)).toBe(false);
    expect(isExpired(session, NOW + 1)).toBe(true);
  });
});

describe("wallet session parsing", () => {
  it("round-trips a stored session", () => {
    const session = {
      address: "GDLQBRN3FUDPD2U24Z7GQF7VRM5DW3CV2Y4WVPQLOV7WLX536F6ZPKIA",
      walletName: "freighter" as const,
      expiresAt: NOW,
    };
    expect(parseSession(JSON.stringify(session))).toEqual(session);
  });

  it("returns null for absent or unparsable values", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("")).toBeNull();
    expect(parseSession("not json")).toBeNull();
  });

  it("rejects a payload without a usable address", () => {
    expect(parseSession(JSON.stringify({ expiresAt: null }))).toBeNull();
    expect(parseSession(JSON.stringify({ address: "", expiresAt: null }))).toBeNull();
    expect(parseSession(JSON.stringify({ address: 42, expiresAt: null }))).toBeNull();
  });

  it("rejects a non-numeric expiry rather than trusting it", () => {
    expect(
      parseSession(JSON.stringify({ address: "G1", expiresAt: "soon" }))
    ).toBeNull();
  });

  it("defaults a missing wallet name to null", () => {
    expect(parseSession(JSON.stringify({ address: "G1", expiresAt: null }))).toEqual({
      address: "G1",
      walletName: null,
      expiresAt: null,
    });
  });
});
