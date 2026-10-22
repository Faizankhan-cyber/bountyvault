import { User, Bounty, Applicant, Transaction, Dispute, PlatformStats } from "../types";

// Base API URL: relative in dev/prod with Vite & Express server
const API_BASE = "";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async signup(payload: { name: string; email: string; password: string; role: string }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async login(payload: { email: string; password: string }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Bounties
  async getBounties(): Promise<Bounty[]> {
    const res = await fetch(`${API_BASE}/api/bounties`);
    return handleResponse(res);
  },

  async createBounty(payload: {
    poster_name: string;
    poster_email: string;
    title: string;
    description: string;
    reward: number;
    category: string;
    deadline: string;
  }): Promise<Bounty> {
    const res = await fetch(`${API_BASE}/api/bounties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteBounty(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/bounties/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Applicants
  async getApplicants(bountyId: number): Promise<Applicant[]> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/applicants`);
    return handleResponse(res);
  },

  async applyToBounty(
    bountyId: number,
    payload: {
      worker_name: string;
      worker_email: string;
      worker_skills: string;
      worker_reason: string;
      wallet_address?: string;
    }
  ): Promise<Applicant> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/applicants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async selectApplicant(bountyId: number, workerEmail: string): Promise<{ message: string; bounty: Bounty }> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_email: workerEmail }),
    });
    return handleResponse(res);
  },

  async completeBounty(bountyId: number, txnId?: string): Promise<Bounty> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txn_id: txnId }),
    });
    return handleResponse(res);
  },

  async cancelBounty(bountyId: number): Promise<Bounty> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/cancel`, {
      method: "PATCH",
    });
    return handleResponse(res);
  },

  // Disputes
  async raiseDispute(
    bountyId: number,
    payload: { raised_by: string; reason: string; evidence?: string }
  ): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async resolveDispute(
    bountyId: number,
    payload: {
      decision: "worker" | "poster";
      txn_id: string;
      resolved_by: string;
      resolver_wallet?: string;
    }
  ): Promise<{ dispute: Dispute; bounty: Bounty }> {
    const res = await fetch(`${API_BASE}/api/bounties/${bountyId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getDisputes(): Promise<Dispute[]> {
    const res = await fetch(`${API_BASE}/api/disputes`);
    return handleResponse(res);
  },

  // Transactions & Stats
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/api/transactions`);
    return handleResponse(res);
  },

  async getStats(): Promise<PlatformStats> {
    const res = await fetch(`${API_BASE}/api/stats`);
    return handleResponse(res);
  },
};
