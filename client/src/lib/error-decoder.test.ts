import { describe, expect, it } from "vitest";
import { decodeError } from "./error-decoder";

describe("decodeError — contract revert codes", () => {
  // These assertions pin the decoder to the ContractError enum in
  // contract/src/lib.rs. If that enum is reordered, these tests must fail.
  const cases: Array<[number, string]> = [
    [1, "CONTRACT_NOT_REGISTERED"],
    [2, "CONTRACT_ALREADY_REGISTERED"],
    [3, "CONTRACT_NOT_AUTHORIZED"],
    [4, "CONTRACT_CERTIFICATE_NOT_FOUND"],
    [5, "CONTRACT_ALREADY_REVOKED"],
    [6, "CONTRACT_INVALID_INPUT"],
  ];

  it.each(cases)("maps Error(Contract, U32(%i)) to %s", (code, expected) => {
    const err = new Error(
      `HostError: Error(Contract, U32(${code})) during simulation`
    );
    expect(decodeError(err).code).toBe(expected);
  });

  it.each(cases)("maps a bare U32(%i) to %s", (code, expected) => {
    expect(decodeError(`U32(${code})`).code).toBe(expected);
  });

  it("has no code-7 branch — the enum only defines 1 through 6", () => {
    // Should fall through to the generic handler, not a CONTRACT_* code.
    expect(decodeError("Error(Contract, U32(7))").code).toBe("LEDGER_TX_FAILED");
  });
});

describe("decodeError — wallet and network errors", () => {
  it("detects user rejection", () => {
    expect(decodeError(new Error("User rejected request")).code).toBe(
      "WALLET_REJECTED"
    );
  });

  it("detects a closed signing popup", () => {
    expect(decodeError(new Error("user closed the popup")).code).toBe(
      "WALLET_CLOSED"
    );
  });

  it("detects a missing wallet extension", () => {
    expect(decodeError(new Error("Freighter is not installed")).code).toBe(
      "WALLET_NOT_INSTALLED"
    );
  });

  it("detects an underfunded account", () => {
    expect(decodeError(new Error("tx failed: op_underfunded")).code).toBe(
      "TX_UNDERFUNDED"
    );
  });

  it("detects rate limiting", () => {
    expect(decodeError(new Error("429 Too Many Requests")).code).toBe(
      "HTTP_RATE_LIMIT"
    );
  });
});

describe("decodeError — edge cases", () => {
  it("handles null and undefined", () => {
    expect(decodeError(null).code).toBe("UNKNOWN");
    expect(decodeError(undefined).code).toBe("UNKNOWN");
  });

  it("accepts a raw string message", () => {
    expect(decodeError("User rejected request").code).toBe("WALLET_REJECTED");
  });

  it("always returns a populated shape", () => {
    const decoded = decodeError(new Error("something entirely unexpected"));
    expect(decoded.title).toBeTruthy();
    expect(decoded.description).toBeTruthy();
    expect(decoded.remedy).toBeTruthy();
    expect(["low", "medium", "high", "critical"]).toContain(decoded.severity);
  });
});
