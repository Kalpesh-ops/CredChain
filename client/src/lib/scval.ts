import { Address, nativeToScVal, scValToNative, xdr } from "@stellar/stellar-sdk";

export function toScValString(v: string): xdr.ScVal {
  return nativeToScVal(v, { type: "string" });
}

export function toScValU32(v: number): xdr.ScVal {
  return nativeToScVal(v, { type: "u32" });
}

export function toScValI128(v: bigint | number): xdr.ScVal {
  return nativeToScVal(v, { type: "i128" });
}

export function toScValAddress(v: string): xdr.ScVal {
  return new Address(v).toScVal();
}

export function toScValBool(v: boolean): xdr.ScVal {
  return nativeToScVal(v);
}

export function toScValU64(v: number): xdr.ScVal {
  return nativeToScVal(v, { type: "u64" });
}

export function toScValSymbol(v: string): xdr.ScVal {
  return nativeToScVal(v, { type: "symbol" });
}

export function fromScVal(val: xdr.ScVal): unknown {
  return scValToNative(val);
}
