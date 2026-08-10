/**
 * Canonical signing payload for feedback submissions.
 *
 * The client signs the string produced by `buildFeedbackMessage`, and the server
 * rebuilds it from the submitted fields before verifying. Both sides import this
 * module so the two representations cannot drift apart — if they did, every
 * signature would silently fail to verify.
 */

export interface FeedbackSignaturePayload {
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
}

/** How long a signed submission stays valid, in milliseconds. */
export const SIGNATURE_MAX_AGE_MS = 5 * 60 * 1000;

export function buildFeedbackMessage(p: FeedbackSignaturePayload): string {
  // Field order is part of the contract between client and server. Do not reorder.
  return [
    "CredChain feedback",
    `address:${p.address}`,
    `rating:${p.rating}`,
    `category:${p.category}`,
    `timestamp:${p.timestamp}`,
    `comment:${p.comment}`,
  ].join("\n");
}

/**
 * Rejects timestamps that are too old (replay) or too far in the future (clock
 * skew or tampering). Returns false for anything unparseable.
 */
export function isTimestampFresh(
  timestamp: string,
  now: number = Date.now(),
  maxAgeMs: number = SIGNATURE_MAX_AGE_MS
): boolean {
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) return false;
  const age = now - parsed;
  return age >= -maxAgeMs && age <= maxAgeMs;
}
