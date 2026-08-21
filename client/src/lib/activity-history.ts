import { rpc, xdr, scValToNative } from "@stellar/stellar-sdk";
import type { ActivityEvent } from "@/types";

/** Soroban RPC scans a fixed 10k-ledger span per getEvents page. */
const MAX_EVENT_PAGES = 20;
/** The retention floor moves forward while we read it, so start just inside. */
const RETENTION_MARGIN = 50;

function toScVal(value: unknown): xdr.ScVal {
  return typeof value === "string"
    ? xdr.ScVal.fromXDR(value, "base64")
    : (value as xdr.ScVal);
}

/** Returns null for any event this contract did not emit through our topics. */
export function toActivityEvent(ev: {
  topic?: unknown[];
  value?: unknown;
  txHash?: string;
  ledgerClosedAt?: string;
}): ActivityEvent | null {
  const topics = ev.topic ?? [];
  if (topics.length === 0) return null;

  try {
    const topic = scValToNative(toScVal(topics[0]));
    const value = scValToNative(toScVal(ev.value)) as Record<string, unknown>;
    const timestamp = ev.ledgerClosedAt
      ? Math.floor(new Date(ev.ledgerClosedAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000);
    const txHash = ev.txHash ?? "";

    if (topic === "inst_reg") {
      const addr = typeof value === "string" ? value : (value.addr as string);
      return {
        type: "institution_registered",
        timestamp,
        txHash,
        data: { addr: addr ?? "" },
      };
    }
    if (topic === "cert_iss") {
      return {
        type: "certificate_issued",
        timestamp,
        txHash,
        data: {
          id: Number(value.id ?? 0),
          issuer: (value.issuer as string) ?? "",
          recipient: (value.recipient as string) ?? "",
        },
      };
    }
    if (topic === "cert_rev") {
      return {
        type: "certificate_revoked",
        timestamp,
        txHash,
        data: {
          id: Number(value.id ?? 0),
          caller: (value.caller as string) ?? "",
        },
      };
    }
  } catch {
    // A topic we cannot decode is not something the feed can render.
  }
  return null;
}

/** The ledger a getEvents cursor points at, encoded in the high bits of its toid. */
function cursorLedger(cursor: string): number | null {
  const toid = Number(cursor.split("-")[0]);
  return Number.isFinite(toid) ? Math.floor(toid / 2 ** 32) : null;
}

/**
 * Walks the whole RPC retention window so the feed is populated on a cold load.
 * Only reaches back as far as the node retains events — roughly seven days on
 * testnet — which is why account history comes from Horizon instead.
 */
export async function fetchContractEventHistory(
  rpcUrl: string,
  contractId: string
): Promise<ActivityEvent[]> {
  const server = new rpc.Server(rpcUrl);
  const filters = [{ type: "contract" as const, contractIds: [contractId] }];

  // getHealth reports the retention floor outright, so there is no need to
  // provoke an out-of-range error to discover it.
  const health = await server.getHealth();
  const startLedger = health.oldestLedger + RETENTION_MARGIN;

  const events: ActivityEvent[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_EVENT_PAGES; page++) {
    const response = await server.getEvents(
      cursor
        ? { filters, cursor, limit: 200 }
        : { startLedger, filters, limit: 200 }
    );

    for (const raw of response.events ?? []) {
      const event = toActivityEvent(raw as Parameters<typeof toActivityEvent>[0]);
      if (event) events.push(event);
    }

    const next = (response as { cursor?: string }).cursor;
    if (!next) break;
    const reached = cursorLedger(next);
    if (reached === null || reached >= response.latestLedger) break;
    cursor = next;
  }

  return events;
}

export interface AccountOperation {
  id: string;
  type: string;
  createdAt: number;
  txHash: string;
  successful: boolean;
  summary: string;
}

function summarise(
  op: Record<string, unknown>,
  address: string
): string {
  switch (op.type) {
    case "create_account":
      return op.account === address
        ? `Account created with ${op.starting_balance} XLM`
        : `Created account ${op.account}`;
    case "payment": {
      const amount = `${op.amount} ${op.asset_type === "native" ? "XLM" : op.asset_code}`;
      return op.from === address ? `Sent ${amount}` : `Received ${amount}`;
    }
    case "invoke_host_function":
      return "Smart contract call";
    default:
      return String(op.type).replace(/_/g, " ");
  }
}

/**
 * Horizon keeps full account history, well beyond the RPC event window, so this
 * is what makes older activity visible at all.
 */
export async function fetchAccountOperations(
  horizonUrl: string,
  address: string,
  limit = 50
): Promise<AccountOperation[]> {
  const res = await fetch(
    `${horizonUrl}/accounts/${address}/operations?order=desc&limit=${limit}&include_failed=true`
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Horizon responded ${res.status}`);
  }

  const body = (await res.json()) as {
    _embedded?: { records?: Record<string, unknown>[] };
  };

  return (body._embedded?.records ?? []).map((op) => ({
    id: String(op.id),
    type: String(op.type),
    createdAt: Math.floor(new Date(String(op.created_at)).getTime() / 1000),
    txHash: String(op.transaction_hash ?? ""),
    successful: op.transaction_successful !== false,
    summary: summarise(op, address),
  }));
}
