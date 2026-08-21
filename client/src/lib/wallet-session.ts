import type { WalletName } from "@/types";

const KEY = "credchain.wallet-session";

export const REMEMBER_OPTIONS = [
  { value: "session", label: "Until I close the browser" },
  { value: "1d", label: "1 day" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

export type RememberDuration = (typeof REMEMBER_OPTIONS)[number]["value"];

export interface WalletSession {
  address: string;
  walletName: WalletName | null;
  /** null means the session lives only until the browser closes. */
  expiresAt: number | null;
}

const DURATION_MS: Record<Exclude<RememberDuration, "session">, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function expiryFor(
  duration: RememberDuration,
  now: number = Date.now()
): number | null {
  return duration === "session" ? null : now + DURATION_MS[duration];
}

export function isExpired(
  session: WalletSession,
  now: number = Date.now()
): boolean {
  return session.expiresAt !== null && now > session.expiresAt;
}

/** Returns null for anything that is not a session object we wrote. */
export function parseSession(raw: string | null): WalletSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.address !== "string" || !parsed.address) return null;
    const expiresAt = parsed.expiresAt;
    if (expiresAt !== null && typeof expiresAt !== "number") return null;
    return {
      address: parsed.address,
      walletName: parsed.walletName ?? null,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export function saveSession(
  session: Omit<WalletSession, "expiresAt">,
  duration: RememberDuration
): void {
  if (typeof window === "undefined") return;
  clearSession();
  const stored: WalletSession = {
    ...session,
    expiresAt: expiryFor(duration),
  };
  const store = duration === "session" ? sessionStorage : localStorage;
  try {
    store.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Private browsing modes can refuse writes; the wallet just will not persist.
  }
}

export function loadSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  try {
    const session =
      parseSession(sessionStorage.getItem(KEY)) ??
      parseSession(localStorage.getItem(KEY));
    if (!session) return null;
    if (isExpired(session)) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do if storage is unavailable.
  }
}
