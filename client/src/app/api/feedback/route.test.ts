import { describe, expect, it, vi, beforeEach } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { buildFeedbackMessage } from "@/lib/feedback-message";

// The store is mocked so these tests exercise the route's own behaviour:
// attribution, signature verification, and — critically — that a failed write
// is reported as a failure rather than dressed up as success.
const listFeedbacks = vi.fn();
const saveFeedback = vi.fn();
const isConfigured = vi.fn();

vi.mock("@/lib/feedback-store", () => ({
  listFeedbacks: () => listFeedbacks(),
  saveFeedback: (item: unknown) => saveFeedback(item),
  isConfigured: () => isConfigured(),
}));

const { GET, POST } = await import("./route");

function post(body: unknown) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  isConfigured.mockReturnValue(true);
  saveFeedback.mockResolvedValue(true);
  listFeedbacks.mockResolvedValue({ status: "ready", items: [] });
});

describe("GET /api/feedback", () => {
  it("returns 503 and an explanation when no database is configured", async () => {
    listFeedbacks.mockResolvedValue({ status: "unconfigured" });
    const res = await GET();
    const body = await res.json();

    // An empty 200 here would be indistinguishable from a genuinely empty
    // forum, which is how the previous version hid that nothing persisted.
    expect(res.status).toBe(503);
    expect(body.persistence).toBe("unconfigured");
    expect(body.error).toBeTruthy();
  });

  it("returns 503 when the database is unreachable", async () => {
    listFeedbacks.mockResolvedValue({ status: "unreachable" });
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).persistence).toBe("unreachable");
  });

  it("returns the stored items when ready", async () => {
    const items = [{ id: "fb-1", address: "Anonymous User", rating: 5 }];
    listFeedbacks.mockResolvedValue({ status: "ready", items });
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.feedbacks).toEqual(items);
  });
});

describe("POST /api/feedback — attribution", () => {
  it("ignores a claimed address when no signature is supplied", async () => {
    const victim = Keypair.random().publicKey();
    const res = await POST(post({ address: victim, comment: "not mine", rating: 5 }));

    expect(res.status).toBe(200);
    const saved = saveFeedback.mock.calls[0][0];
    expect(saved.address).toBe("Anonymous User");
    expect(saved.walletType).toBe("Direct Input");
  });

  it("attributes a correctly signed submission", async () => {
    const kp = Keypair.random();
    const timestamp = new Date().toISOString();
    const fields = {
      rating: 4,
      category: "General",
      comment: "Genuinely mine.",
      timestamp,
    };
    const signature = kp
      .sign(
        Buffer.from(
          buildFeedbackMessage({ address: kp.publicKey(), ...fields }),
          "utf-8"
        )
      )
      .toString("base64");

    const res = await POST(post({ address: kp.publicKey(), ...fields, signature }));

    expect(res.status).toBe(200);
    const saved = saveFeedback.mock.calls[0][0];
    expect(saved.address).toBe(kp.publicKey());
    expect(saved.walletType).toBe("Wallet Signed");
  });

  it("rejects a signature presented under someone else's address", async () => {
    const attacker = Keypair.random();
    const victim = Keypair.random();
    const timestamp = new Date().toISOString();
    const fields = { rating: 1, category: "General", comment: "Forged.", timestamp };

    // Attacker signs with their own key but claims the victim's address.
    const signature = attacker
      .sign(
        Buffer.from(
          buildFeedbackMessage({ address: victim.publicKey(), ...fields }),
          "utf-8"
        )
      )
      .toString("base64");

    const res = await POST(post({ address: victim.publicKey(), ...fields, signature }));

    expect(res.status).toBe(401);
    expect(saveFeedback).not.toHaveBeenCalled();
  });

  it("rejects a signature whose content was altered after signing", async () => {
    const kp = Keypair.random();
    const timestamp = new Date().toISOString();
    const fields = { rating: 5, category: "General", comment: "Original.", timestamp };
    const signature = kp
      .sign(
        Buffer.from(
          buildFeedbackMessage({ address: kp.publicKey(), ...fields }),
          "utf-8"
        )
      )
      .toString("base64");

    const res = await POST(
      post({ address: kp.publicKey(), ...fields, comment: "Swapped.", signature })
    );

    expect(res.status).toBe(401);
    expect(saveFeedback).not.toHaveBeenCalled();
  });

  it("rejects a replayed submission outside the freshness window", async () => {
    const kp = Keypair.random();
    const timestamp = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fields = { rating: 5, category: "General", comment: "Old.", timestamp };
    const signature = kp
      .sign(
        Buffer.from(
          buildFeedbackMessage({ address: kp.publicKey(), ...fields }),
          "utf-8"
        )
      )
      .toString("base64");

    const res = await POST(post({ address: kp.publicKey(), ...fields, signature }));
    expect(res.status).toBe(401);
  });
});

describe("POST /api/feedback — persistence honesty", () => {
  it("reports 503 when the write does not reach the database", async () => {
    saveFeedback.mockResolvedValue(false);
    const res = await POST(post({ comment: "will not persist", rating: 5 }));

    expect(res.status).toBe(503);
    expect((await res.json()).success).toBeUndefined();
  });

  it("refuses to accept posts when no database is configured", async () => {
    isConfigured.mockReturnValue(false);
    const res = await POST(post({ comment: "nowhere to go", rating: 5 }));

    expect(res.status).toBe(503);
    expect(saveFeedback).not.toHaveBeenCalled();
  });

  it("rejects an empty comment", async () => {
    const res = await POST(post({ comment: "   ", rating: 5 }));
    expect(res.status).toBe(400);
    expect(saveFeedback).not.toHaveBeenCalled();
  });

  it("clamps an out-of-range rating instead of storing it", async () => {
    await POST(post({ comment: "ok", rating: 99 }));
    expect(saveFeedback.mock.calls[0][0].rating).toBe(5);
  });
});
