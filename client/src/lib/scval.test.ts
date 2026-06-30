import { describe, expect, it } from "vitest";
import {
  toScValString,
  toScValU32,
  toScValI128,
  toScValAddress,
  toScValBool,
  toScValU64,
  toScValSymbol,
  fromScVal,
} from "./scval";

describe("ScVal helper converters", () => {
  it("converts strings to ScVal and back", () => {
    const value = "Hello Stellar";
    const scVal = toScValString(value);
    expect(scVal).toBeDefined();
    expect(fromScVal(scVal)).toBe(value);
  });

  it("converts u32 to ScVal and back", () => {
    const value = 42;
    const scVal = toScValU32(value);
    expect(scVal).toBeDefined();
    expect(fromScVal(scVal)).toBe(value);
  });

  it("converts booleans to ScVal and back", () => {
    const valTrue = toScValBool(true);
    const valFalse = toScValBool(false);
    expect(fromScVal(valTrue)).toBe(true);
    expect(fromScVal(valFalse)).toBe(false);
  });

  it("converts u64 to ScVal and back", () => {
    const value = 12345678;
    const scVal = toScValU64(value);
    expect(scVal).toBeDefined();
    expect(BigInt(fromScVal(scVal) as number | bigint)).toBe(BigInt(value));
  });

  it("converts symbols to ScVal and back", () => {
    const value = "my_symbol";
    const scVal = toScValSymbol(value);
    expect(scVal).toBeDefined();
    expect(fromScVal(scVal)).toBe(value);
  });

  it("converts i128 to ScVal and back", () => {
    const value = 1000000000000000n;
    const scVal = toScValI128(value);
    expect(scVal).toBeDefined();
    expect(fromScVal(scVal)).toBe(value);
  });
});
