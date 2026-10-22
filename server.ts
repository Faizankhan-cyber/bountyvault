import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Ensure data folder exists
const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "bountyvault.db"));
db.prepare("PRAGMA foreign_keys = ON").run();

// Initialize tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS bounties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poster_name TEXT NOT NULL,
    poster_email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward REAL NOT NULL,
    category TEXT NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acquired', 'disputed', 'completed', 'cancelled')),
    worker_name TEXT,
    worker_email TEXT,
    worker_skills TEXT,
    worker_reason TEXT,
    assigned_worker TEXT,
    worker_address TEXT,
    txn_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const bountyColumns = db.prepare("PRAGMA table_info(bounties)").all() as { name: string }[];
if (!bountyColumns.some((col) => col.name === "assigned_worker")) {
  db.prepare("ALTER TABLE bounties ADD COLUMN assigned_worker TEXT").run();
}
if (!bountyColumns.some((col) => col.name === "worker_address")) {
  db.prepare("ALTER TABLE bounties ADD COLUMN worker_address TEXT").run();
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bounty_id INTEGER NOT NULL,
    worker_name TEXT NOT NULL,
    worker_email TEXT NOT NULL,
    worker_skills TEXT NOT NULL,
    worker_reason TEXT NOT NULL,
    wallet_address TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bounty_id) REFERENCES bounties(id) ON DELETE CASCADE
  )
`).run();

const applicantColumns = db.prepare("PRAGMA table_info(applicants)").all() as { name: string }[];
if (!applicantColumns.some((col) => col.name === "wallet_address")) {
  db.prepare("ALTER TABLE applicants ADD COLUMN wallet_address TEXT").run();
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bounty_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL,
    txn_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bounty_id) REFERENCES bounties(id) ON DELETE CASCADE
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bounty_id INTEGER NOT NULL,
    raised_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT,
    decision TEXT,
    resolved_by TEXT,
    resolve_txn_id TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bounty_id) REFERENCES bounties(id) ON DELETE CASCADE
  )
`).run();

db.prepare("UPDATE users SET role = 'arbitrator' WHERE LOWER(role) = 'admin'").run();

const ARBITRATOR_EMAIL = "arbitrator@bountyvault.local";
const arbitratorExists = db.prepare("SELECT id FROM users WHERE email = ?").get(ARBITRATOR_EMAIL);
if (!arbitratorExists) {
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Arbitrator",
    ARBITRATOR_EMAIL,
    "admin123",
    "arbitrator"
  );
}

