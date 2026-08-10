import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { connectionString, isConfigured } from "./feedback-store";

const MANAGED = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "NEON_DATABASE_URL",
  "credchain_DATABASE_URL",
  "credchain_DATABASE_URL_UNPOOLED",
  "credchain_POSTGRES_URL",
  "credchain_POSTGRES_URL_NON_POOLING",
  "credchain_POSTGRES_URL_NO_SSL",
  "other_DATABASE_URL",
];

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const k of MANAGED) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of MANAGED) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("connectionString", () => {
  it("returns null when nothing is set", () => {
    expect(connectionString()).toBeNull();
    expect(isConfigured()).toBe(false);
  });

  it("prefers the exact DATABASE_URL", () => {
    process.env.DATABASE_URL = "postgres://exact";
    process.env.credchain_DATABASE_URL = "postgres://prefixed";
    expect(connectionString()).toBe("postgres://exact");
  });

  it("finds a prefixed DATABASE_URL from a Vercel storage integration", () => {
    process.env.credchain_DATABASE_URL = "postgres://prefixed";
    expect(connectionString()).toBe("postgres://prefixed");
    expect(isConfigured()).toBe(true);
  });

  it("never selects the unpooled or no-SSL variants", () => {
    process.env.credchain_DATABASE_URL_UNPOOLED = "postgres://unpooled";
    process.env.credchain_POSTGRES_URL_NON_POOLING = "postgres://nonpooling";
    process.env.credchain_POSTGRES_URL_NO_SSL = "postgres://nossl";
    // None of these should match — the anchored suffixes exclude them.
    expect(connectionString()).toBeNull();
  });

  it("prefers a prefixed DATABASE_URL over a prefixed POSTGRES_URL", () => {
    process.env.credchain_POSTGRES_URL = "postgres://pg";
    process.env.credchain_DATABASE_URL = "postgres://db";
    expect(connectionString()).toBe("postgres://db");
  });

  it("strips surrounding quotes and whitespace", () => {
    process.env.DATABASE_URL = '  "postgres://quoted"  ';
    expect(connectionString()).toBe("postgres://quoted");
  });

  it("treats an empty or whitespace-only value as unset", () => {
    process.env.DATABASE_URL = "   ";
    expect(connectionString()).toBeNull();
  });

  it("is deterministic when several prefixes are present", () => {
    process.env.credchain_DATABASE_URL = "postgres://a";
    process.env.other_DATABASE_URL = "postgres://b";
    expect(connectionString()).toBe(connectionString());
  });
});
