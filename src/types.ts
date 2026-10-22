export type Role = "poster" | "worker" | "arbitrator";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export type BountyStatus = "open" | "acquired" | "disputed" | "completed" | "cancelled";
export type ApplicantStatus = "pending" | "selected" | "rejected";
export type DisputeStatus = "open" | "resolved";

export interface Bounty {
  id: number;
  poster_name: string;
  poster_email: string;
  title: string;
  description: string;
  reward: number;
  category: "Development" | "Design" | "Writing" | "Other" | string;
  deadline: string;
  status: BountyStatus;
  worker_name?: string | null;
  worker_email?: string | null;
  worker_skills?: string | null;
  worker_reason?: string | null;
  assigned_worker?: string | null;
  worker_address?: string | null;
  txn_id?: string | null;
  created_at: string;
}

export interface Applicant {
  id: number;
  bounty_id: number;
  worker_name: string;
  worker_email: string;
  worker_skills: string;
  worker_reason: string;
  wallet_address?: string | null;
  status: ApplicantStatus;
  created_at: string;
}

export interface Transaction {
  id: number;
  bounty_id: number;
  event_type: "created" | "acquired" | "completed" | "cancelled" | "disputed" | "resolved" | string;
  description: string;
  amount: number;
  txn_id?: string | null;
  created_at: string;
}

export interface Dispute {
  id: number;
  bounty_id: number;
  raised_by: string;
  reason: string;
  evidence?: string | null;
  decision?: "worker" | "poster" | null;
  resolved_by?: string | null;
  resolve_txn_id?: string | null;
  status: DisputeStatus;
  created_at: string;
}

export interface PlatformStats {
  users: number;
  bounties: {
    total: number;
    open: number;
    acquired: number;
    disputed: number;
    completed: number;
    cancelled: number;
  };
  applicants: number;
  disputes: {
    total: number;
    open: number;
  };
  transactions: {
    total: number;
    volume: number;
  };
}
