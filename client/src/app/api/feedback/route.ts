import { NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import {
  listFeedbacks,
  saveFeedback,
  isConfigured,
  type FeedbackItem,
} from "@/lib/feedback-store";
import { buildFeedbackMessage, isTimestampFresh } from "@/lib/feedback-message";

export type { FeedbackItem };

/** Human-readable explanation for each non-ready store status. */
const STORE_ERRORS = {
  unconfigured:
    "The community forum has no database configured. Set DATABASE_URL to enable it.",
  unreachable:
    "The forum database could not be reached. It may still be waking up — try again in a moment.",
} as const;

export async function GET() {
  const result = await listFeedbacks();

  if (result.status !== "ready") {
    // Report the real state. Returning an empty list here would render an
    // indistinguishable "no posts yet" screen whether the forum was empty or
    // completely broken — which is exactly how the previous version hid the
    // fact that nothing was ever being persisted.
    return NextResponse.json(
      {
        feedbacks: [],
        persistence: result.status,
        error: STORE_ERRORS[result.status],
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    feedbacks: result.items,
    persistence: "ready",
  });
}

/**
 * Verifies that `signature` is a valid Ed25519 signature over the canonical
 * feedback message for `address`. Returns false for any malformed input rather
 * than throwing — a bad signature and a bad public key are both just "unverified".
 */
function verifyFeedbackSignature(
  address: string,
  signature: string,
  rating: number,
  category: string,
  comment: string,
  timestamp: string
): boolean {
  try {
    if (!isTimestampFresh(timestamp)) return false;
    const message = buildFeedbackMessage({
      address,
      rating,
      category,
      comment,
      timestamp,
    });
    return Keypair.fromPublicKey(address).verify(
      Buffer.from(message, "utf-8"),
      Buffer.from(signature, "base64")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: STORE_ERRORS.unconfigured, persistence: "unconfigured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  const { address, rating, category, comment, timestamp, signature } = body as {
    address?: string;
    rating?: number;
    category?: string;
    comment?: string;
    timestamp?: string;
    signature?: string;
  };

  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return NextResponse.json(
      { error: "Comment is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const sanitizedComment = comment.trim().substring(0, 500);
  const sanitizedCategory = String(category || "General").trim().substring(0, 50);
  const sanitizedRating = Math.max(1, Math.min(5, Math.floor(Number(rating) || 5)));
  const sanitizedTimestamp = String(timestamp || new Date().toISOString()).substring(0, 50);

  // Attribution is derived from a verified signature, never from the request
  // body. An unsigned submission is always anonymous, no matter what `address`
  // the caller sent.
  let attributedAddress = "Anonymous User";
  let attributedWalletType = "Direct Input";

  if (signature) {
    const claimedAddress = String(address || "").trim();
    const verified = verifyFeedbackSignature(
      claimedAddress,
      String(signature),
      sanitizedRating,
      sanitizedCategory,
      sanitizedComment,
      sanitizedTimestamp
    );

    if (!verified) {
      return NextResponse.json(
        {
          error:
            "Signature verification failed. The signature does not match the submitted content or address, or the request has expired.",
        },
        { status: 401 }
      );
    }

    attributedAddress = claimedAddress.substring(0, 100);
    attributedWalletType = "Wallet Signed";
  }

  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    address: attributedAddress,
    rating: sanitizedRating,
    category: sanitizedCategory,
    comment: sanitizedComment,
    timestamp: sanitizedTimestamp,
    walletType: attributedWalletType,
  };

  const saved = await saveFeedback(newItem);
  if (!saved) {
    return NextResponse.json(
      { error: STORE_ERRORS.unreachable, persistence: "unreachable" },
      { status: 503 }
    );
  }

  // Read back so the client renders exactly what is in the database, rather
  // than a locally-optimistic list that may not match.
  const result = await listFeedbacks();
  return NextResponse.json({
    success: true,
    feedback: newItem,
    feedbacks: result.status === "ready" ? result.items : [newItem],
    persistence: "ready",
  });
}
