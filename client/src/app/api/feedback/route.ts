import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    // If serverless filesystem is read-only, keep in memory cache
  }
}

ensureDataFile();

export async function GET() {
  ensureDataFile();
  return NextResponse.json({ feedbacks: memoryFeedbacks });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, rating, category, comment, timestamp, walletType } = body;

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const newItem: FeedbackItem = {
      id: "fb-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      address: address || "Anonymous User",
      rating: Number(rating) || 5,
      category: category || "General",
      comment: comment.trim(),
      timestamp: timestamp || new Date().toISOString().replace("T", " ").substring(0, 19),
      walletType: walletType || "Direct Input",
    };

    memoryFeedbacks = [newItem, ...memoryFeedbacks];

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(memoryFeedbacks, null, 2), "utf-8");
    } catch {
      // Serverless file fallback
    }

    return NextResponse.json({ success: true, feedback: newItem, feedbacks: memoryFeedbacks });
  } catch {
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 });
  }
}
