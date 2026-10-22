export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  diagram?: {
    type: "flowchart" | "comparison" | "architecture" | "table" | "items";
    title: string;
    caption: string;
    items?: { label: string; detail: string; badge?: string }[];
    headers?: string[];
    rows?: string[][];
  };
  callout?: {
    title: string;
    text: string;
    type: "info" | "warning" | "bountyvault";
  };
}

export interface Lesson {
  id: string;
  slug: string;
  topicId: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  category: string;
  summary: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  relatedLessonIds: string[];
}

export interface LearningTrack {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  duration: string;
  lessonIds: string[];
  icon: string;
}

export interface GlossaryTerm {
  term: string;
  category: "Blockchain" | "Algorand" | "Escrow" | "Security" | "DeFi" | "Smart Contracts";
  definition: string;
  example: string;
  relatedTerms?: string[];
}

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    id: "track-fundamentals",
    title: "Web3 & Blockchain Fundamentals",
    difficulty: "Beginner",
    description: "Master the essential building blocks of distributed ledgers, cryptographic keys, and decentralized transactions.",
    duration: "25 min total",
    lessonIds: ["blockchain-fundamentals", "crypto-and-algorand"],
    icon: "Compass",
  },
  {
    id: "track-escrow",
    title: "Smart Contracts & Bounty Escrow",
    difficulty: "Intermediate",
    description: "Discover how programmable escrow guarantees trustless worker rewards, and study BountyVault's 3-party dispute protocol.",
    duration: "30 min total",
    lessonIds: ["smart-contracts", "bounty-escrow"],
    icon: "Shield",
  },
  {
    id: "track-security",
    title: "Blockchain Security & Key Hygiene",
    difficulty: "Advanced",
    description: "Learn how to secure private keys, verify transaction groups before signing, and identify phishing and contract hazards.",
    duration: "20 min total",
    lessonIds: ["blockchain-security"],
    icon: "Lock",
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "blockchain-fundamentals",
    slug: "blockchain-fundamentals",
    topicId: "fundamentals",
    title: "Blockchain Fundamentals",
    subtitle: "Distributed Ledgers, Blocks, Cryptography, and Wallets",
    difficulty: "Beginner",
    readTime: "8 min read",
    category: "Architecture",
    summary: "Explore how distributed ledgers achieve consensus without central coordinators, how public-key cryptography protects transactions, and what a crypto wallet actually does.",
    relatedLessonIds: ["crypto-and-algorand", "smart-contracts"],
    sections: [
      {
        id: "distributed-ledgers",
        title: "1. Distributed Ledgers vs Centralized Databases",
        content: `In a traditional client-server architecture (like PostgreSQL or AWS), a single authority maintains the master database. That administrator holds root privileges to insert, modify, or delete records arbitrarily. If their server goes down or their credentials leak, the entire system's integrity is compromised.

A **blockchain** replaces the central coordinator with a peer-to-peer network of independent computer nodes. Every validating node keeps an exact copy of the transaction history (the ledger). Rather than trusting one server, nodes execute mathematical consensus rules to agree on which transactions are valid before appending them into a new block. Once written, cryptographically linked records cannot be altered or retroactively erased without consensus from the network.`,
        diagram: {
          type: "comparison",
          title: "Centralized Database vs Distributed Ledger",
          caption: "A single point of failure vs distributed mathematical validation",
          items: [
            {
              label: "Centralized Model (SQL / Cloud)",
              detail: "Single company runs the database. Admin can edit or reverse any entry. Server outage halts all operations. Trust is placed entirely in human operators.",
              badge: "Traditional",
            },
            {
              label: "Distributed Ledger (Blockchain)",
              detail: "Hundreds of independent validator nodes verify rules. Entries are immutable once confirmed. No single party can censor or modify past transactions.",
              badge: "Decentralized",
            },
          ],
        },
        callout: {
          title: "Why BountyVault Uses Blockchain Escrow",
          text: "When a poster deposits a bounty reward into BountyVault, funds are committed to an verifiable ledger rather than held in a private, opaque corporate account. Both posters and contributors can independently inspect the locked funds at any moment.",
          type: "bountyvault",
        },
      },
      {
        id: "blocks-and-chaining",
        title: "2. Block Anatomy and Cryptographic Chaining",
        content: `A blockchain gets its name from how data is physically bundled and sealed. Individual transactions are batched together into discrete **blocks**. Each block contains:

1. **Block Header:** Metadata including the block round number, creation timestamp, software version, and state root hash.
2. **Previous Block Hash:** A cryptographic hash of the immediate predecessor block. This is the "chain" link.
3. **Transaction Merkle Root:** A single mathematical hash summarizing all transactions inside that block.
4. **Transaction List:** The actual signed transfers, state calls, and instructions included in the round.

Because each block's header incorporates the cryptographic hash of the block before it, tampering with a transaction inside Block #100 would alter its hash. That change invalidates the link stored in Block #101, which breaks Block #102, and cascades forward through the entire chain. Re-writing history requires calculating valid consensus proofs for all subsequent blocks faster than the rest of the entire honest network combined—a computational impossibility.`,
      },
      {
        id: "transactions-and-mempool",
        title: "3. Transaction Lifecycle",
        content: `Every action on a blockchain starts as a transaction. When you send ALGO or lock escrow:

1. **Construction:** Your client application specifies parameters: sender address, receiver address, fee, and optional transaction notes.
2. **Cryptographic Signing:** Your wallet uses your private key to generate an elliptic curve digital signature over the transaction payload.
3. **Broadcast:** The signed transaction is sent via HTTP or WebSocket to a node.
4. **Mempool & Propagation:** The node verifies the signature and checks that the sender has sufficient balance, then relays the transaction across peer nodes into the pending transaction pool.
5. **Block Assembly & Finality:** In Algorand's consensus, a block proposal is selected and certified within ~3.3 seconds. Once included in a certified block, the transaction is **immediately final**—there are no probabilistic reorgs or waiting for 10 confirmations.`,
      },
      {
        id: "consensus-mechanisms",
        title: "4. Consensus: How Nodes Agree",
        content: `How do thousands of anonymous machines agree on which transactions are genuine without a boss?

- **Proof of Work (Bitcoin):** Miners expend massive electrical energy racing to solve cryptographic puzzles. Energy-intensive and slow (~10 minutes per block).
- **Delegated Proof of Stake (DPoS):** Coin holders vote for 21-100 delegate validators. Fast, but risks cartelization and centralization.
- **Pure Proof of Stake (Algorand PPoS):** Invented by Turing Award winner Silvio Micali. Every single ALGO held in an online account has an equal chance of being selected to propose or certify blocks. Selection uses a **Verifiable Random Function (VRF)**—a cryptographic secret lottery run privately on each node's local machine. Validators do not announce themselves until *after* they have published their vote, rendering targeted DDoS or bribery attacks impossible.`,
        diagram: {
          type: "items",
          title: "Algorand PPoS vs Legacy Consensus",
          caption: "Why Algorand provides instant finality without forks",
          items: [
            {
              label: "Instant Finality (~3.3s)",
              detail: "Algorand blocks cannot fork. The moment a round finishes, the transaction cannot be reversed or orphaned.",
              badge: "High Speed",
            },
            {
              label: "Negligible Energy Consumption",
              detail: "No mining hardware required. Validating nodes run on ordinary modern hardware with minimal carbon footprint.",
              badge: "Eco-Friendly",
            },
            {
              label: "Predictable Micro-Fees",
              detail: "Standard network transactions cost exactly 0.001 ALGO ($0.0002), eliminating gas price spikes during market volatility.",
              badge: "Low Cost",
            },
          ],
        },
      },
      {
        id: "wallets-keys",
        title: "5. Wallets, Public Addresses, and Private Keys",
        content: `A common beginner misconception is that a crypto wallet "stores coins" like a leather wallet stores cash. In reality:

**Your tokens never leave the blockchain.** All balances exist as state entries on the distributed ledger. 

A **wallet** is merely a secure key management application and cryptographic signing engine. It stores:

- **Private Key:** A 256-bit secret number that grants mathematical authorization to spend funds. Think of it as your cryptographic master key.
- **Public Address:** Derived mathematically from your public key through a one-way hashing function. On Algorand, it is a 58-character Base32 string ending with a checksum (e.g. \`N7W7...3KFA\`). Anyone can know this address to send you payments.
- **25-Word Mnemonic (Seed Phrase):** A human-readable representation of your 256-bit private key entropy. Anyone with access to these 25 words can regenerate your private key and spend all your funds from anywhere in the world.`,
        callout: {
          title: "Crucial Security Rule",
          text: "Never type your 25-word mnemonic into any website, Discord bot, email, or chat application. BountyVault will NEVER ask for your seed phrase. Only browser wallet extensions (like Pera Wallet) hold your keys, and they sign transactions locally on your machine.",
          type: "warning",
        },
      },
    ],
    quiz: [
      {
        id: "q1-1",
        question: "Where are your cryptocurrency tokens physically stored?",
        options: [
          "Inside your local browser cache and phone storage",
          "On the distributed blockchain ledger itself",
          "Inside the Pera Wallet extension executable file",
          "On the BountyVault central server disk",
        ],
        correctIndex: 1,
        explanation: "Tokens exist purely as account balance records across the distributed ledger nodes. Your wallet only holds the cryptographic private keys that authorize spending those balances.",
      },
      {
        id: "q1-2",
        question: "Why can't past blocks on a blockchain be easily modified by an attacker?",
        options: [
          "Because miners lock them with physical padlocks",
          "Because each block contains the cryptographic hash of the previous block, creating a cascading chain of proofs",
          "Because central server admins automatically ban anyone who tries",
          "Because transactions are deleted from the network 24 hours after confirmation",
        ],
        correctIndex: 1,
        explanation: "Every block contains the hash of its predecessor. Modifying any past transaction invalidates all subsequent block hashes, requiring an impossible recalculation of the entire network's consensus.",
      },
      {
        id: "q1-3",
        question: "What consensus mechanism does Algorand utilize?",
        options: [
          "Proof of Work (energy-intensive mining puzzles)",
          "Pure Proof of Stake (cryptographic VRF sortition)",
          "Delegated Proof of Authority with 21 corporate master nodes",
          "Proof of Storage using hard drive space",
        ],
        correctIndex: 1,
        explanation: "Algorand uses Pure Proof of Stake (PPoS), pioneered by Silvio Micali, which randomly and privately selects block proposers and committees using a Verifiable Random Function (VRF).",
      },
    ],
  },
  {
    id: "crypto-and-algorand",
    slug: "crypto-and-algorand",
    topicId: "algorand",
    title: "Cryptocurrency and Algorand",
    subtitle: "ALGO Economics, MicroAlgos, Transaction Fees, and Testnets",
    difficulty: "Beginner",
    readTime: "7 min read",
    category: "Ecosystem",
    summary: "Understand the ALGO native token, how microAlgos work, flat fee mechanics, why Testnet is ideal for risk-free development, and how to operate safely.",
    relatedLessonIds: ["blockchain-fundamentals", "bounty-escrow"],
    sections: [
      {
        id: "algo-and-microalgos",
        title: "1. ALGO and the MicroAlgo Unit",
        content: `The native cryptocurrency of the Algorand blockchain is **ALGO**. It serves two fundamental purposes:
1. **Network Fuel:** Paying transaction fees for transfers and smart contract interactions.
2. **Account Minimum Balance Requirement (MBR):** Reserving space on the global ledger state to prevent network spam.

Because computers handle integers much more reliably than floating-point decimals, the Algorand blockchain computes all values in **microAlgos** (abbreviated \`µAlgo\`):

- **1 ALGO = 1,000,000 microAlgos** (10^6)
- **0.5 ALGO = 500,000 microAlgos**
- **0.001 ALGO = 1,000 microAlgos** (the base transaction fee)

When BountyVault lists a bounty reward of **250 ALGO**, smart contract transactions operate under the hood with an integer amount of **250,000,000 microAlgos**.`,
      },
      {
        id: "minimum-balance-requirement",
        title: "2. Minimum Balance Requirement (MBR)",
        content: `Unlike legacy blockchains where anyone can create millions of empty accounts for free and bloat node RAM, Algorand requires every active account to maintain a small baseline balance:

- **Base Account MBR:** 0.1 ALGO (100,000 µAlgos). An account cannot be activated with less than this amount.
- **Opt-in to an Asset (ASA):** Adds +0.1 ALGO to the required minimum balance.
- **Smart Contract Creation / Local State:** Adds a predictable incremental MBR based on the contract schema bytes and integer keys used.

When you close or opt out of an asset or contract, the locked MBR is instantly freed back into your spendable balance. This economic invariant guarantees that validators' in-memory state is always compensated.`,
      },
      {
        id: "transaction-fees",
        title: "3. Predictable Flat Transaction Fees",
        content: `On networks like Ethereum, users enter an auction ("gas wars") to bid for space inside upcoming blocks. During high traffic, a simple transfer can spike from $2 to $80+.

Algorand solved this with a deterministic protocol fee:
- **Base Fee:** Exactly **0.001 ALGO** (~$0.0002 USD) per standard transaction.
- **Atomic Transfers:** If you group 3 transactions together in an atomic bundle, the total fee is 3 × 0.001 = 0.003 ALGO.
- **Fee Pooling:** Any transaction in an atomic group can pay the fee for other transactions in the group, enabling developers to sponsor user fees seamlessly.`,
        callout: {
          title: "BountyVault Cost Predictability",
          text: "Because Algorand fees are 0.001 ALGO regardless of market volatility, funding a bounty or releasing escrow never subjects posters or freelancers to surprise fee deductions.",
          type: "info",
        },
      },
      {
        id: "testnet-vs-mainnet",
        title: "4. Testnet vs Mainnet: Risk-Free Prototyping",
        content: `Algorand maintains parallel blockchain environments:

- **Testnet:** A public replica of the Algorand protocol used for building, testing, and debugging applications. Testnet tokens have **zero real-world economic value**. You can obtain free Testnet ALGO via an official automated dispenser ("faucet") such as the Algorand Testnet Dispenser.
- **Mainnet:** The live production environment with real financial value and security guarantees.

BountyVault is connected by default to **Algorand Testnet** (via public node infrastructure provided by AlgoNode Cloud). You can freely test bounty funding, contributor applications, and dispute simulations without spending real money.`,
        diagram: {
          type: "table",
          title: "Testnet vs Mainnet Comparison",
          caption: "Understanding environment boundaries",
          headers: ["Feature", "Algorand Testnet", "Algorand Mainnet"],
          rows: [
            [
              "Token Value",
              "Zero monetary value (free from faucets)",
              "Real financial market value",
            ],
            [
              "Purpose",
              "Development, testing, UI validation",
              "Production commerce, real escrow payouts",
            ],
            [
              "Consensus & Speed",
              "Identical PPoS consensus (~3.3s blocks)",
              "Identical PPoS consensus (~3.3s blocks)",
            ],
            [
              "Node Endpoints",
              "testnet-api.algonode.cloud",
              "mainnet-api.algonode.cloud",
            ],
          ],
        },
      },
      {
        id: "wallet-hygiene",
        title: "5. Safe Wallet Practices",
        content: `Follow these cardinal rules when interacting with decentralized applications:

1. **Keep Separate Accounts:** Maintain a "burner" account for testing Testnet dApps, and a separate, hardware-secured account for Mainnet funds.
2. **Double-Check Recipient Addresses:** Always verify the first 4 and last 4 characters of an address before confirming a transfer.
3. **Beware of Malicious DApps:** Connecting your wallet gives a dApp permission to view your public address. It does **NOT** give permission to spend your funds—every single outbound transfer requires an explicit cryptographic sign prompt in your Pera Wallet.`,
      },
    ],
    quiz: [
      {
        id: "q2-1",
        question: "How many microAlgos are in exactly 1 ALGO?",
        options: [
          "100 microAlgos",
          "1,000 microAlgos",
          "1,000,000 microAlgos (10^6)",
          "1,000,000,000 microAlgos (10^9)",
        ],
        correctIndex: 2,
        explanation: "1 ALGO equals 1,000,000 microAlgos. Algorand represents all token balances in microAlgos to avoid floating-point math rounding issues.",
      },
      {
        id: "q2-2",
        question: "What is the standard base transaction fee on the Algorand network?",
        options: [
          "0.001 ALGO (1,000 µAlgos)",
          "5.00 ALGO",
          "Dynamic gas fee that can reach hundreds of dollars during congestion",
          "10% of the transaction value",
        ],
        correctIndex: 0,
        explanation: "Algorand transactions have a predictable baseline fee of only 0.001 ALGO, making it exceptionally cost-effective for micro-escrows and frequent updates.",
      },
      {
        id: "q2-3",
        question: "Do Algorand Testnet tokens carry real monetary value?",
        options: [
          "Yes, they can be traded on stock exchanges",
          "No, they are free testing tokens distributed by faucets for development",
          "Yes, they convert 1:1 into Bitcoin",
          "Only if you keep them for more than 30 days",
        ],
        correctIndex: 1,
        explanation: "Testnet tokens have zero economic value. They exist solely for developers, testers, and students to build and test applications safely.",
      },
    ],
  },
  {
    id: "smart-contracts",
    slug: "smart-contracts",
    topicId: "contracts",
    title: "Smart Contracts & Escrow Logic",
    subtitle: "What Code Can and Cannot Guarantee in Web3",
    difficulty: "Intermediate",
    readTime: "9 min read",
    category: "Smart Contracts",
    summary: "Examine how stateful smart contracts execute on Algorand's AVM, understand atomic transaction groups, and explore the honest boundaries of automated agreements.",
    relatedLessonIds: ["bounty-escrow", "blockchain-security"],
    sections: [
      {
        id: "what-is-a-smart-contract",
        title: "1. What is a Smart Contract?",
        content: `A **smart contract** is a self-executing computer program stored directly on the blockchain. When transactions invoke its functions, every validating node in the network runs the identical bytecode against the current ledger state.

Unlike legal contracts written on paper—which require lawyers, courtrooms, and enforcement marshals to resolve—a smart contract executes automatically based on strict boolean logic. 

On Algorand, smart contracts are executed by the **Algorand Virtual Machine (AVM)** using **TEAL** (Transaction Execution Approval Language) or higher-level languages like Python (PyTeal / Puya) compiled into AVM bytecode.`,
      },
      {
        id: "algorand-contract-architecture",
        title: "2. Algorand Stateful Contracts & Atomic Transfers",
        content: `Algorand has a distinct, ultra-secure architecture for smart contracts:

- **Stateful Applications:** Programs that maintain global state (accessible by all users) and local state (stored in individual user accounts). The contract has its own designated **Escrow Application Account** capable of holding and transferring funds.
- **Atomic Transaction Groups:** Algorand allows bundling up to 16 separate transactions into a single unified execution group. Either **ALL** transactions succeed simultaneously, or **ALL** transactions fail and revert. There is never a state where an escrow contract accepts funds but fails to register the depositor, or releases funds without updating the milestone status.`,
        diagram: {
          type: "flowchart",
          title: "Atomic Transaction Group Guarantees",
          caption: "All-or-nothing execution ensures funds are never lost in transit",
          items: [
            {
              label: "Txn 0: Fund Escrow",
              detail: "Poster sends 250 ALGO to the escrow contract account address.",
            },
            {
              label: "Txn 1: App Call",
              detail: "Smart contract executes 'create_bounty', recording metadata, deadlines, and poster address in global state.",
            },
            {
              label: "Result",
              detail: "If Txn 1 fails validation, Txn 0 is immediately cancelled. No money leaves the poster's wallet without contract registration.",
            },
          ],
        },
      },
      {
        id: "what-contracts-guarantee",
        title: "3. What Smart Contracts CAN Guarantee",
        content: `Smart contracts excel at mathematical and ledger invariants:

1. **Deterministic Fund Custody:** If the contract says funds can only be withdrawn if signed by the assigned worker after approval, no outsider—not even the platform creator—can bypass that condition.
2. **Immutability of Rules:** The payout logic, arbitration triggers, and deadline formulas cannot be altered secretly halfway through the engagement.
3. **Zero Counterparty Default on Payment:** The worker knows with mathematical certainty that the bounty reward is already locked in escrow before they write a single line of code.`,
      },
      {
        id: "what-contracts-cannot-guarantee",
        title: "4. What Smart Contracts CANNOT Guarantee",
        content: `There is a widespread myth that smart contracts "eliminate all human risk." This is untrue:

- **The Oracle Problem & Off-Chain Quality:** A smart contract running inside the AVM has no eyes or ears. It cannot inspect a GitHub pull request to see if the code compiles without bugs, or review a Figma file to see if the typography is attractive. It only knows what is signed on-chain.
- **Subjective Human Disputes:** If a poster says "this code does not satisfy my spec," and the worker says "I completed every requirement," no mathematical algorithm can determine who is telling the truth without human judgment.
- **Code Vulnerabilities:** If the smart contract contains a logic flaw (such as an unauthenticated function or integer overflow), attackers can exploit that flaw according to the rules of the code itself. "Code is law" means the computer executes exactly what is written, including human mistakes.`,
        callout: {
          title: "BountyVault's Honest Protocol Philosophy",
          text: "BountyVault acknowledges these limits directly. Rather than falsely claiming code can evaluate subjective creative deliverables, BountyVault pairs non-custodial smart escrow with a multi-role dispute arbitration mechanism.",
          type: "bountyvault",
        },
      },
    ],
    quiz: [
      {
        id: "q3-1",
        question: "What does Algorand's 'Atomic Transaction' feature guarantee?",
        options: [
          "Transactions can only be executed at nuclear research centers",
          "A group of up to 16 transactions will either all succeed together or all fail together with zero partial state",
          "Transactions are permanently encrypted and hidden from the public ledger",
          "Transaction fees are multiplied by the number of tokens sent",
        ],
        correctIndex: 1,
        explanation: "Atomic Transaction Composer guarantees all-or-nothing execution. If any transaction in the group fails, the entire group reverts instantly.",
      },
      {
        id: "q3-2",
        question: "Can an on-chain smart contract independently determine whether a freelance graphic designer's logo is aesthetically pleasing?",
        options: [
          "Yes, smart contracts automatically scan aesthetic quality using AVM neural networks",
          "No, smart contracts cannot evaluate subjective off-chain quality; human review or arbitration is required",
          "Yes, if the contract is written in TEAL",
          "Only on Bitcoin, not on Algorand",
        ],
        correctIndex: 1,
        explanation: "Smart contracts can only evaluate deterministic inputs provided to them on-chain. Evaluating creative quality, code elegance, and contractual satisfaction requires human oversight.",
      },
    ],
  },
  {
    id: "bounty-escrow",
    slug: "bounty-escrow",
    topicId: "escrow",
    title: "Bounty Escrow Architecture",
    subtitle: "Posters, Contributors, Escrow Lockup, and Dispute Resolution",
    difficulty: "Intermediate",
    readTime: "10 min read",
    category: "Platform Mechanics",
    summary: "Study the exact lifecycle implemented in BountyVault: bounty creation, escrow funding, applicant selection, milestone completion, cancellation rules, and the arbitrator dispute protocol.",
    relatedLessonIds: ["smart-contracts", "blockchain-security"],
    sections: [
      {
        id: "the-three-party-model",
        title: "1. The 3-Party Escrow Model",
        content: `Traditional freelance marketplaces charge up to 20% commission, delay payments for 14 days, and can arbitrarily freeze user funds.

BountyVault implements a decentralized 3-party architecture tailored to Algorand's fast settlement:

1. **The Poster (Client):** Creates bounty requirements, locks the reward in escrow, reviews applicants, and authorizes the final payout when deliverables satisfy the specification.
2. **The Worker (Contributor):** Browses open bounties, submits a proposal with their portfolio and Algorand wallet address, and performs the agreed work knowing payment is locked.
3. **The Arbitrator (Adjudicator):** An independent trusted entity who only intervenes if an active contract falls into dispute. The arbitrator investigates evidence and executes an on-chain settlement ruling in favor of either the worker or the poster.`,
        diagram: {
          type: "architecture",
          title: "BountyVault 3-Party Governance Flow",
          caption: "Separation of concerns between depositors, contributors, and adjudicators",
          items: [
            {
              label: "Poster",
              detail: "Funds reward → Selects applicant → Reviews deliverable → Authorizes release or raises dispute.",
              badge: "Capital Provider",
            },
            {
              label: "Escrow Vault",
              detail: "Holds funds in deterministic state lock. Releases exclusively to worker upon poster approval or arbitrator ruling.",
              badge: "Smart Escrow",
            },
            {
              label: "Worker",
              detail: "Reviews bounty specs → Submits application → Delivers work → Receives direct Algorand wallet payout.",
              badge: "Service Provider",
            },
            {
              label: "Arbitrator",
              detail: "Invoked only during disputes. Audits GitHub repos & messages. Enforces binding on-chain settlement.",
              badge: "Dispute Court",
            },
          ],
        },
      },
      {
        id: "lifecycle-stages",
        title: "2. The Full Bounty Lifecycle",
        content: `Here is the exact progression of a bounty in BountyVault:

### Stage 1: Creation & Funding (\`status: 'open'\`)
The poster fills out the title, description, category, deadline, and reward (e.g. 350 ALGO). The reward is locked into the escrow vault, generating an immutable transaction record. The bounty appears on the public Marketplace.

### Stage 2: Contributor Application
Interested developers and designers submit their name, email, credentials, proposal, and their Algorand public wallet address. Multiple workers can apply for the same open bounty.

### Stage 3: Worker Selection (\`status: 'acquired'\`)
The poster inspects pending applicants and selects the best candidate. BountyVault transitions the bounty to \`acquired\` status, permanently assigns the worker's wallet address to the bounty record, and marks other applications as rejected. The bounty is now locked to this worker.

### Stage 4: Work Delivery & Poster Approval (\`status: 'completed'\`)
The contributor completes the assignment and provides links to their GitHub repository, Figma file, or documentation. If the poster approves:
- The poster clicks **"Complete & Release Payout"**.
- BountyVault signs the payout transaction releasing the locked escrow funds directly to the worker's Algorand address.
- The transaction ID (\`txn_id\`) is permanently recorded on the blockchain.

### Alternative Path: Cancellation (\`status: 'cancelled'\`)
If a bounty has no selected worker, or if the poster cancels prior to acquisition, the poster can cancel the bounty. The escrow vault refunds the full deposit back to the poster.`,
      },
      {
        id: "dispute-protocol",
        title: "3. The Dispute Arbitration Protocol (\`status: 'disputed'\`)",
        content: `What happens if a poster goes dark after receiving the deliverables, or a contributor submits plagiarized code and demands payment?

This is where BountyVault's **On-Chain Dispute Protocol** engages:

1. **Raising a Dispute:** Once a bounty is \`acquired\`, either the poster or the assigned worker can click **"Raise Dispute"**. They must submit detailed reasons and evidence (e.g. PR links, communication logs). The bounty status immediately shifts to \`disputed\`, freezing any automated release or cancellation.
2. **Arbitrator Dashboard Investigation:** The dispute is escalated to the Arbitrator Console. The arbitrator reviews:
   - The original bounty requirements and deadline.
   - The worker's submitted deliverables and git commit timestamps.
   - The evidence provided by both parties.
3. **Binding Settlement:** The arbitrator renders a verdict by clicking either:
   - **"Rule for Worker"**: Escrow pays the contributor in full (\`status: 'completed'\`).
   - **"Rule for Poster"**: Escrow refunds the deposit to the poster (\`status: 'cancelled'\`).
4. The arbitrator signs the resolution with their Algorand wallet, generating an immutable settlement transaction ID viewable on the public ledger.`,
        callout: {
          title: "Balanced Incentives",
          text: "Posters cannot steal free work because the funds are locked in escrow and the worker can dispute. Workers cannot take funds without delivering because the poster must approve or the arbitrator must verify the deliverable.",
          type: "info",
        },
      },
    ],
    quiz: [
      {
        id: "q4-1",
        question: "Can a poster cancel a bounty and get their deposit back after a worker has been selected and the bounty is 'acquired'?",
        options: [
          "Yes, posters can cancel at any time without penalty",
          "No, once a bounty is acquired, funds can only be released upon completion or resolved through the arbitrator dispute protocol",
          "Yes, but only if they pay a 50% penalty to the website owner",
          "Only on weekends",
        ],
        correctIndex: 1,
        explanation: "Once a worker is selected and the bounty is acquired, unilateral cancellation is blocked to protect the worker who is actively expending effort on the task.",
      },
      {
        id: "q4-2",
        question: "Who can raise a dispute on an acquired bounty in BountyVault?",
        options: [
          "Any random visitor browsing the marketplace",
          "Only the verified poster or the assigned worker for that specific bounty",
          "Only the platform web hosting provider",
          "Only the Algorand Foundation",
        ],
        correctIndex: 1,
        explanation: "Only the legitimate counter-parties (the poster who funded the escrow or the contributor assigned to the bounty) have permission to trigger an official dispute.",
      },
      {
        id: "q4-3",
        question: "When the arbitrator resolves a dispute in favor of the contributor, what happens to the escrowed funds?",
        options: [
          "The funds are burned permanently",
          "The funds are released directly to the contributor's assigned wallet address",
          "The funds are transferred into the arbitrator's personal savings account",
          "The funds remain locked forever",
        ],
        correctIndex: 1,
        explanation: "Ruling for the worker releases the locked escrow payment directly to the worker's wallet address and marks the bounty completed with an on-chain transaction record.",
      },
    ],
  },
  {
    id: "blockchain-security",
    slug: "blockchain-security",
    topicId: "security",
    title: "Blockchain Security & Key Hygiene",
    subtitle: "Private Key Safety, Phishing, Malicious Transactions, and Auditing",
    difficulty: "Advanced",
    readTime: "9 min read",
    category: "Security",
    summary: "Deepen your operational security: how to store recovery seeds, identify subtle phishing schemes, audit transaction payloads before signing, and verify block confirmations.",
    relatedLessonIds: ["blockchain-fundamentals", "smart-contracts"],
    sections: [
      {
        id: "private-key-hygiene",
        title: "1. The Rules of Private Key Hygiene",
        content: `In Web3, there is no "Forgot My Password" link or centralized customer support desk that can restore an account. Your private key is the sole cryptographic authority over your funds.

### The Never-Ever List:
- **Never store your 25-word mnemonic in cloud storage, notes apps, or Google Docs.**
- **Never take a screenshot or photo of your seed phrase.** Mobile photo backup services (iCloud, Google Photos) are prime targets for credential thieves.
- **Never enter your seed phrase into a web page.** Legitimate dApps only request a connection to your browser extension; they never ask you to type your 25 words into their form fields.

### Best Practice:
Write your recovery words down on physical paper or stamp them into stainless steel seed backup plates. Store them in a fireproof, waterproof location.`,
      },
      {
        id: "phishing-and-social-engineering",
        title: "2. Phishing Vectors in Web3",
        content: `Attackers rarely "hack the blockchain"; they hack human psychology:

1. **Search Engine Ad Spoofing:** Attackers buy Google ads targeting keywords like "Pera Wallet" or "MyAlgo". The malicious ad links to an identical clone domain (e.g., \`pera-wa11et.org\`) designed to capture seed phrases. Always bookmark official URLs.
2. **Discord & Telegram Direct Messages:** Anyone who sends you an unsolicited private message offering "support," "airdrops," or "account verification" is an impersonator attempting to steal your credentials.
3. **Clipboard Hijackers:** Malware that monitors your operating system clipboard. When you copy a 58-character Algorand address, the malware silently swaps it with the attacker's address before you paste it. **Always visually verify the first and last 4 characters before clicking send.**`,
      },
      {
        id: "blind-signing",
        title: "3. Blind Signing & Transaction Inspection",
        content: `Whenever your wallet pops up a signing request:

- **Do NOT blindly click "Confirm".**
- Inspect the **Sender**: Is it your expected account?
- Inspect the **Receiver**: Does it match the verified escrow address or counterparty?
- Inspect the **Amount**: Is it 250 ALGO or 25,000 ALGO?
- Inspect the **Fee**: Is it the standard 0.001 ALGO, or has a malicious contract inflated the fee?
- Inspect the **Transaction Group**: If signing an atomic transfer, review every single transaction inside the group. Ensure the group does not slip in an unexpected asset transfer or account re-keying instruction.`,
        diagram: {
          type: "comparison",
          title: "Safe Signing Checklist",
          caption: "What to review before approving any wallet prompt",
          items: [
            {
              label: "Safe Transaction Prompt",
              detail: "Receiver matches expected contract ID. Fee is ~0.001 ALGO. Group contains only declared transfers. No 'RekeyTo' parameter specified.",
              badge: "Verified",
            },
            {
              label: "Suspicious Prompt",
              detail: "Prompts for RekeyTo field. High unexpected fees. Unfamiliar recipient address. Contract requests permission to spend all your assets.",
              badge: "Dangerous",
            },
          ],
        },
      },
      {
        id: "block-explorers",
        title: "4. Verifying Transactions on Block Explorers",
        content: `Block explorers (such as AlgoExplorer, Lora, or DappFlow) provide a transparent window into ledger state. 

Whenever you fund a bounty or complete a milestone in BountyVault:
1. Copy the returned transaction hash (\`txn_id\`).
2. Paste it into an Algorand explorer.
3. Confirm the round number, exact microAlgo transfer, and timestamp.
4. Because Algorand has instant finality, once a transaction shows up in a confirmed round, it is permanent and mathematically irreversible.`,
      },
    ],
    quiz: [
      {
        id: "q5-1",
        question: "If a Discord administrator offers to 'help verify your wallet' by asking for your 25-word mnemonic, what should you do?",
        options: [
          "Send the words promptly so your account is verified",
          "Send only the first 12 words",
          "Block and report them immediately—it is a 100% scam to drain your wallet",
          "Pay them a 5 ALGO tip",
        ],
        correctIndex: 2,
        explanation: "No legitimate administrator, project lead, or support team will EVER ask for your seed phrase. Anyone asking for your mnemonic is an attacker seeking to steal your funds.",
      },
      {
        id: "q5-2",
        question: "Why should you always inspect the first and last characters of a pasted cryptocurrency address?",
        options: [
          "To ensure the address is aesthetically balanced",
          "To guard against clipboard-hijacking malware that secretly replaces copied addresses with an attacker's address",
          "Because Algorand addresses change every 10 seconds",
          "It is required by law in the European Union",
        ],
        correctIndex: 1,
        explanation: "Clipboard malware monitors when users copy crypto addresses and substitutes the attacker's address. Visually verifying characters prevents sending funds to a thief.",
      },
    ],
  },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Algorand",
    category: "Algorand",
    definition: "A high-performance, decentralized, Pure Proof of Stake (PPoS) layer-1 blockchain created by cryptographer Silvio Micali, featuring instant finality and micro-fees.",
    example: "BountyVault executes its smart escrow contracts on the Algorand blockchain.",
    relatedTerms: ["PPoS", "TEAL", "AVM"],
  },
  {
    term: "ALGO",
    category: "Algorand",
    definition: "The native cryptocurrency utility token of the Algorand network, used for transaction fees, staking, and maintaining minimum balance requirements.",
    example: "The bounty reward is funded with 350 ALGO locked in escrow.",
    relatedTerms: ["microAlgo", "MBR"],
  },
  {
    term: "Arbitrator",
    category: "Escrow",
    definition: "An independent, designated adjudicator with authority to review evidence and issue a binding on-chain settlement when an escrow milestone falls into dispute.",
    example: "In BountyVault, the arbitrator reviews submitted git commits before choosing to rule for the worker or poster.",
    relatedTerms: ["Dispute Protocol", "Escrow"],
  },
  {
    term: "Atomic Transfer",
    category: "Algorand",
    definition: "A native Algorand capability that groups up to 16 separate transactions so that they all execute simultaneously or all fail and revert together with zero partial state.",
    example: "BountyVault couples the escrow deposit and app state call in an atomic transfer.",
    relatedTerms: ["Smart Contract", "Transaction"],
  },
  {
    term: "AVM (Algorand Virtual Machine)",
    category: "Algorand",
    definition: "The execution runtime embedded across all Algorand validating nodes that interprets and runs compiled TEAL smart contract bytecode.",
    example: "The AVM processes state changes in ~3.3 seconds per block.",
    relatedTerms: ["TEAL", "Smart Contract"],
  },
  {
    term: "Block Explorer",
    category: "Blockchain",
    definition: "A public search engine and ledger inspector (like AlgoExplorer or Lora) that enables anyone to view blocks, transactions, balances, and smart contracts.",
    example: "Users can copy any BountyVault txn_id and look it up on a block explorer to verify on-chain settlement.",
    relatedTerms: ["Transaction ID", "Public Address"],
  },
  {
    term: "Burner Wallet",
    category: "Security",
    definition: "A disposable cryptocurrency wallet used exclusively for testing, low-value interactions, or testnet faucets to insulate primary savings from risks.",
    example: "Always connect a burner wallet when exploring new testnet applications.",
    relatedTerms: ["Private Key", "Testnet"],
  },
  {
    term: "Consensus",
    category: "Blockchain",
    definition: "The protocol rules and cryptographic processes by which distributed peer nodes agree on the valid transaction history of a blockchain without a central boss.",
    example: "Algorand reaches consensus via Pure Proof of Stake in ~3.3 seconds.",
    relatedTerms: ["PPoS", "Block"],
  },
  {
    term: "Dispute Protocol",
    category: "Escrow",
    definition: "The formal escalation process within BountyVault that freezes locked escrow funds and routes evidence to the arbitrator console for investigation.",
    example: "If a poster does not approve payment after valid code delivery, the worker triggers the dispute protocol.",
    relatedTerms: ["Arbitrator", "Escrow"],
  },
  {
    term: "Escrow",
    category: "Escrow",
    definition: "A financial arrangement where funds are held in trust by a third party or smart contract until specific agreed conditions are fulfilled.",
    example: "BountyVault uses programmable smart escrow so posters cannot pull funds while work is underway.",
    relatedTerms: ["Smart Contract", "Poster", "Worker"],
  },
  {
    term: "Faucet / Dispenser",
    category: "Algorand",
    definition: "A free automated service that distributes testnet tokens to developers and learners for testing purposes with zero financial cost.",
    example: "You can request 10 free Testnet ALGO from the official Algorand dispenser.",
    relatedTerms: ["Testnet", "ALGO"],
  },
  {
    term: "Instant Finality",
    category: "Blockchain",
    definition: "A blockchain property where confirmed blocks can never be orphaned, reorganized, or reversed, eliminating the need to wait for multiple confirmations.",
    example: "Algorand transactions have instant finality, meaning settlement is permanent in ~3.3 seconds.",
    relatedTerms: ["Consensus", "Block"],
  },
  {
    term: "MBR (Minimum Balance Requirement)",
    category: "Algorand",
    definition: "The minimum amount of ALGO (e.g. 0.1 ALGO base) an account must maintain to cover the storage cost of its ledger state on validating nodes.",
    example: "Opting into an asset increases your account's MBR by 0.1 ALGO until you opt out.",
    relatedTerms: ["ALGO", "microAlgo"],
  },
  {
    term: "Mempool",
    category: "Blockchain",
    definition: "The in-memory holding area on blockchain nodes where verified pending transactions wait before being bundled into a confirmed block.",
    example: "When you sign a transaction, it enters the node's mempool before inclusion in the next round.",
    relatedTerms: ["Transaction", "Block"],
  },
  {
    term: "MicroAlgo (µAlgo)",
    category: "Algorand",
    definition: "The smallest sub-unit of the Algorand cryptocurrency. 1 ALGO equals 1,000,000 microAlgos.",
    example: "The standard Algorand transaction fee is 1,000 microAlgos (0.001 ALGO).",
    relatedTerms: ["ALGO", "Transaction Fee"],
  },
  {
    term: "Mnemonic / Seed Phrase",
    category: "Security",
    definition: "A 25-word human-readable sequence representing the cryptographic entropy used to generate an Algorand account's private keys.",
    example: "Never share your 25-word mnemonic with anyone, as it gives full control of your account.",
    relatedTerms: ["Private Key", "Public Address"],
  },
  {
    term: "Non-Custodial",
    category: "Blockchain",
    definition: "A system design where users maintain sole custody of their private keys and assets, rather than entrusting funds to an intermediary company.",
    example: "BountyVault is non-custodial: funds are locked directly in smart contract escrow, not in a company bank account.",
    relatedTerms: ["Private Key", "Escrow"],
  },
  {
    term: "Oracle Problem",
    category: "Smart Contracts",
    definition: "The inability of an isolated blockchain smart contract to natively observe or verify real-world off-chain facts without external data feeds or human inputs.",
    example: "A smart contract cannot tell if a logo is pretty, which is why BountyVault uses human arbitration for disputes.",
    relatedTerms: ["Smart Contract", "Arbitrator"],
  },
  {
    term: "Pera Wallet",
    category: "Algorand",
    definition: "The premier non-custodial mobile and web extension wallet for the Algorand ecosystem, supporting direct dApp connections via WalletConnect.",
    example: "You can connect your Pera Wallet to BountyVault to sign bounty transactions.",
    relatedTerms: ["Public Address", "Private Key"],
  },
  {
    term: "Phishing",
    category: "Security",
    definition: "A fraudulent attempt by attackers to steal sensitive credentials (like private keys or passwords) by disguising themselves as trustworthy websites or people.",
    example: "Always check the domain name in your browser bar to protect yourself from fake wallet phishing clones.",
    relatedTerms: ["Burner Wallet", "Mnemonic"],
  },
  {
    term: "Poster",
    category: "Escrow",
    definition: "The user in BountyVault who publishes a task specification and funds the escrow reward with ALGO.",
    example: "The poster reviews applicants and selects the most qualified developer for the task.",
    relatedTerms: ["Worker", "Escrow", "Bounty"],
  },
  {
    term: "PPoS (Pure Proof of Stake)",
    category: "Algorand",
    definition: "Algorand's consensus protocol that randomly and secretly selects block validators from all online ALGO holders using a Verifiable Random Function (VRF).",
    example: "PPoS prevents network forks and allows Algorand to operate with near-zero energy consumption.",
    relatedTerms: ["Consensus", "Algorand", "VRF"],
  },
  {
    term: "Private Key",
    category: "Security",
    definition: "A secret 256-bit cryptographic number used to generate digital signatures that prove ownership and authorize outbound transactions.",
    example: "Your private key stays secured inside your wallet extension and is never transmitted over the internet.",
    relatedTerms: ["Public Address", "Mnemonic"],
  },
  {
    term: "Public Address",
    category: "Blockchain",
    definition: "A public 58-character alphanumeric identifier derived from a public key that others use to send you cryptocurrency tokens.",
    example: "When applying for a bounty, the worker provides their Algorand public address to receive payouts.",
    relatedTerms: ["Private Key", "ALGO"],
  },
  {
    term: "Smart Contract",
    category: "Smart Contracts",
    definition: "A deterministic computer program deployed to the blockchain that executes agreed rules automatically whenever called by transactions.",
    example: "The bounty escrow smart contract releases funds only when the poster approves or the arbitrator resolves a dispute.",
    relatedTerms: ["TEAL", "AVM", "Escrow"],
  },
  {
    term: "TEAL",
    category: "Algorand",
    definition: "Transaction Execution Approval Language; the stack-based assembly language that executes on the Algorand Virtual Machine (AVM).",
    example: "BountyVault's escrow contract logic is compiled into TEAL bytecode.",
    relatedTerms: ["AVM", "Smart Contract"],
  },
  {
    term: "Testnet",
    category: "Blockchain",
    definition: "An alternative blockchain environment identical to mainnet used for testing where tokens are free and have no real economic value.",
    example: "BountyVault is connected to Algorand Testnet so users can safely experiment without spending real money.",
    relatedTerms: ["Faucet", "Mainnet"],
  },
  {
    term: "Transaction ID (Txn ID)",
    category: "Blockchain",
    definition: "A unique 52-character cryptographic hash assigned to every confirmed transaction on the Algorand blockchain.",
    example: "Upon escrow completion, BountyVault provides a txn_id that can be verified on any block explorer.",
    relatedTerms: ["Block Explorer", "Transaction"],
  },
  {
    term: "VRF (Verifiable Random Function)",
    category: "Algorand",
    definition: "A cryptographic primitive used in Algorand's PPoS consensus that generates provably unpredictable and tamper-proof random selections.",
    example: "The VRF selects which node proposes the next block without revealing the proposer until the block is broadcast.",
    relatedTerms: ["PPoS", "Consensus"],
  },
  {
    term: "Worker / Contributor",
    category: "Escrow",
    definition: "The freelancer or developer who applies for an open bounty, executes the required deliverable, and receives the escrowed payout upon completion.",
    example: "Once selected, the worker delivers the code repository and awaits approval or arbitrator settlement.",
    relatedTerms: ["Poster", "Escrow", "Arbitrator"],
  },
];
