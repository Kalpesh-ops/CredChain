# CredChain — Blockchain-Verified Credentials

CredChain is a decentralized certificate issuance platform built on the Stellar Soroban smart contract platform. Institutions can issue tamper-proof credentials as NFTs, verify them instantly, and maintain a transparent revocation list — all on the Stellar blockchain.

## Features

- 🏛️ **Institution Registration** — Register as a verified institution on-chain
- 📜 **Certificate Issuance** — Issue tamper-proof credential NFTs to recipients
- ✅ **Instant Verification** — Verify any certificate by ID
- ❌ **Certificate Revocation** — Revoke certificates with full on-chain transparency
- 📱 **QR-Ready** — Certificate metadata URIs support QR code integration
- 🔄 **Real-Time Activity** — Transaction tracking and event feed
- 🌙 **Dark Mode** — Sleek dark/light theme toggle
- 🔌 **Multi-Wallet** — Freighter wallet integration (StellarWalletsKit ready)

## Tech Stack

- **Smart Contract**: Rust + Soroban SDK
- **Frontend**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Blockchain**: Stellar Soroban + @stellar/stellar-sdk
- **Wallet**: Freighter + @stellar/freighter-api

## Project Structure

```
credchain/
├── contract/                     # Soroban smart contract
│   ├── Cargo.toml
│   └── contracts/contract/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs            # Contract implementation
│           └── test.rs           # Contract tests
├── client/                       # Next.js frontend
│   ├── src/
│   │   ├── app/                  # Pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # Wallet & institution overview
│   │   │   ├── app/              # Main application
│   │   │   └── activity/         # Event feed & transactions
│   │   ├── components/           # UI components
│   │   │   ├── ui/               # shadcn/ui primitives
│   │   │   ├── Navbar.tsx
│   │   │   ├── WalletModal.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── TransactionTracker.tsx
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── contract.ts       # TanStack Query hooks
│   │   │   └── use-toast.ts
│   │   ├── stores/               # Zustand stores
│   │   │   ├── wallet.ts         # Wallet state
│   │   │   ├── transactions.ts   # Transaction tracking
│   │   │   └── activity.ts       # Activity events
│   │   ├── lib/                  # Utilities
│   │   │   ├── utils.ts
│   │   │   ├── contracts.ts      # Network config
│   │   │   └── scval.ts          # ScVal converters
│   │   └── types/                # TypeScript types
│   └── scripts/deploy.sh         # Deployment script
└── README.md
```

## Setup

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+ / [Bun](https://bun.sh)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli)
- [Freighter Wallet](https://freighter.app/) (browser extension)

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the values:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ADDRESS=CA...  # Your deployed contract address
```

### Wallet Setup

1. Install the [Freighter Wallet](https://freighter.app/) browser extension
2. Create a new wallet or import an existing one
3. Switch to Testnet in Freighter settings
4. Fund your account using the [Stellar Lab](https://lab.stellar.org/account/fund)

### Contract Deployment

```bash
# Navigate to contract directory
cd contract

# Build the contract
stellar contract build

# Generate a key and fund it
stellar keys generate dev --network testnet --fund

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/credchain.wasm \
  --source-account dev \
  --network testnet

# Copy the contract ID (C...) to your .env
```

Or use the automated deployment script:

```bash
cd client
bash scripts/deploy.sh
```

### Local Development

```bash
# Install dependencies
cd client
bun install

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Contract tests
cd contract
cargo test

# Frontend lint
cd client
bun run lint
```

## Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push the repo to GitHub
2. Import the project in Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy!

## Smart Contract API

### Functions

| Function | Parameters | Description |
|---|---|---|
| `register_institution` | `addr: Address, name: String` | Register as an institution |
| `issue_certificate` | `issuer: Address, recipient: Address, metadata_uri: String` | Issue a certificate |
| `revoke_certificate` | `caller: Address, cert_id: u64` | Revoke a certificate |
| `get_certificate` | `cert_id: u64` | Get certificate details |
| `get_institution` | `addr: Address` | Get institution details |
| `verify_certificate` | `cert_id: u64` | Check if certificate is valid |
| `is_institution` | `addr: Address` | Check if address is registered |
| `get_all_institutions` | — | List all registered institutions |

### Events

| Event | Topics | Data |
|---|---|---|
| `inst_reg` | `["inst_reg"]` | `{ addr }` |
| `cert_iss` | `["cert_iss"]` | `{ id, issuer, recipient }` |
| `cert_rev` | `["cert_rev"]` | `{ id, caller }` |

## License

MIT
