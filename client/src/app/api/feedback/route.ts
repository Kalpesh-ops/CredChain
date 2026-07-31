import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFeedbacksFromDb, saveFeedbackToDb, isDbConnected } from "@/lib/db";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, rating, category, comment, timestamp, walletType } = body;

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Comment is required and must be a non-empty string" }, { status: 400 });
    }

    // Security Hardening & Input Sanitization
    const sanitizedComment = comment.trim().substring(0, 500);
    const sanitizedAddress = String(address || "Anonymous User").trim().substring(0, 100);
    const sanitizedCategory = String(category || "General").trim().substring(0, 50);
    const sanitizedWalletType = String(walletType || "Direct Input").trim().substring(0, 50);
    const sanitizedRating = Math.max(1, Math.min(5, Math.floor(Number(rating) || 5)));

    const newItem: FeedbackItem = {
      id: "fb-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      address: sanitizedAddress,
      rating: sanitizedRating,
      category: sanitizedCategory,
      comment: sanitizedComment,
      timestamp: String(timestamp || new Date().toISOString().replace("T", " ").substring(0, 19)).substring(0, 50),
      walletType: sanitizedWalletType,
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
