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
      const address = "CBZ5KPEROYIQ2YDDACVIXUMWUIZAVND5A4N6W4LSQOH7YOF7ADO6GAHO";
      expect(truncateAddress(address)).toBe("CBZ5KP...O6GAHO");
      expect(truncateAddress(address, 4)).toBe("CBZ5...GAHO");
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
