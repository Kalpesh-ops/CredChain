import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import {
  buildFeedbackMessage,
  isTimestampFresh,
  SIGNATURE_MAX_AGE_MS,
} from "./feedback-message";

const payload = {
  address: "GABCD",
  rating: 5,
  category: "General",
  comment: "Works well.",
  timestamp: "2026-08-11T00:00:00.000Z",
};

describe("buildFeedbackMessage", () => {
  it("produces a stable, ordered payload", () => {
    expect(buildFeedbackMessage(payload)).toBe(
      [
        "CredChain feedback",
        "address:GABCD",
        "rating:5",
        "category:General",
        "timestamp:2026-08-11T00:00:00.000Z",
        "comment:Works well.",
      ].join("\n")
    );
  });

  it("changes when any field changes", () => {
    const base = buildFeedbackMessage(payload);
    expect(buildFeedbackMessage({ ...payload, rating: 1 })).not.toBe(base);
    expect(buildFeedbackMessage({ ...payload, comment: "Bad." })).not.toBe(base);
    expect(buildFeedbackMessage({ ...payload, address: "GZZZZ" })).not.toBe(base);
  });
});

describe("isTimestampFresh", () => {
  const now = Date.parse("2026-08-11T00:00:00.000Z");

  it("accepts a current timestamp", () => {
    expect(isTimestampFresh("2026-08-11T00:00:00.000Z", now)).toBe(true);
  });

  it("rejects a timestamp older than the replay window", () => {
    const stale = new Date(now - SIGNATURE_MAX_AGE_MS - 1000).toISOString();
    expect(isTimestampFresh(stale, now)).toBe(false);
  });

  it("rejects a timestamp too far in the future", () => {
    const future = new Date(now + SIGNATURE_MAX_AGE_MS + 1000).toISOString();
    expect(isTimestampFresh(future, now)).toBe(false);
  });

  it("rejects unparseable input", () => {
    expect(isTimestampFresh("not-a-date", now)).toBe(false);
    expect(isTimestampFresh("", now)).toBe(false);
  });
});

describe("signature round-trip", () => {
  // Proves the server's verification logic is correct given a signature over the
  // raw UTF-8 message bytes. Whether a given browser wallet signs exactly these
  // bytes is a separate, wallet-specific question that needs a live check.
  it("verifies a signature produced over the canonical message", () => {
    const kp = Keypair.random();
    const signed = { ...payload, address: kp.publicKey() };
    const message = buildFeedbackMessage(signed);

    const signature = kp.sign(Buffer.from(message, "utf-8"));

    expect(
      Keypair.fromPublicKey(signed.address).verify(
        Buffer.from(message, "utf-8"),
        signature
      )
    ).toBe(true);
  });

  it("rejects a signature when the comment is altered after signing", () => {
    const kp = Keypair.random();
    const signed = { ...payload, address: kp.publicKey() };
    const signature = kp.sign(
      Buffer.from(buildFeedbackMessage(signed), "utf-8")
    );

    const tampered = buildFeedbackMessage({
      ...signed,
      comment: "Totally different review.",
    });

    expect(
      Keypair.fromPublicKey(signed.address).verify(
        Buffer.from(tampered, "utf-8"),
        signature
      )
    ).toBe(false);
  });

  it("rejects a signature presented under a different address", () => {
    const kp = Keypair.random();
    const other = Keypair.random();
    const signed = { ...payload, address: kp.publicKey() };
    const message = buildFeedbackMessage(signed);
    const signature = kp.sign(Buffer.from(message, "utf-8"));

    expect(
      Keypair.fromPublicKey(other.publicKey()).verify(
        Buffer.from(message, "utf-8"),
        signature
      )
    ).toBe(false);
  });
});
