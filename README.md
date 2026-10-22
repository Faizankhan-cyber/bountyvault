# 🔐 BountyVault (React + Express Edition)

> A decentralized bounty escrow platform on **Algorand** enabling trustless deposits, verified milestone deliveries, and transparent on-chain dispute arbitration.

Rewritten as a modern full-stack **React SPA on Vite with Node.js/Express and SQLite**, preserving all original business logic, multi-role dashboards, and escrow mechanics.

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│               React + Vite SPA Frontend                │
│  • Public Landing Page & Stats                         │
│  • Public Bounty Explorer with Search & Filter         │
│  • Multi-Role Auth (Poster / Worker / Arbitrator)      │
│  • Poster Dashboard: Post Bounty, Review, Release Tx   │
│  • Worker Dashboard: Browse, Apply, Deliver, Earnings  │
│  • Arbitrator Console: Evidence Review, Binding Ruling │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express Backend Server                 │
│  • /api/auth/signup & /api/auth/login                  │
│  • /api/bounties (CRUD, Select, Complete, Cancel)      │
│  • /api/bounties/:id/applicants                        │
│  • /api/bounties/:id/dispute & /resolve                │
│  • /api/transactions & /api/stats                      │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
    ┌──────────────────────┐    ┌──────────────────┐
    │  SQLite Database     │    │ Algorand Testnet │
    │  (better-sqlite3)    │    │ Pera Wallet Sync │
    └──────────────────────┘    └──────────────────┘
```

---

## ✨ Features & Dashboards

1. **Public Explorer & Landing**:
   - Live platform stats (volume in ALGO, open escrows, resolution rate).
   - Real-time search, category filters, and sorting.
   - Comprehensive bounty detail modals and 1-click application submission.

2. **Poster Dashboard**:
   - Post new bounties with ALGO reward escrow locking.
   - Review applicant proposals and select workers to transition escrows to `acquired`.
   - Release payouts on deliverable completion or raise disputes for non-delivery.
   - Audit trail of transactions and state transitions.

3. **Worker Hub**:
   - Browse opportunities across Development, Design, Writing, and more.
   - Submit applications with skill tags and Algorand wallet address.
   - Track live job progress and view milestone settlement receipts.
   - Earnings analytics showing total ALGO earned and in-flight escrows.

4. **Arbitrator Dispute Center**:
   - Independent judiciary console for disputed escrows.
   - Examine grievance claims and submitted verification evidence.
   - Execute irreversible on-chain rulings (Worker payout release vs Poster refund).
   - Platform health metrics and dispute resolution rate visualization.

5. **Algorand Web3 Wallet Integration**:
   - Pera Wallet Connect support.
   - Automatic fallback to Algorand Testnet address connector with instant address generation.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Express, TypeScript (tsx), better-sqlite3
- **Network**: Algorand Testnet (ARC-56 compatible escrow model)
- **Database**: SQLite (`./data/bountyvault.db`)

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server (Express + Vite on port 3000)
npm run dev

# Build for production
npm run build
```

---

## 📄 License

MIT
