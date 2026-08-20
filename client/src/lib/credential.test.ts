import { describe, expect, it } from "vitest";
import { encodeCredential, decodeCredential } from "./credential";

describe("credential metadata codec", () => {
  it("round-trips holder and title", () => {
    const metadata = { holder: "Ada Lovelace", title: "BSc Computer Science" };
    expect(decodeCredential(encodeCredential(metadata))).toEqual(metadata);
  });

  it("round-trips non-ASCII names", () => {
    const metadata = { holder: "José Ñuñez 学", title: "Diplôme d'Ingénieur" };
    expect(decodeCredential(encodeCredential(metadata))).toEqual(metadata);
  });

  it("produces a data URI the ledger can hold as a string", () => {
    const uri = encodeCredential({ holder: "Ada", title: "BSc" });
    expect(uri.startsWith("data:application/json;base64,")).toBe(true);
  });

  it("returns null for a legacy plain URI", () => {
    expect(decodeCredential("ipfs://demo/meridian/msc-data-science-2026")).toBeNull();
    expect(decodeCredential("creduni://testuri")).toBeNull();
  });

  it("returns null for a malformed payload", () => {
    expect(decodeCredential("data:application/json;base64,!!!not-base64")).toBeNull();
    expect(decodeCredential("data:application/json;base64," + btoa("nope"))).toBeNull();
  });

  it("returns null when required fields are missing or wrong type", () => {
    const missing = "data:application/json;base64," + btoa('{"holder":"Ada"}');
    const wrongType = "data:application/json;base64," + btoa('{"holder":"Ada","title":7}');
    expect(decodeCredential(missing)).toBeNull();
    expect(decodeCredential(wrongType)).toBeNull();
  });
});
