# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent projects in one repo, no shared build system:

- `contract/` — Rust + Soroban SDK 25 smart contract (`credchain`), `#![no_std]`
- `client/` — Next.js 16 (App Router) + React 19 + TypeScript frontend
- `static/` — README screenshots only

`client/CLAUDE.md` imports `client/AGENTS.md`, which warns that this Next.js version differs from training data — consult `client/node_modules/next/dist/docs/` before writing Next-specific code.

## Commands

All contract commands run from `contract/`; all frontend commands from `client/`.

```bash
cd contract && cargo test                    # all 21 contract tests
cd contract && cargo test test_full_lifecycle -- --exact   # single test
cd contract && cargo fmt --check && cargo clippy -- -D warnings   # what CI enforces
cd contract && stellar contract build        # or: cargo build --target wasm32v1-none --release
```

```bash
cd client && npm run dev                     # dev server on :3000
cd client && npm run test                    # vitest run (54 tests)
cd client && npx vitest run src/lib/scval.test.ts   # single test file
cd client && npm run lint && npm run build   # what CI enforces
```

Contract `Makefile` targets (`build`, `test`, `deploy`, `fmt`, `clean`) wrap the same commands.

Deployment: `bash client/scripts/deploy.sh` generates/funds a `dev` key, builds, deploys to testnet, and regenerates TypeScript bindings. Override via `NETWORK`, `RPC_URL`, `NETWORK_PASSPHRASE`, `SOURCE_ACCOUNT`, `WASM_PATH` env vars.

CI (`.github/workflows/ci.yml`) additionally asserts the compiled WASM stays under Soroban's 64 KB limit — keep this in mind when adding contract code. `cd.yml` owns deployment exclusively; `ci.yml` is build/test/lint only. Neither workflow swallows command failures — do not reintroduce `|| echo` or `|| true` around a deploy or audit step, which previously made every CD run report success without deploying anything.

## Contract architecture

`contract/src/lib.rs` is the entire contract. Storage is keyed by a single `DataKey` enum:

- **persistent**: `Institution(Address)`, `Certificate(u64)` — per-entity records, TTL extended (5000, 10000) on every write
- **instance**: `NextCertId`, `InstitutionList`, `Admin`, `TokenAddress`, `TreasuryAddress`, `RegFee` — global config/counters

Certificate IDs are a monotonic `NextCertId` counter starting at 1. `register_institution` follows checks-effects-interactions: all storage writes complete before the optional inter-contract `token_client.transfer` fee payment, which only fires when `TokenAddress`, `TreasuryAddress`, and a positive `RegFee` are all configured via `configure_fees`.

Events use `#[contractevent]` with short topic symbols the frontend matches on literally: `inst_reg`, `cert_iss`, `cert_rev`.

Tests in `contract/src/test.rs` are backed by golden files in `contract/test_snapshots/` — adding or renaming a test creates/orphans a snapshot JSON.

### ContractError codes

`1=NotRegistered, 2=AlreadyRegistered, 3=NotAuthorized, 4=CertificateNotFound, 5=AlreadyRevoked, 6=InvalidInput`.

`client/src/lib/error-decoder.ts` mirrors these, and `client/src/lib/error-decoder.test.ts` pins the mapping — reordering the enum without updating both will fail those tests. `lib.rs` is the source of truth.

### Admin is bound at deploy time

`__constructor(admin)` sets `DataKey::Admin` as part of the deploy operation. `configure_fees` and `transfer_admin` both require an already-set `Admin` matching the caller. Never reintroduce a "set admin if unset" fallback — that made the admin seat claimable by any caller on a freshly deployed contract. `client/scripts/deploy.sh` passes the constructor arg via the trailing `-- --admin <G...>`; a deploy without it produces a contract with no admin.

## Frontend architecture

**All chain access flows through the Zustand wallet store** (`client/src/stores/wallet.ts`). It owns network config, wallet connection, and the three primitives everything else builds on:

- `readContract(method, params)` — builds a tx, simulates it, returns `scValToNative(retval)`. Works without a connected wallet by falling back to a random keypair as the simulation source.
- `signAndSendTransaction(method, params, fee)` — build → simulate → `assembleTransaction` → sign via Stellar Wallets Kit → send → poll `getTransaction` up to 30× at 1s intervals.
- `sendXlm(recipient, amount)` — plain Horizon payment op, same signing/polling flow.

`@creit.tech/stellar-wallets-kit` and its Freighter/xBull/Albedo modules are **dynamically imported inside each action**, never at module scope — static imports break SSR. Preserve this pattern.

Balance comes from Horizon REST (`horizon-testnet.stellar.org/accounts/:addr`), not RPC.

**Contract calls are wrapped in TanStack Query hooks** in `client/src/hooks/contract.ts`. Read hooks are `useQuery` keyed `["isInstitution"|"institution"|"certificate"|"verifyCertificate"|"allInstitutions", ...]`; write hooks are `useMutation` that push into the transaction store and invalidate the matching query keys. Defaults are 30s `staleTime`/`refetchInterval` (set in `client/src/app/providers.tsx`).

**Real-time sync** is polling, not websockets: `useContractEventsListener` (mounted once in `Providers`) calls `getEvents` every 4s from the last seen ledger, dispatches to the activity store, fires toasts, and invalidates the same query keys. It handles two RPC failure modes explicitly — indexer lag (requested ledger > indexed max: wait, stay "connected") and pruning (requested < retention min: reset `lastLedgerRef` to re-init from latest). Don't collapse those branches into a generic error path.

Arguments are converted to XDR through the small helpers in `client/src/lib/scval.ts` (`toScValAddress`, `toScValU64`, `toScValString`, …) — always go through these rather than calling `nativeToScVal` inline, since the typed variants are what the tests cover.

**Feedback API** (`client/src/app/api/feedback/route.ts`) is the only server-side surface. Attribution is derived from an Ed25519 signature, never from the request body: an unsigned POST is always stored as `Anonymous User` / `Direct Input` regardless of what `address` it claims. The canonical signing payload lives in `client/src/lib/feedback-message.ts` and is imported by both the client and the route so the two representations cannot drift. Albedo, Rabet, and the hardware-wallet modules do not implement SEP-0043 `signMessage` — the client catches that and falls back to anonymous rather than failing.

Persistence tries Postgres via `client/src/lib/db.ts` and falls back to a JSON file + in-memory array when the DB is unreachable (serverless writes fail silently by design). `db.ts` resolves a connection string from a priority chain of env vars (`DATABASE_URL` → `POSTGRES_URL` → … → composed `POSTGRES_*` parts) to accommodate Vercel's Supabase integration, and calls `initDbSchema()` (idempotent `CREATE TABLE IF NOT EXISTS` + RLS policies) before every query.

## Environment

Copy `client/.env.example` to `client/.env`. `NEXT_PUBLIC_CONTRACT_ADDRESS` is read directly from `process.env` in `wallet.ts`, `contracts.ts`, and `useContractEventsListener.ts` — when redeploying the contract, update `.env`, both workflow files, and the README address together.

Note: `client/src/lib/db.ts` ends its connection-string chain with a hardcoded Supabase URL containing live credentials. Treat that as a leaked secret to rotate and remove, not as a working default to rely on.
