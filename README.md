# BountyVault — Decentralized Escrow on Algorand

BountyVault is a full-stack escrow prototype for managing bounty work, milestone delivery, payment release, and dispute handling with an Algorand Testnet component.

- **Live demo:** https://bountyvault-project.vercel.app/
- **Source repository:** https://github.com/Faizankhan-cyber/bountyvault
- **Network:** Algorand Testnet
- **License:** MIT

## Overview

The project explores how an escrow workflow can represent trust between a person posting a bounty and a worker completing it. The application combines a React frontend, an Express API, SQLite persistence, and Algorand Testnet wallet/transaction flows.

## Architecture

~~~text
React + Vite frontend
        |
        | REST API (JSON)
        v
Node.js + Express API
        |                         |
        v                         v
SQLite database             Algorand Testnet
                                |
                          Pera Wallet integration
~~~

The repository describes API areas for authentication, bounty lifecycle actions, applicants, disputes, transactions, and statistics.

## Main workflows

- **Bounty discovery:** browse and filter available bounties.
- **Poster workflow:** create bounties, review applicants, select a worker, and progress the escrow lifecycle.
- **Worker workflow:** browse work, apply, submit deliverables, and review earnings or transaction history.
- **Dispute workflow:** submit and review disputes, with a separate arbitrator experience for resolving disputes.
- **Escrow and transactions:** explore fund locking, payout, refund, and transaction records on the test network.
- **Wallet connection:** supports a Pera Wallet flow described in the project implementation.

These are prototype capabilities. Check the running demo and source before assuming every workflow is available in every deployment configuration.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Local data | SQLite with better-sqlite3 |
| Blockchain | Algorand Testnet |
| Wallet | Pera Wallet integration |

## Run locally

Prerequisite: Node.js and npm. From the repository root:

~~~bash
npm install
npm run dev
~~~

The development setup is documented to run the Vite frontend and Express backend together on port 3000.

To create a production build:

~~~bash
npm run build
~~~

Refer to the current source and package scripts for the authoritative local run configuration.

## Security and testing notes

- This is an educational/hackathon project, not a reviewed production escrow service.
- It is configured around Algorand Testnet; do not use real funds or production credentials for experimentation.
- Smart-contract, wallet, authentication, authorization, and dispute flows should receive independent security review before any production use.
- Never commit private keys, seed phrases, access tokens, production credentials, or real personal data.

## License

MIT. See the repository's license file for terms.
