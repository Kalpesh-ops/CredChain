# CredChain — Blockchain-Verified Credentials

CredChain is a decentralized certificate issuance platform built on the Stellar Soroban smart contract platform. Registered institutions can issue tamper-proof credentials as NFTs, verify them instantly by ID, and maintain a transparent revocation list — all on the Stellar blockchain.

## Live Demo & Deployment Info

*   **Live Demo URL**: [https://credchain-stellar.vercel.app](https://credchain-stellar.vercel.app)
*   **Deployed Contract Address**: `CBMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFE`
*   **Successful Contract Call Tx Hash**: `872a109b7bf635750440c9ba1a6444127205126e88254761d7c7beb300980ec1` (Stellar Testnet)

---

## Features

*   🏛️ **Institution Registration** — Register as a verified institution on-chain.
*   📜 **Certificate Issuance** — Issue tamper-proof credential NFTs to recipients.
*   ✅ **Instant Verification** — Verify any certificate by ID and check its status.
*   ❌ **Certificate Revocation** — Revoke certificates with full on-chain transparency.
*   💸 **Send XLM** — Transfer XLM directly on the Stellar Testnet.
*   🔄 **Real-Time Event Listening** — Automatic UI updates and toast notifications using RPC contract event polling.
*   🌙 **Dark Mode** — Sleek dark/light theme toggle.
*   🔌 **Multi-Wallet Support** — Integrated via Stellar Wallets Kit (Freighter, xBull, Albedo).

---

## Tech Stack

*   **Smart Contract**: Rust + Soroban SDK
*   **Frontend**: Next.js 15 + TypeScript
*   **Styling**: Tailwind CSS + shadcn/ui
*   **State**: Zustand + TanStack Query
*   **Blockchain**: Stellar Soroban + `@stellar/stellar-sdk`
*   **Wallet Integration**: `@creit.tech/stellar-wallets-kit`

---

## Folder Structure

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
│   │   │   ├── dashboard/        # Wallet, Send XLM & institution overview
│   │   │   ├── app/              # Main application (Issuance & Revocation)
│   │   │   └── activity/         # Event feed & transactions history
│   │   ├── components/           # UI components
│   │   │   ├── ui/               # UI primitives
│   │   │   ├── Navbar.tsx
│   │   │   ├── WalletModal.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── TransactionTracker.tsx
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── contract.ts       # TanStack Query contract read/write hooks
│   │   │   ├── useContractEventsListener.ts # Real-time Soroban RPC event poller
│   │   │   └── use-toast.ts
│   │   ├── stores/               # Zustand stores
│   │   │   ├── wallet.ts         # Wallet state & transaction actions
│   │   │   ├── transactions.ts   # UI transaction tracking
│   │   │   └── activity.ts       # Activity events
│   │   ├── lib/                  # Utilities
│   │   │   ├── utils.ts
│   │   │   ├── contracts.ts      # Network config
│   │   │   └── scval.ts          # ScVal converters
│   │   └── types/                # TypeScript types
│   ├── .env.example              # Env template
│   └── scripts/deploy.sh         # Deployment script
└── README.md
```

---

## Setup & Run Instructions

### Prerequisites

*   [Rust](https://rustup.rs/) (stable)
*   [Node.js](https://nodejs.org/) 18+
*   [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (installed and on PATH)
*   Freighter, xBull, or Albedo browser extension wallet

### Environment Variables

Copy `client/.env.example` to `client/.env` and update the variables:

```bash
cd client
cp .env.example .env
```

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ADDRESS=CBMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFE
```

### Local Development

1.  **Install dependencies**:
    ```bash
    cd client
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:3000` in your browser.

---

## Smart Contract Build & Deployment

If you want to compile and deploy the contract yourself:

```bash
# Navigate to contract directory
cd contract

# Build the contract target
stellar contract build

# Deploy to Testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/credchain.wasm \
  --source dev \
  --network testnet
```

---

## Screenshots Placeholders

*   **Wallet Connected**: `[Screenshot Placeholder: client/public/screenshots/wallet_connected.png]`
*   **Balance Displayed**: `[Screenshot Placeholder: client/public/screenshots/balance_display.png]`
*   **Successful Transaction**: `[Screenshot Placeholder: client/public/screenshots/successful_transaction.png]`
*   **Transaction Feedback (Pending/Success/Failed)**: `[Screenshot Placeholder: client/public/screenshots/transaction_feedback.png]`

---

## Future Improvements

1.  **IPFS Metadata Pinning**: Automatically pin certificate metadata to IPFS/Arweave from the client side during issuance.
2.  **Batch Issuance**: Optimize the contract and frontend to support issuing multiple certificates to different recipients in a single transaction.
3.  **Advanced Role Access**: Implement multi-signature roles to allow multiple staff members to authorize certificate revocations.
4.  **CSV/Excel Recipient Import**: Allow upload of CSV lists of recipients to automatically generate certificates in bulk.

---

## Stellar Mastery Verification Checklist

✅ **Wallet Connect** — Supports connecting via multiple wallets.
✅ **Wallet Disconnect** — Clean disconnect and state clearing.
✅ **Balance Display** — Fetches and displays actual XLM balance from Horizon.
✅ **Testnet Transaction** — Send XLM on Testnet directly in the dApp.
✅ **Error Handling** — Handles wallet-not-installed, user-rejections, and insufficient-balances.
✅ **Multi-wallet Support** — Handled via `@creit.tech/stellar-wallets-kit`.
✅ **Smart Contract Deployed** — Deployed at `CBMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFE`.
✅ **Frontend Contract Calls** — Fully integrated read/write interactions.
✅ **Contract Read** — Checks institution status and verifies certificates.
✅ **Contract Write** — Register institutions, issue, and revoke certificates.
✅ **Event Listener** — Real-time event polling and query invalidation.
✅ **Transaction Status** — Clear display of Pending, Success, and Failed states.
✅ **2+ Meaningful Git Commits** — Grouped logically in Git history.
✅ **Public GitHub Repository** — Pushed and accessible on GitHub.
✅ **README Complete** — Fully detailed documentation.
✅ **Live Demo** — Deployed and running on Vercel.
