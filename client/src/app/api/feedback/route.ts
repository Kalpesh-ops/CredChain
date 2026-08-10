import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Keypair } from "@stellar/stellar-sdk";
import { getFeedbacksFromDb, saveFeedbackToDb, isDbConnected } from "@/lib/db";
import { buildFeedbackMessage, isTimestampFresh } from "@/lib/feedback-message";

export interface FeedbackItem {
  id: string;
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  walletType: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "feedbacks.json");

let memoryFeedbacks: FeedbackItem[] = [];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FILE_PATH)) {
      const content = fs.readFileSync(FILE_PATH, "utf-8");
      memoryFeedbacks = JSON.parse(content);
    } else {
      fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      memoryFeedbacks = [];
    }
  } catch {
    // Serverless fallback
  }
}

ensureDataFile();

export async function GET() {
  const dbConnected = await isDbConnected();
  if (dbConnected) {
    const dbRows = await getFeedbacksFromDb();
    if (dbRows) {
      const dbItems: FeedbackItem[] = dbRows.map((r) => ({
        id: r.id,
        address: r.address,
        rating: r.rating,
        category: r.category,
        comment: r.comment,
        timestamp: r.timestamp,
        walletType: r.wallet_type,
      }));
      return NextResponse.json({ feedbacks: dbItems, source: "database" });
    }
  }

  ensureDataFile();
  return NextResponse.json({ feedbacks: memoryFeedbacks, source: "file" });
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
  try {
    const body = await request.json();
    const { address, rating, category, comment, timestamp, signature } = body;

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Comment is required and must be a non-empty string" }, { status: 400 });
    }

    // Security Hardening & Input Sanitization
    const sanitizedComment = comment.trim().substring(0, 500);
    const sanitizedCategory = String(category || "General").trim().substring(0, 50);
    const sanitizedRating = Math.max(1, Math.min(5, Math.floor(Number(rating) || 5)));
    const sanitizedTimestamp = String(
      timestamp || new Date().toISOString()
    ).substring(0, 50);

    // Attribution is derived from a verified signature, never from the request
    // body. An unsigned submission is always anonymous, no matter what `address`
    // or `walletType` the caller sent.
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
              "Signature verification failed. The signature does not match the submitted content, the address, or the request has expired.",
          },
          { status: 401 }
        );
      }

      attributedAddress = claimedAddress.substring(0, 100);
      attributedWalletType = "Wallet Signed";
    }

    const newItem: FeedbackItem = {
      id: "fb-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      address: attributedAddress,
      rating: sanitizedRating,
      category: sanitizedCategory,
      comment: sanitizedComment,
      timestamp: sanitizedTimestamp,
      walletType: attributedWalletType,
    };

    // Save to Database (Cloud DB Persistence)
    const savedToDb = await saveFeedbackToDb(newItem);

    // Save to local File (Secondary Backup)
    memoryFeedbacks = [newItem, ...memoryFeedbacks.filter((f) => f.id !== newItem.id)];
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(memoryFeedbacks, null, 2), "utf-8");
    } catch {
      // Serverless file fallback
    }

    if (savedToDb) {
      const dbRows = await getFeedbacksFromDb();
      if (dbRows) {
        const dbItems: FeedbackItem[] = dbRows.map((r) => ({
          id: r.id,
          address: r.address,
          rating: r.rating,
          category: r.category,
          comment: r.comment,
          timestamp: r.timestamp,
          walletType: r.wallet_type,
        }));
        return NextResponse.json({ success: true, feedback: newItem, feedbacks: dbItems, source: "database" });
      }
    }

    return NextResponse.json({ success: true, feedback: newItem, feedbacks: memoryFeedbacks, source: "file" });
  } catch {
    return NextResponse.json({ error: "Failed to process feedback payload" }, { status: 500 });
  }
}
