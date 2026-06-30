import { describe, expect, it } from "vitest";
import { truncateAddress, formatTimestamp, getExplorerUrl, cn } from "./utils";

describe("Utility helper functions", () => {
  describe("cn", () => {
    it("combines class names", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", false && "class2", "class3")).toBe("class1 class3");
    });
  });

  describe("truncateAddress", () => {
    it("returns empty string for falsy input", () => {
      expect(truncateAddress("")).toBe("");
    });

    it("truncates Stellar addresses correctly", () => {
      const address = "CBMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFE";
      expect(truncateAddress(address)).toBe("CBMYQY...AQDXFE");
      expect(truncateAddress(address, 4)).toBe("CBMY...DXFE");
    });
  });

  describe("formatTimestamp", () => {
    it("formats unix timestamp to readable local string", () => {
      const ts = 1719760800; // 30 June 2024
      const result = formatTimestamp(ts);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("getExplorerUrl", () => {
    it("generates correct transaction URLs", () => {
      expect(getExplorerUrl("tx", "hash123")).toBe("https://stellar.expert/explorer/testnet/tx/hash123");
      expect(getExplorerUrl("tx", "hash123", "mainnet")).toBe("https://stellar.expert/explorer/public/tx/hash123");
    });

    it("generates correct account URLs", () => {
      expect(getExplorerUrl("account", "GAAA")).toBe("https://stellar.expert/explorer/testnet/account/GAAA");
    });

    it("generates correct contract URLs", () => {
      expect(getExplorerUrl("contract", "CAAA")).toBe("https://stellar.expert/explorer/testnet/contract/CAAA");
    });
  });
});
