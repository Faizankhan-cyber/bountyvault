import React, { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { 
  PlusCircle, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  Coins, 
  HelpCircle,
  FileCode,
  ShieldCheck,
  Eye
} from "lucide-react";

interface CreateBountyPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CreateBountyPage: React.FC<CreateBountyPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, role } = useAuth();
  const { address } = useWallet();

  const [form, setForm] = useState({
    title: "",
    description: "",
    reward: "100",
    category: "Development",
    deadline: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ["Development", "Design", "Writing", "Security", "Other"];

  const validate = () => {
    if (!form.title.trim()) {
      setError("Please enter a clear bounty title.");
      return false;
    }
    if (!form.description.trim()) {
      setError("Please describe the deliverables and requirements in detail.");
      return false;
    }
    const rewardNum = Number(form.reward);
    if (Number.isNaN(rewardNum) || rewardNum <= 0) {
      setError("Reward must be a positive number of ALGO.");
      return false;
    }
    if (!form.deadline) {
      setError("Please select a completion deadline.");
      return false;
    }
    const deadlineDate = new Date(form.deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      setError("Please provide a valid deadline date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError("You must be logged in as a client to post a bounty.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await api.createBounty({
        poster_name: user.name,
        poster_email: user.email,
        title: form.title.trim(),
        description: form.description.trim(),
        reward: Number(form.reward),
        category: form.category,
        deadline: form.deadline,
      });

      // Navigate to the newly created bounty detail view!
      onNavigate("bounty-detail", String(created.id));
    } catch (err: any) {
      setError(err.message || "Failed to create bounty escrow.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#2B302B] pb-6">
        <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Smart Escrow Contract</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0]">
          Post a Bounty
        </h1>
        <p className="text-xs sm:text-sm text-[#9A9E98] mt-1 max-w-xl">
          Lock funds into a non-custodial Algorand smart escrow contract. Contributors see guaranteed payouts, and you retain release control until deliverables are verified.
        </p>
      </div>

      {/* Role / Authentication Gate */}
      {!isAuthenticated && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>You need to be logged in to create a bounty escrow.</span>
          </div>
          <button
            onClick={() => onNavigate("login")}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors"
          >
            Log In Now
          </button>
        </div>
      )}

      {isAuthenticated && role !== "poster" && (
        <div className="p-4 rounded-xl bg-[#141715] border border-[#2B302B] text-xs text-[#9A9E98] flex items-center justify-between">
          <span>
            You are currently signed in as a <strong className="text-[#F5F5F0] uppercase">{role}</strong>. Posters have primary client privileges. You can still test creating a bounty or switch to a client account in login.
          </span>
          <button
            onClick={() => onNavigate("login")}
            className="text-[#C6FF4D] hover:underline font-semibold ml-4"
          >
            Switch Account
          </button>
        </div>
      )}

      {/* Main Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
                Bounty Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Build Algorand State Proof Verification UI"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] focus:border-[#C6FF4D] focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
                  Reward Escrow Amount (ALGO) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={form.reward}
                    onChange={(e) => setForm({ ...form, reward: e.target.value })}
                    className="w-full pl-3.5 pr-14 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs font-mono text-[#C6FF4D] font-bold focus:border-[#C6FF4D] focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#9A9E98]">
                    ALGO
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
                Completion Deadline *
              </label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] focus:border-[#C6FF4D] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
                Detailed Scope & Deliverable Criteria *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Specify requirements, expected tech stack, git repository guidelines, and acceptance tests..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !isAuthenticated}
                className="w-full py-3 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Committing Smart Escrow Contract...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>Lock Escrow & Publish Bounty</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview & Invariant Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Preview Card */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7068]">
              <span className="flex items-center gap-1.5 text-[#C6FF4D]">
                <Eye className="w-3.5 h-3.5" />
                Live Marketplace Preview
              </span>
              <span>Draft</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#9A9E98]">
                  {form.category}
                </span>
                <span className="text-[10px] font-mono text-[#C6FF4D] bg-[#191D19] px-2 py-0.5 rounded border border-[#2B302B]">
                  OPEN FOR PROPOSALS
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#F5F5F0] line-clamp-2">
                {form.title.trim() || "Untitled Bounty Escrow"}
              </h4>

              <p className="text-xs text-[#9A9E98] line-clamp-3 leading-relaxed">
                {form.description.trim() || "Bounty description will be displayed here for contributors."}
              </p>

              <div className="pt-2 border-t border-[#2B302B] flex items-center justify-between">
                <div className="text-[11px] text-[#6B7068] font-mono">
                  Deadline: {form.deadline || "TBD"}
                </div>
                <div className="font-mono font-bold text-[#C6FF4D] text-base">
                  {form.reward || "0"} ALGO
                </div>
              </div>
            </div>
          </div>

          {/* Smart Escrow Protection Notice */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase text-[#F5F5F0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Smart Contract Protection Invariants</span>
            </h3>

            <ul className="space-y-2 text-xs text-[#9A9E98]">
              <li className="flex items-start gap-2">
                <span className="text-[#C6FF4D] font-bold">·</span>
                <span>Funds remain locked in non-custodial escrow until you explicitly confirm completed deliverables.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C6FF4D] font-bold">·</span>
                <span>If no contributor is selected or you choose to cancel while open, 100% of the escrow is refundable.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C6FF4D] font-bold">·</span>
                <span>In the event of disagreement, the escrow is frozen and arbitrated on-chain by verified arbitrators.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
