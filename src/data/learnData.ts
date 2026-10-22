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
  codeSnippet?: string;
  callout?: {
    type: "info" | "warning" | "implementation";
    title: string;
    text: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  category: "Fundamentals" | "Algorand" | "Smart Contracts" | "Escrow" | "Security";
  summary: string;
  keyTakeaways: string[];
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

export interface GlossaryTerm {
  term: string;
  category: "Blockchain" | "Algorand" | "Escrow" | "Security" | "Cryptography" | "Smart Contracts";
  definition: string;
  example: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "blockchain-fundamentals",
    title: "Blockchain Fundamentals",
    subtitle: "Understanding distributed ledgers, blocks, consensus, and cryptographic keys.",
    difficulty: "Beginner",
    readTime: "6 min",
    category: "Fundamentals",
    summary: "Discover how blockchains create tamper-resistant ledgers without central administrators, and how public and private keys govern digital ownership.",
    keyTakeaways: [
      "A blockchain is a shared, append-only database replicated across hundreds or thousands of independent nodes.",
      "Blocks package transactions cryptographically using cryptographic hash pointers back to the previous block.",
      "Consensus protocols ensure all participating network nodes agree on the true order and validity of state changes.",
      "Your public address receives funds, while your private key mathematically signs transactions to spend or lock funds."
    ],
    sections: [
      {
        id: "distributed-ledgers",
        title: "1. What is a Distributed Ledger?",
        content: `In traditional finance, a single entity—such as a bank or centralized escrow company—maintains the authoritative database of who owns what. If that bank’s database is altered, hacked, or censored, users have limited direct recourse.\n\nA blockchain replaces that single point of failure with a distributed ledger: a synchronized, decentralized database replicated across an open network of computers (called nodes). Every node independently validates every transaction against a strict set of cryptographic rules.\n\nBecause every node independently verifies every entry, no single party can forge account balances or reverse a confirmed transaction without overwhelming the network's consensus.`
      },
      {
        id: "blocks-and-chaining",
        title: "2. Blocks, Hashes, and the Immutable Chain",
        content: `Transactions are not stored individually; they are grouped into blocks. Each block contains:\n\n1. A block header containing metadata (timestamp, round/block number, state root).\n2. The list of verified transactions in that block.\n3. The cryptographic hash of the immediate predecessor block.\n\nA cryptographic hash function (such as SHA-256) takes arbitrary input and produces a fixed-size fingerprint. Even a single character difference in a block completely changes its hash. Because each block includes the previous block's hash, altering any past transaction would invalidate every subsequent block, making historical tampering mathematically impossible.`,
        callout: {
          type: "info",
          title: "Cryptographic Immutability",
          text: "Once a block is confirmed by network consensus, changing even a single digit in a transaction would break the cryptographic hash chain for all subsequent blocks."
        }
      },
      {
        id: "public-private-keys",
        title: "3. Public Addresses vs. Private Keys",
        content: `In blockchain networks, user identity is purely cryptographic rather than based on passwords stored in a centralized database:\n\n• Private Key: A 256-bit secret random number (often encoded as a 25-word mnemonic recovery phrase). You must NEVER reveal or share this secret. It allows you to create digital signatures authorizing payments.\n\n• Public Key & Address: Derived mathematically from your private key through one-way elliptic curve cryptography. This is your public receiving address that you share with clients or posters so they can send you funds.\n\nAnyone can verify that a signature was produced by the private key matching your public address without ever seeing your private key.`,
        callout: {
          type: "warning",
          title: "The Golden Rule of Web3",
          text: "Never share your 25-word mnemonic seed phrase with anyone. If another party obtains your private key, they can sign transactions transferring all your assets permanently."
        }
      },
      {
        id: "bountyvault-application",
        title: "4. How BountyVault Applies Fundamentals",
        content: `When you connect an Algorand wallet (like Pera Wallet) to BountyVault, BountyVault never sees or stores your private key. Instead, when you post a bounty or release payment, your wallet generates a signature locally on your device. BountyVault only submits this cryptographic proof to the Algorand blockchain.`,
        callout: {
          type: "implementation",
          title: "BountyVault Implementation Note",
          text: "BountyVault does not maintain custodial user wallets. Your Algorand wallet address is used as your decentralized account identity for payments and contract state queries."
        }
      }
    ],
    quiz: [
      {
        id: "bf-q1",
        question: "What connects each block to the previous block in a blockchain?",
        options: [
          "A centralized server authentication token",
          "The cryptographic hash of the previous block's header",
          "An administrative email confirmation",
          "A user's plaintext password"
        ],
        correctIndex: 1,
        explanation: "Blocks are chained together by including the cryptographic hash of the previous block in the new block's header, making retroactive tampering easily detectable."
      },
      {
        id: "bf-q2",
        question: "Which of the following is safe to share publicly with clients or posters?",
        options: [
          "Your 25-word recovery mnemonic seed phrase",
          "Your private key file",
          "Your public Algorand wallet address",
          "Your wallet client secret backup"
        ],
        correctIndex: 2,
        explanation: "Your public wallet address is designed to be shared so others can send you payments or check contract assignments. The private key and seed phrase must remain secret."
      },
      {
        id: "bf-q3",
        question: "Does BountyVault store your wallet private keys on its backend servers?",
        options: [
          "Yes, in an encrypted SQL table",
          "No, private keys stay in your browser wallet extension and sign locally",
          "Yes, but only for arbitrator accounts",
          "Yes, whenever you create a bounty"
        ],
        correctIndex: 1,
        explanation: "BountyVault is non-custodial. All signatures are generated locally in your wallet (e.g. Pera Wallet), and private keys are never transmitted to BountyVault servers."
      }
    ]
  },
  {
    id: "crypto-and-algorand",
    title: "Cryptocurrency and Algorand",
    subtitle: "Understanding ALGO, transaction fees, testnet vs mainnet, and fast finality.",
    difficulty: "Beginner",
    readTime: "7 min",
    category: "Algorand",
    summary: "Learn how the Algorand blockchain operates, why sub-4-second finality matters for escrow, and the difference between testing on Testnet and settling on Mainnet.",
    keyTakeaways: [
      "ALGO is the native utility and staking token of the Algorand blockchain.",
      "Algorand uses Pure Proof of Stake (PPoS), achieving transaction finality in roughly 3.3 seconds without blockchain forks.",
      "Network fees on Algorand are fixed and extremely low: 0.001 ALGO per standard transaction.",
      "Testnet provides a mirror environment where developers and users test without risking real financial value."
    ],
    sections: [
      {
        id: "what-is-algo",
        title: "1. What is Algorand and the ALGO Token?",
        content: `Algorand was created by Turing Award-winning cryptographer Silvio Micali to solve the blockchain trilemma: achieving decentralization, scalability, and security simultaneously without sacrificing environmental efficiency.\n\nALGO is the base currency of Algorand. It serves three main purposes:\n1. Payment of transaction fees to validators.\n2. Minimum balance requirement (MBR) for holding accounts and smart contract state storage.\n3. Escrow denomination for trustless agreements, such as bounties on BountyVault.`
      },
      {
        id: "instant-finality",
        title: "2. Sub-4s Block Finality: Why it Matters for Escrow",
        content: `On proof-of-work chains like Bitcoin or early Ethereum, transactions require multiple block confirmations (often 15 to 60 minutes) because temporary chain splits ('forks') can occur.\n\nAlgorand consensus ensures instant finality. Once a block is assembled and certified (in ~3.3 seconds), it is mathematically guaranteed that the block will never be orphaned or re-organized. For an escrow platform like BountyVault, this means that once a client funds a bounty or an arbitrator settles a dispute, the funds are immediately settled with zero risk of transaction reversal.`,
        callout: {
          type: "info",
          title: "Deterministic Finality",
          text: "Algorand guarantees no forks. When a bounty transaction receives 1 confirmation, the transfer is complete and irrevocable."
        }
      },
      {
        id: "network-fees",
        title: "3. Predictable, Low Transaction Fees",
        content: `On networks like Ethereum, gas fees fluctuate wildly based on network congestion, often costing tens of dollars just to interact with a smart contract.\n\nOn Algorand, the minimum fee is fixed at 0.001 ALGO (a tiny fraction of one cent). This allows BountyVault users to post bounties, submit milestones, and release micro-escrow payments without losing substantial value to network overhead.`
      },
      {
        id: "testnet-vs-mainnet",
        title: "4. Testnet vs. Mainnet Environments",
        content: `BountyVault currently operates against Algorand Testnet. Here is the vital distinction:\n\n• Testnet: A public testing network that replicates Mainnet protocols. ALGO on Testnet has zero real-world financial value and can be obtained free from public faucets (dispensers) for testing purposes.\n\n• Mainnet: The live economic network where ALGO has real market exchange value.\n\nBy operating on Testnet, developers and contributors can test the entire bounty lifecycle—funding, proposals, approval, dispute resolution—without risking real financial capital.`,
        callout: {
          type: "warning",
          title: "Testnet Notice",
          text: "ALGO tokens displayed in BountyVault are Algorand Testnet tokens. They cannot be redeemed for fiat currency or transferred to Mainnet addresses."
        }
      }
    ],
    quiz: [
      {
        id: "ca-q1",
        question: "How long does Algorand typically take to reach final transaction settlement?",
        options: [
          "Roughly 3.3 seconds (instant block finality)",
          "10 to 60 minutes depending on miner confirmation",
          "24 business hours",
          "Settlement occurs only at midnight UTC"
        ],
        correctIndex: 0,
        explanation: "Algorand produces blocks in approximately 3.3 seconds with immediate cryptographic finality and no risk of forks."
      },
      {
        id: "ca-q2",
        question: "What is the standard minimum network fee for a transaction on Algorand?",
        options: [
          "0.001 ALGO",
          "5.0 ALGO",
          "Variable gas fee between $20 and $100",
          "10% of the transaction amount"
        ],
        correctIndex: 0,
        explanation: "Algorand uses a predictable minimum fee of 0.001 ALGO per transaction, preventing expensive gas spikes."
      },
      {
        id: "ca-q3",
        question: "What is the primary purpose of the Algorand Testnet?",
        options: [
          "To trade tokens for real fiat profit",
          "To safely test smart contracts, escrow, and wallets without real money risk",
          "To bypass blockchain security rules",
          "To permanently delete old transactions"
        ],
        correctIndex: 1,
        explanation: "Testnet mirrors Mainnet functionality using zero-value test tokens so engineers and users can test applications without financial risk."
      }
    ]
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts & Verification",
    subtitle: "What smart contracts are, what they can and cannot guarantee, and their limitations.",
    difficulty: "Intermediate",
    readTime: "8 min",
    category: "Smart Contracts",
    summary: "Examine how programmable blockchain contracts execute deterministic logic, why code cannot inspect off-chain deliverables on its own, and how TEAL guarantees escrow funds.",
    keyTakeaways: [
      "A smart contract is deterministic program code deployed to a blockchain that automatically executes state changes when preconditions are met.",
      "Smart contracts cannot read off-chain realities (like whether a pull request is high-quality) without an oracle or human approval.",
      "Algorand smart contracts are written in TEAL (Transaction Execution Approval Language) or compiled from Python/TypeScript.",
      "Smart contracts guarantee that funds cannot be siphoned outside defined code paths, but they cannot guarantee that participants will always behave honorably off-chain."
    ],
    sections: [
      {
        id: "what-is-smart-contract",
        title: "1. What is a Smart Contract?",
        content: `A smart contract is a computer program stored directly on a blockchain. Just like a vending machine dispenses a beverage only when the exact coin amount is inserted and a selection button is pressed, a smart contract releases funds or updates records only when predefined conditions are satisfied.\n\nBecause the contract code runs across every node on the network, no single party can prevent it from executing once its requirements are fulfilled.`
      },
      {
        id: "what-they-guarantee",
        title: "2. What Smart Contracts CAN Guarantee",
        content: `Smart contracts excel at mathematical and deterministic custody:\n\n✓ Non-Custodial Lockup: Once a client deposits 200 ALGO into the contract account, the client cannot withdraw those funds behind the contributor’s back while work is active.\n✓ Strict Destination Rules: The contract enforces that funds may only be disbursed to the assigned contributor’s address or refunded to the poster under explicit conditions.\n✓ Multi-Party Authorization: Release requires authorized digital signatures (client sign-off or arbitrator verdict).`
      },
      {
        id: "what-they-cannot-guarantee",
        title: "3. What Smart Contracts CANNOT Guarantee",
        content: `It is critical to understand the boundaries of smart contract technology:\n\n✗ Deliverable Quality Assessment: A smart contract cannot read a Figma file or inspect code to know whether a website looks aesthetic or satisfies UX requirements.\n✗ Off-Chain Verification: The blockchain has no native connection to external websites, GitHub repos, or real-world events (this is known as the 'Oracle Problem').\n✗ Automatic Dispute Settlement: If a client claims work was incomplete while the contributor claims it was perfect, a smart contract cannot magically discern the truth on its own; human arbitration is required.`,
        callout: {
          type: "warning",
          title: "The Realistic Boundary",
          text: "Smart contracts secure the funds in escrow, but they cannot evaluate human creative work. That is why BountyVault includes an on-chain dispute arbitration mechanism."
        }
      },
      {
        id: "teal-architecture",
        title: "4. Algorand TEAL Architecture",
        content: `Algorand executes smart contracts using TEAL (Transaction Execution Approval Language). TEAL programs are bytecode-interpreted stack machines designed for maximum speed and security. Smart contracts on Algorand can be:\n\n1. Smart Signatures (LogicSigs): Stateless scripts that approve or reject transactions according to logic.\n2. Smart Contracts (Applications): Stateful programs that maintain global key-value storage (such as bounty status, assigned worker address, and escrow balances) on the Algorand ledger.`
      }
    ],
    quiz: [
      {
        id: "sc-q1",
        question: "Which of the following can a blockchain smart contract natively guarantee?",
        options: [
          "That a freelancer will deliver bug-free software",
          "That deposited escrow funds cannot be withdrawn without meeting code-defined signature rules",
          "That a client will always be completely honest in their feedback",
          "That off-chain code tests run automatically without human triggers"
        ],
        correctIndex: 1,
        explanation: "Smart contracts enforce on-chain mathematical custody and signature checks. They cannot evaluate the quality or subjective value of off-chain creative work."
      },
      {
        id: "sc-q2",
        question: "What is known as the 'Oracle Problem' in blockchain systems?",
        options: [
          "Smart contracts run out of storage space",
          "Blockchains cannot natively verify data or events that happen outside the blockchain",
          "Users forgetting their account passwords",
          "Blockchains having too many validators"
        ],
        correctIndex: 1,
        explanation: "Blockchains only know on-chain data. They cannot independently observe real-world events, website uptime, or off-chain repository deliverables without human or oracle inputs."
      },
      {
        id: "sc-q3",
        question: "What programming execution model does Algorand utilize for smart contracts?",
        options: [
          "TEAL (Transaction Execution Approval Language) stack machine",
          "Windows .NET CLR",
          "Java Virtual Machine (JVM)",
          "PHP Script Interpreter"
        ],
        correctIndex: 0,
        explanation: "Algorand smart contracts run on TEAL, an efficient stack machine language with sub-second execution."
      }
    ]
  },
  {
    id: "bounty-escrow",
    title: "Bounty Escrow Mechanics",
    subtitle: "The precise step-by-step lifecycle of escrow in BountyVault.",
    difficulty: "Intermediate",
    readTime: "8 min",
    category: "Escrow",
    summary: "Walk through the exact implemented workflows in BountyVault: creation, funding, worker selection, deliverable review, payout approval, cancellation, and arbitration.",
    keyTakeaways: [
      "Escrow prevents the 'payment before work' versus 'work before payment' deadlock.",
      "BountyVault implements a strict 5-state lifecycle: Open -> Acquired -> Completed / Cancelled / Disputed -> Resolved.",
      "Posters retain full cancellation rights with 100% refund only while the bounty remains unassigned (Open).",
      "Once acquired, funds are frozen until the poster signs a release or an arbitrator issues an on-chain ruling."
    ],
    sections: [
      {
        id: "the-freelance-dilemma",
        title: "1. The Freelance Counterparty Dilemma",
        content: `In traditional freelance commerce, two opposing fears exist:\n\n1. The Client’s Fear: 'If I pay upfront, the worker might disappear without delivering the work.'\n2. The Contributor’s Fear: 'If I build the project first, the client might refuse to pay, demand endless revisions, or ghost me.'\n\nEscrow solves this dilemma by placing the client's money into a neutral smart contract vault before work begins. The contributor can see the locked funds on-chain, proving the client has skin in the game. The client knows the funds will only be released once the deliverable is inspected.`
      },
      {
        id: "bountyvault-lifecycle",
        title: "2. The BountyVault Implemented Workflow",
        content: `BountyVault follows an exact finite-state machine implemented in its smart contract layer:\n\n1. Creation & Funding: Poster inputs bounty title, description, reward, and deadline. Escrow funds are committed.\n2. Application: Contributors browse the marketplace and submit proposals (skills, timeline, wallet address).\n3. Selection (State -> ACQUIRED): Poster selects the preferred applicant. The contract records the worker's address and locks the escrow in-flight.\n4. Approval (State -> COMPLETED): Contributor delivers work. Poster confirms acceptance and signs payout release.\n5. Cancellation (State -> CANCELLED): If no suitable contributor applies, poster can cancel and retrieve 100% of escrow.\n6. Dispute (State -> DISPUTED): If unresolvable conflict occurs, poster or worker raises a dispute. An arbitrator reviews evidence and executes settlement.`
      },
      {
        id: "escrow-state-diagram",
        title: "3. Escrow State Invariants",
        content: `State transitions are strictly one-directional to prevent double-spending:\n\n[ OPEN ]\n  ├── (Poster cancels) ──────────────> [ CANCELLED ] (100% Refund)\n  └── (Poster selects worker) ──────> [ ACQUIRED ]\n                                         ├── (Poster approves) ─────────> [ COMPLETED ] (100% Worker Payout)\n                                         └── (Either party disputes) ───> [ DISPUTED ]\n                                                                             ├── (Arbitrator rules Worker) -> [ RESOLVED ]\n                                                                             └── (Arbitrator rules Poster) -> [ RESOLVED ]`,
        callout: {
          type: "implementation",
          title: "BountyVault Workflow Truth",
          text: "A poster CANNOT unilaterally cancel a bounty once a worker has been selected (Acquired state). At that stage, funds can only exit via approval or arbitration."
        }
      }
    ],
    quiz: [
      {
        id: "be-q1",
        question: "When can a poster cancel a bounty and receive a 100% escrow refund?",
        options: [
          "At any time, even after the worker finishes the code",
          "Only while the bounty is in the 'Open' state before a contributor is assigned",
          "Never; all deposits are permanently locked",
          "Only if the arbitrator agrees to delete the account"
        ],
        correctIndex: 1,
        explanation: "Once a contributor is assigned (Acquired state), the poster can no longer unilaterally cancel, protecting the contributor who is actively working."
      },
      {
        id: "be-q2",
        question: "What happens to the escrowed funds when a dispute is opened?",
        options: [
          "The funds are immediately burned by the network",
          "The escrow is frozen in the contract until an arbitrator issues an on-chain verdict",
          "Funds are automatically split 50/50 without review",
          "The client's wallet automatically recovers the balance"
        ],
        correctIndex: 1,
        explanation: "Filing a dispute freezes the contract balance. Only an authorized arbitrator can execute an on-chain verdict to award the funds to the rightful party."
      },
      {
        id: "be-q3",
        question: "Why does seeing locked funds in escrow benefit a contributor?",
        options: [
          "It proves the client has deposited the funds upfront and cannot secretly withdraw them while work is in progress",
          "It gives the contributor custody of the client's bank account",
          "It guarantees the code will have zero bugs",
          "It automatically pays the worker before they write any code"
        ],
        correctIndex: 0,
        explanation: "Locked escrow guarantees solvency: the client has already deposited the reward into the smart contract, eliminating payment default risk."
      }
    ]
  },
  {
    id: "blockchain-security",
    title: "Blockchain Security & Safe Practices",
    subtitle: "Protecting private keys, recognizing phishing, verifying transactions, and contract risks.",
    difficulty: "Advanced",
    readTime: "9 min",
    category: "Security",
    summary: "Learn essential defensive practices in Web3: protecting seed phrases, verifying transaction parameters in your wallet popup, recognizing phishing traps, and smart contract audit realities.",
    keyTakeaways: [
      "A blockchain transaction cannot be undone by customer service; you are your own security officer.",
      "Phishing websites masquerade as legitimate decentralized apps to trick users into signing malicious transactions.",
      "Always inspect the recipient address and asset amount displayed in your wallet signing modal before confirming.",
      "Hardware wallets and air-gapped devices provide physical isolation for high-value cryptographic keys."
    ],
    sections: [
      {
        id: "private-key-custody",
        title: "1. The Absolute Law of Private Key Custody",
        content: `In Web3, there is no 'Forgot Password' button managed by a corporate IT department. If you lose your private key or 25-word mnemonic phrase, your account and all associated funds are irretrievably lost.\n\nKey Hygiene Checklist:\n• Write your seed phrase on paper or stamp it into metal; never store it in plain text on cloud storage, Google Docs, or email drafts.\n• Never type your seed phrase into a website or web form. Genuine dApps like BountyVault only ever request wallet connection via your extension popup—they will NEVER ask for your mnemonic phrase.\n• Beware of fake direct messages on Discord, Telegram, or Twitter claiming to be 'BountyVault Support'. Support agents will never ask for your keys.`
      },
      {
        id: "transaction-signing-verification",
        title: "2. Verifying What You Sign",
        content: `When interacting with any decentralized application, your wallet (e.g., Pera Wallet) will display a signing prompt. NEVER blindly click 'Confirm'.\n\nAlways verify:\n1. Transaction Type: Is it an asset payment, application call, or asset opt-in?\n2. Recipient Address: Does it match the intended contract or recipient account?\n3. Amount: Is the exact amount in ALGO what you expected?\n4. Network: Are you connected to Testnet or Mainnet?`
      },
      {
        id: "smart-contract-risks",
        title: "3. Smart Contract Risks and Honest Realities",
        content: `While smart contracts eliminate human discretion in transaction routing, they are still programs written by human software engineers. Potential risks include:\n\n• Logic Bugs: Unanticipated edge cases in smart contract code can lead to frozen funds or unintended behavior.\n• Re-entrancy & State Traps: Flawed state updates can allow bad actors to exploit contract balances.\n• Key Compromise: If a designated arbitrator's private key is compromised, an unauthorized actor could issue fraudulent dispute rulings.\n\nBountyVault minimizes risk by keeping contract logic simple, strictly compartmentalizing role actions, and testing extensively on Algorand Testnet.`,
        callout: {
          type: "warning",
          title: "Defense in Depth",
          text: "Never keep all your funds in hot browser extensions. Keep operational funds separate from cold storage vaults."
        }
      }
    ],
    quiz: [
      {
        id: "bs-q1",
        question: "If a user forgets or loses their 25-word mnemonic seed phrase, what can BountyVault support do?",
        options: [
          "Reset the password and email a temporary link",
          "Nothing; blockchain accounts are non-custodial and cannot be recovered by any third party",
          "Issue a refund from the central reserve",
          "Decrypt the backup stored in the SQL database"
        ],
        correctIndex: 1,
        explanation: "Non-custodial architecture means only the keyholder controls the private key. No support team or developer can recover a lost seed phrase."
      },
      {
        id: "bs-q2",
        question: "What should you always check in your wallet prompt before signing a transaction?",
        options: [
          "The recipient address, transaction amount, and network",
          "The battery percentage of your laptop",
          "Your browser history",
          "The current weather"
        ],
        correctIndex: 0,
        explanation: "Always verify the recipient address, amount, and network in the wallet signing dialog to prevent signing malicious transactions."
      },
      {
        id: "bs-q3",
        question: "A website prompts you to enter your 25-word mnemonic seed phrase to 'verify your wallet balance'. What should you do?",
        options: [
          "Type it in immediately to sync balances",
          "Leave the site immediately; it is a malicious phishing attack",
          "Enter only the first 12 words",
          "Send it to a support agent via Discord"
        ],
        correctIndex: 1,
        explanation: "No legitimate decentralized application or wallet connection protocol ever requires entering your seed phrase on a web page. This is always a phishing attempt."
      }
    ]
  }
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "ALGO",
    category: "Algorand",
    definition: "The native base cryptocurrency of the Algorand blockchain used for transaction fees, staking, and smart contract minimum balance requirements.",
    example: "A bounty poster deposits 150 ALGO into the non-custodial smart contract escrow."
  },
  {
    term: "Algorand Standard Asset (ASA)",
    category: "Algorand",
    definition: "A standardized token layer built directly into Algorand's Layer-1 architecture, enabling custom fungible and non-fungible tokens.",
    example: "Stablecoins like USDC operate as ASAs on Algorand with 3.3-second settlement times."
  },
  {
    term: "Arbitration",
    category: "Escrow",
    definition: "The legal or smart-contract procedure wherein an authorized neutral third party evaluates evidence to settle contested escrow funds.",
    example: "When the client and freelancer disagreed on deliverable completion, the arbitrator reviewed the GitHub commits to rule."
  },
  {
    term: "Blockchain",
    category: "Blockchain",
    definition: "A distributed, cryptographically linked chain of blocks containing immutable transaction records agreed upon by network consensus.",
    example: "Algorand’s blockchain produces blocks approximately every 3.3 seconds."
  },
  {
    term: "Consensus Mechanism",
    category: "Blockchain",
    definition: "The cryptographic protocol by which independent nodes in a network agree on the authoritative state and ordering of transactions.",
    example: "Algorand uses Pure Proof of Stake (PPoS), selecting block leaders based on randomly weighted stake."
  },
  {
    term: "Cryptographic Hash",
    category: "Cryptography",
    definition: "A one-way mathematical function that converts arbitrary data into a fixed-length string of characters, sensitive to any change in input.",
    example: "Every Algorand block header contains the hash of the preceding block to guarantee immutability."
  },
  {
    term: "Escrow",
    category: "Escrow",
    definition: "A financial arrangement where funds are held by a neutral mechanism (in BountyVault, an automated smart contract) until conditions are met.",
    example: "Client deposits the reward into escrow; once the code is approved, the escrow releases funds to the contributor."
  },
  {
    term: "Finality",
    category: "Blockchain",
    definition: "The guarantee that once a transaction is included in a block, it is permanent and cannot be reversed or altered by chain forks.",
    example: "Algorand achieves instant finality, meaning transactions require no waiting for multiple confirmation rounds."
  },
  {
    term: "Mnemonic Seed Phrase",
    category: "Security",
    definition: "A sequence of 12 to 25 dictionary words that deterministically derives all private keys for a cryptocurrency wallet.",
    example: "Pera Wallet generates a 25-word mnemonic phrase that must be stored offline securely."
  },
  {
    term: "Non-Custodial",
    category: "Security",
    definition: "A software architecture where the service provider does not hold, manage, or possess the private keys or assets of the user.",
    example: "BountyVault is non-custodial: only smart contracts control deposits according to transparent rules."
  },
  {
    term: "Oracle Problem",
    category: "Smart Contracts",
    definition: "The fundamental challenge that blockchains cannot independently observe or verify facts that occur in the physical world or off-chain web.",
    example: "Smart contracts cannot tell if a webpage looks aesthetic; human inspection or an oracle is required."
  },
  {
    term: "Peer-to-Peer (P2P)",
    category: "Blockchain",
    definition: "Direct communication and value transfer between participants without intermediaries like banks or centralized clearinghouses.",
    example: "BountyVault enables P2P escrow between global clients and developers."
  },
  {
    term: "Pera Wallet",
    category: "Algorand",
    definition: "The flagship mobile and web wallet for the Algorand ecosystem, supporting transaction signing and smart contract approvals.",
    example: "Users connect Pera Wallet to sign escrow releases directly on their device."
  },
  {
    term: "Private Key",
    category: "Cryptography",
    definition: "A secret 256-bit number used to generate cryptographic digital signatures that verify ownership and authorize asset transfers.",
    example: "Your private key signs the transaction when releasing escrow to a contributor."
  },
  {
    term: "Public Address",
    category: "Cryptography",
    definition: "A publicly shareable 58-character alphanumeric identifier on Algorand derived from a public key, used to receive assets.",
    example: "A contributor shares their public address so the bounty escrow can transfer the reward upon completion."
  },
  {
    term: "Pure Proof of Stake (PPoS)",
    category: "Algorand",
    definition: "Algorand’s consensus algorithm where validators are selected randomly and secretly in proportion to their total staked ALGO.",
    example: "PPoS allows Algorand to consume negligible energy compared to proof-of-work systems like Bitcoin."
  },
  {
    term: "Smart Contract",
    category: "Smart Contracts",
    definition: "Self-executing code deployed on a blockchain that automates agreement terms without requiring trusted intermediaries.",
    example: "BountyVault’s smart contract enforces that escrow can only be unlocked by client approval or arbitrator verdict."
  },
  {
    term: "State Machine",
    category: "Smart Contracts",
    definition: "A mathematical behavioral model where a contract exists in one of several defined states and transitions strictly upon defined events.",
    example: "BountyVault transitions from OPEN to ACQUIRED when a worker is selected."
  },
  {
    term: "TEAL",
    category: "Algorand",
    definition: "Transaction Execution Approval Language: Algorand’s bytecode-interpreted stack language for smart contracts.",
    example: "BountyVault's escrow rules are compiled into TEAL bytecode for high-speed deterministic execution."
  },
  {
    term: "Testnet",
    category: "Blockchain",
    definition: "An alternative blockchain environment identical to Mainnet, used for testing applications with zero-value mock tokens.",
    example: "BountyVault connects to Algorand Testnet so users can learn and test with zero financial risk."
  }
];