// Seed default sample bounties if database is empty so users can immediately test all features
const bountyCount = (db.prepare("SELECT COUNT(*) AS count FROM bounties").get() as { count: number }).count;
if (bountyCount === 0) {
  const seedBounties = [
    {
      poster_name: "Alice Founder",
      poster_email: "alice@algodev.io",
      title: "Build Algorand ARC-56 Type-Safe Client",
      description: "Develop a typed TypeScript client for Algorand ARC-56 application specs with batch transaction signing support and error mapping.",
      reward: 350.0,
      category: "Development",
      deadline: "2026-11-15",
      status: "open"
    },
    {
      poster_name: "Web3 Studio",
      poster_email: "design@web3studio.com",
      title: "Design Responsive Dark-Mode Escrow Flow UI",
      description: "Create complete high-fidelity mockups and interaction states for 3-party decentralized escrow resolution console.",
      reward: 180.0,
      category: "Design",
      deadline: "2026-11-20",
      status: "open"
    },
    {
      poster_name: "Algorand DeFi Labs",
      poster_email: "research@defilabs.org",
      title: "Technical Audit & Documentation for State Proofs",
      description: "Review smart contract verification mechanisms and draft detailed technical specification for cross-chain state proofs.",
      reward: 500.0,
      category: "Writing",
      deadline: "2026-11-30",
      status: "open"
    }
  ];

  for (const b of seedBounties) {
    const res = db.prepare(`
      INSERT INTO bounties (poster_name, poster_email, title, description, reward, category, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(b.poster_name, b.poster_email, b.title, b.description, b.reward, b.category, b.deadline, b.status);

    db.prepare(`
      INSERT INTO transactions (bounty_id, event_type, description, amount)
      VALUES (?, ?, ?, ?)
    `).run(res.lastInsertRowid, "created", `Bounty created: ${b.title}`, b.reward);
  }
}

const parseId = (val: unknown): number | null => {
  const id = Number.parseInt(String(val), 10);
  return Number.isNaN(id) ? null : id;
};

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/signup", (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const role = String(req.body?.role || "").trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password, and role are required" });
    }

    if (!["poster", "worker", "arbitrator"].includes(role)) {
      return res.status(400).json({ error: "role must be poster, worker, or arbitrator" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "user already exists" });
    }

    const result = db
      .prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
      .run(name, email, password, role);

    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json({ message: "signup successful", user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = db
      .prepare("SELECT id, name, email, role, password FROM users WHERE email = ?")
      .get(email) as any;

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    return res.json({
      message: "login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/bounties", (_req, res) => {
  try {
    const bounties = db.prepare("SELECT * FROM bounties ORDER BY id DESC").all();
    return res.json(bounties);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/bounties/:id", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }
    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId);
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    return res.json(bounty);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/bounties", (req, res) => {
  try {
    const { poster_name, poster_email, title, description, reward, category, deadline } = req.body;
    if (!poster_name || !poster_email || !title || !description || reward === undefined || !category || !deadline) {
      return res.status(400).json({ error: "missing required bounty fields" });
    }

    const amount = Number(reward);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "reward must be a positive number" });
    }

    const result = db
      .prepare(
        `INSERT INTO bounties
         (poster_name, poster_email, title, description, reward, category, deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(poster_name, poster_email, title, description, amount, category, deadline);

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(result.lastInsertRowid) as any;

    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount)
       VALUES (?, ?, ?, ?)`
    ).run(bounty.id, "created", `Bounty escrow funded for ${bounty.title}`, amount);

    return res.status(201).json(bounty);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/bounties/:id", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (bounty.status !== "open") {
      return res.status(400).json({ error: "only open bounties can be deleted" });
    }

    db.prepare("DELETE FROM bounties WHERE id = ?").run(bountyId);
    return res.json({ message: "bounty deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/bounties/:id/applicants", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const applicants = db.prepare("SELECT * FROM applicants WHERE bounty_id = ? ORDER BY id DESC").all(bountyId);
    return res.json(applicants);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

function selectBountyApplicant(bountyId: number, applicant: any) {
  db.prepare("UPDATE applicants SET status = 'selected' WHERE id = ?").run(applicant.id);
  db.prepare("UPDATE applicants SET status = 'rejected' WHERE bounty_id = ? AND id != ?").run(bountyId, applicant.id);
  db.prepare(
    `UPDATE bounties
     SET status = 'acquired', assigned_worker = ?, worker_address = ?, worker_name = ?, worker_email = ?, worker_skills = ?, worker_reason = ?
     WHERE id = ?`
  ).run(
    applicant.worker_email,
    applicant.wallet_address || null,
    applicant.worker_name,
    applicant.worker_email,
    applicant.worker_skills,
    applicant.worker_reason,
    bountyId
  );

  return db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId);
}

app.post("/api/bounties/:id/select", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (bounty.status !== "open") {
      return res.status(400).json({ error: "bounty must be open to select a worker" });
    }

    const workerEmail = String(req.body?.worker_email || "").trim().toLowerCase();
    if (!workerEmail) {
      return res.status(400).json({ error: "worker_email is required" });
    }

    const applicant = db
      .prepare("SELECT * FROM applicants WHERE bounty_id = ? AND LOWER(worker_email) = ?")
      .get(bountyId, workerEmail) as any;
    if (!applicant) {
      return res.status(404).json({ error: "applicant not found for this worker email" });
    }
    if (applicant.status !== "pending") {
      return res.status(400).json({ error: "only pending applicants can be selected" });
    }

    const updatedBounty = selectBountyApplicant(bountyId, applicant);

    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount)
       VALUES (?, ?, ?, ?)`
    ).run(bountyId, "acquired", `Worker selected: ${applicant.worker_name} (${applicant.worker_email})`, bounty.reward);

    return res.json({ message: "worker selected", bounty: updatedBounty });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/bounties/:id/applicants", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (bounty.status !== "open") {
      return res.status(400).json({ error: "applications are allowed only when bounty is open" });
    }

    const worker_name = String(req.body?.worker_name || req.body?.name || "").trim();
    const worker_email = String(req.body?.worker_email || req.body?.email || "").trim().toLowerCase();
    const worker_skills = String(req.body?.worker_skills || req.body?.skills || "").trim();
    const worker_reason = String(req.body?.worker_reason || req.body?.reason || "").trim();
    const wallet_address = String(req.body?.wallet_address || req.body?.walletAddress || "").trim();

    if (!worker_name || !worker_email || !worker_skills || !worker_reason) {
      return res.status(400).json({ error: "missing required applicant fields" });
    }

    // Check if worker already applied
    const existing = db
      .prepare("SELECT id FROM applicants WHERE bounty_id = ? AND LOWER(worker_email) = ?")
      .get(bountyId, worker_email);
    if (existing) {
      return res.status(400).json({ error: "you have already applied for this bounty" });
    }

    const result = db
      .prepare(
        `INSERT INTO applicants
         (bounty_id, worker_name, worker_email, worker_skills, worker_reason, wallet_address)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(bountyId, worker_name, worker_email, worker_skills, worker_reason, wallet_address || null);

    const applicant = db.prepare("SELECT * FROM applicants WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json(applicant);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/bounties/:id/select/:appId", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    const appId = parseId(req.params.appId);

    if (!bountyId || !appId) {
      return res.status(400).json({ error: "invalid id provided" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (bounty.status !== "open") {
      return res.status(400).json({ error: "bounty must be open to select an applicant" });
    }

    const applicant = db
      .prepare("SELECT * FROM applicants WHERE id = ? AND bounty_id = ?")
      .get(appId, bountyId) as any;
    if (!applicant) {
      return res.status(404).json({ error: "applicant not found" });
    }
    if (applicant.status !== "pending") {
      return res.status(400).json({ error: "only pending applicants can be selected" });
    }

    const updatedBounty = selectBountyApplicant(bountyId, applicant);

    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount)
       VALUES (?, ?, ?, ?)`
    ).run(bountyId, "acquired", `Applicant selected: ${applicant.worker_name}`, bounty.reward);

    return res.json(updatedBounty);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/bounties/:id/complete", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (bounty.status !== "acquired") {
      return res.status(400).json({ error: "only acquired bounties can be completed" });
    }

    const { txn_id } = req.body;
    db.prepare("UPDATE bounties SET status = 'completed', txn_id = ? WHERE id = ?").run(txn_id || null, bountyId);
    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount, txn_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(bountyId, "completed", "Bounty marked as completed and payout released to worker", bounty.reward, txn_id || null);

    const updatedBounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId);
    return res.json(updatedBounty);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/bounties/:id/cancel", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (!["open", "acquired"].includes(bounty.status)) {
      return res.status(400).json({ error: "only open or acquired bounties can be cancelled" });
    }

    db.prepare("UPDATE bounties SET status = 'cancelled' WHERE id = ?").run(bountyId);
    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount)
       VALUES (?, ?, ?, ?)`
    ).run(bountyId, "cancelled", "Bounty cancelled and escrow refunded to poster", bounty.reward);

    const updatedBounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId);
    return res.json(updatedBounty);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/bounties/:id/dispute", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }
    if (bounty.status !== "acquired") {
      return res.status(400).json({ error: "dispute can only be raised when bounty is acquired" });
    }

    const { raised_by, reason, evidence } = req.body;
    const raisedBy = String(raised_by || "").trim().toLowerCase();
    const disputeReason = String(reason || "").trim();

    if (!raisedBy || !disputeReason) {
      return res.status(400).json({ error: "raised_by and reason are required" });
    }

    const posterEmail = String(bounty.poster_email || "").trim().toLowerCase();
    const workerEmail = String(bounty.worker_email || bounty.assigned_worker || "").trim().toLowerCase();
    const isActorParticipant = raisedBy === posterEmail || (workerEmail && raisedBy === workerEmail);
    if (!isActorParticipant) {
      return res.status(403).json({ error: "only the selected poster or worker can raise a dispute" });
    }

    const existingOpenDispute = db
      .prepare("SELECT id FROM disputes WHERE bounty_id = ? AND status = 'open'")
      .get(bountyId);
    if (existingOpenDispute) {
      return res.status(400).json({ error: "an open dispute already exists for this bounty" });
    }

    const result = db
      .prepare(
        `INSERT INTO disputes (bounty_id, raised_by, reason, evidence)
         VALUES (?, ?, ?, ?)`
      )
      .run(bountyId, raisedBy, disputeReason, evidence || null);

    db.prepare("UPDATE bounties SET status = 'disputed' WHERE id = ?").run(bountyId);
    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount)
       VALUES (?, ?, ?, ?)`
    ).run(bountyId, "disputed", `Dispute raised by ${raisedBy}: ${disputeReason}`, bounty.reward);

    const dispute = db.prepare("SELECT * FROM disputes WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json(dispute);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/bounties/:id/resolve", (req, res) => {
  try {
    const bountyId = parseId(req.params.id);
    if (!bountyId) {
      return res.status(400).json({ error: "invalid bounty id" });
    }

    const { decision, txn_id, resolved_by, resolver_wallet } = req.body;
    const resolvedBy = String(resolved_by || "").trim().toLowerCase();
    const txnId = String(txn_id || "").trim();
    if (decision !== "worker" && decision !== "poster") {
      return res.status(400).json({ error: "decision must be exactly 'worker' or 'poster'" });
    }
    if (!txnId || !resolvedBy) {
      return res.status(400).json({ error: "txn_id and resolved_by are required" });
    }

    const resolver = db
      .prepare("SELECT id, email, role FROM users WHERE LOWER(email) = ?")
      .get(resolvedBy) as any;
    if (!resolver || String(resolver.role || "").toLowerCase() !== "arbitrator") {
      return res.status(403).json({ error: "only arbitrator accounts can resolve disputes" });
    }

    const bounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId) as any;
    if (!bounty) {
      return res.status(404).json({ error: "bounty not found" });
    }

    const openDispute = db
      .prepare("SELECT * FROM disputes WHERE bounty_id = ? AND status = 'open' ORDER BY id DESC")
      .get(bountyId) as any;
    if (!openDispute) {
      return res.status(404).json({ error: "no open dispute found for this bounty" });
    }

    db.prepare(
      `UPDATE disputes
       SET decision = ?, resolved_by = ?, resolve_txn_id = ?, status = 'resolved'
       WHERE id = ?`
    ).run(decision, resolvedBy, txnId, openDispute.id);

    const nextBountyStatus = decision === "worker" ? "completed" : "cancelled";
    db.prepare("UPDATE bounties SET status = ?, txn_id = ? WHERE id = ?").run(nextBountyStatus, txnId, bountyId);

    const settlementLabel = decision === "worker" ? "completed" : "refunded";
    const resolverDescriptor = resolver_wallet
      ? `${resolvedBy} (${String(resolver_wallet).trim()})`
      : resolvedBy;

    db.prepare(
      `INSERT INTO transactions (bounty_id, event_type, description, amount, txn_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      bountyId,
      "resolved",
      `Dispute ${settlementLabel} by arbitrator ${resolverDescriptor} in favor of ${decision}`,
      bounty.reward,
      txnId
    );

    const dispute = db.prepare("SELECT * FROM disputes WHERE id = ?").get(openDispute.id);
    const updatedBounty = db.prepare("SELECT * FROM bounties WHERE id = ?").get(bountyId);

    return res.json({ dispute, bounty: updatedBounty });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/disputes", (_req, res) => {
  try {
    const disputes = db.prepare("SELECT * FROM disputes ORDER BY id DESC").all();
    return res.json(disputes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", (_req, res) => {
  try {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY id DESC").all();
    return res.json(transactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats", (_req, res) => {
  try {
    const totalUsers = (db.prepare("SELECT COUNT(*) AS count FROM users").get() as any).count;
    const totalBounties = (db.prepare("SELECT COUNT(*) AS count FROM bounties").get() as any).count;
    const openBounties = (db.prepare("SELECT COUNT(*) AS count FROM bounties WHERE status = 'open'").get() as any).count;
    const acquiredBounties = (db.prepare("SELECT COUNT(*) AS count FROM bounties WHERE status = 'acquired'").get() as any).count;
    const disputedBounties = (db.prepare("SELECT COUNT(*) AS count FROM bounties WHERE status = 'disputed'").get() as any).count;
    const completedBounties = (db.prepare("SELECT COUNT(*) AS count FROM bounties WHERE status = 'completed'").get() as any).count;
    const cancelledBounties = (db.prepare("SELECT COUNT(*) AS count FROM bounties WHERE status = 'cancelled'").get() as any).count;
    const totalApplicants = (db.prepare("SELECT COUNT(*) AS count FROM applicants").get() as any).count;
    const totalDisputes = (db.prepare("SELECT COUNT(*) AS count FROM disputes").get() as any).count;
    const openDisputes = (db.prepare("SELECT COUNT(*) AS count FROM disputes WHERE status = 'open'").get() as any).count;
    const totalTransactions = (db.prepare("SELECT COUNT(*) AS count FROM transactions").get() as any).count;
    const totalVolume = (db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions").get() as any).total;

    return res.json({
      users: totalUsers,
      bounties: {
        total: totalBounties,
        open: openBounties,
        acquired: acquiredBounties,
        disputed: disputedBounties,
        completed: completedBounties,
        cancelled: cancelledBounties
      },
      applicants: totalApplicants,
      disputes: {
        total: totalDisputes,
        open: openDisputes
      },
      transactions: {
        total: totalTransactions,
        volume: totalVolume
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BountyVault server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
