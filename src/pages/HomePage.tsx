import React, { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { Bounty, PlatformStats } from "../types";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { 
  ArrowRight, 
  Clock, 
  Lock, 
  ExternalLink, 
  ShieldCheck, 
  FileCode, 
  Coins, 
  CheckCircle2, 
  Users, 
  Scale, 
  ArrowUpRight,
  Sparkles,
  Layers
} from "lucide-react";

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isAuthenticated, role } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, bountiesData] = await Promise.all([
          api.getStats().catch(() => null),
          api.getBounties().catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        setBounties(bountiesData);
      } catch (err: any) {
        console.error("Unable to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredBounties = useMemo(() => {
    const open = bounties.filter((b) => b.status === "open");
    if (open.length >= 3) return open.slice(0, 3);
    return bounties.slice(0, 3);
  }, [bounties]);

  const totalVolume = stats?.transactions.volume || bounties.reduce((sum, b) => sum + (b.reward || 0), 0);
  const openCount = stats?.bounties.open ?? bounties.filter((b) => b.status === "open").length;
  const settledCount = stats?.bounties.completed ?? bounties.filter((b) => b.status === "completed").length;

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Asymmetric Left-Aligned Editorial Hero */}
      <section className="pt-10 md:pt-16 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Asymmetric Editorial Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs font-mono text-[#F5F5F0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF4D] animate-pulse"></span>
              <span>ALGORAND ESCROW PROTOCOL</span>
              <span className="text-[#6B7068]">·</span>
              <span className="text-[#9A9E98]">TESTNET NODE SYNCED</span>
            </div>

            {/* Mandated Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F5F0] leading-[1.08]">
              Good work. <br />
              <span className="text-[#C6FF4D]">Secured rewards.</span>
            </h1>

            {/* Concise Supporting Copy */}
            <p className="text-base sm:text-lg text-[#9A9E98] max-w-xl leading-relaxed font-normal">
              BountyVault locks client funds into non-custodial Algorand smart contracts upfront. 
              Contributors build with cryptographic payment guarantees, while posters retain escrow-backed 
              milestone approvals and impartial on-chain arbitration.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("marketplace")}
                className="px-5 py-3 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated && role === "poster") {
                    onNavigate("create-bounty");
                  } else if (isAuthenticated) {
                    onNavigate("dashboard");
                  } else {
                    onNavigate("register");
                  }
                }}
                className="px-5 py-3 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] text-[#F5F5F0] font-semibold text-xs uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                <span>Post a Bounty</span>
              </button>
            </div>

            {/* Real Stats Ticker */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2B302B]">
              <div>
                <div className="text-2xl font-bold font-mono text-[#F5F5F0]">
                  {loading ? "..." : `${totalVolume.toLocaleString()} ALGO`}
                </div>
                <div className="text-[11px] text-[#6B7068] uppercase font-mono tracking-wider mt-0.5">
                  Escrow Volume
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#C6FF4D]">
                  {loading ? "..." : openCount}
                </div>
                <div className="text-[11px] text-[#6B7068] uppercase font-mono tracking-wider mt-0.5">
                  Open Bounties
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#10B981]">
                  {loading ? "..." : settledCount}
                </div>
                <div className="text-[11px] text-[#6B7068] uppercase font-mono tracking-wider mt-0.5">
                  Verified Settled
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Escrow Terminal Visual */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#141715] border border-[#2B302B] p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2B302B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80"></div>
                  <span className="font-mono text-[11px] text-[#9A9E98] ml-2">contract_state.teal</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191D19] text-[#10B981] border border-[#2B302B]">
                  NON-CUSTODIAL
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1.5">
                  <div className="text-[11px] text-[#6B7068] flex items-center justify-between">
                    <span>ACTIVE ESCROW INVARIANT</span>
                    <span className="text-[#C6FF4D]">VERIFIED</span>
                  </div>
                  <div className="text-[#F5F5F0] text-sm font-semibold">
                    Global.current_application_address
                  </div>
                  <div className="text-[11px] text-[#9A9E98] truncate">
                    addr: ALGO-VAULT-ESCROW-TEAL-V2-STATE-HASH
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-md bg-[#191D19] border border-[#2B302B]">
                    <div className="text-[#6B7068]">Release Invariant</div>
                    <div className="text-[#F5F5F0] font-medium mt-0.5">Poster Signature</div>
                  </div>
                  <div className="p-2.5 rounded-md bg-[#191D19] border border-[#2B302B]">
                    <div className="text-[#6B7068]">Dispute Invariant</div>
                    <div className="text-[#F5F5F0] font-medium mt-0.5">Arbitrator Verdict</div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#9A9E98] leading-relaxed">
                  Funds deposited to a bounty are irrevocably locked into the smart contract until the poster approves the completed deliverable or an on-chain dispute ruling is executed.
                </div>

                <button
                  onClick={() => onNavigate("security")}
                  className="w-full mt-2 py-2 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#C6FF4D] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Inspect Escrow Security Architecture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Bounties Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Opportunities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight">
              Featured Active Bounties
            </h2>
          </div>
          <button
            onClick={() => onNavigate("marketplace")}
            className="text-xs font-semibold text-[#C6FF4D] hover:text-[#B4FA32] flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All Bounties ({bounties.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredBounties.map((bounty) => (
            <div
              key={bounty.id}
              className="bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] text-[#9A9E98] border border-[#2B302B]">
                    {bounty.category || "General"}
                  </span>
                  <StatusBadge status={bounty.status} size="sm" />
                </div>

                <h3 
                  onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                  className="font-bold text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors line-clamp-2 cursor-pointer text-base"
                >
                  {bounty.title}
                </h3>

                <p className="text-xs text-[#9A9E98] line-clamp-3 leading-relaxed">
                  {bounty.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#2B302B] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#9A9E98]">
                    <Clock className="w-3.5 h-3.5 text-[#6B7068]" />
                    <span>Due {bounty.deadline || "TBD"}</span>
                  </div>
                  <div className="font-mono font-bold text-[#C6FF4D] text-base">
                    {bounty.reward} ALGO
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                  className="w-full py-2 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] hover:border-[#3D443D] text-xs font-semibold text-[#F5F5F0] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Details & Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9A9E98] group-hover:text-[#C6FF4D] transition-colors" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How It Works Overview (Visual Flow) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1">
                Cryptographic Settlement Flow
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight">
                Trustless from creation to payout
              </h2>
            </div>
            <button
              onClick={() => onNavigate("how-it-works")}
              className="text-xs font-semibold text-[#C6FF4D] hover:text-[#B4FA32] flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>Read Full Architecture Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-[#C6FF4D]/30">01</span>
              <h4 className="font-bold text-sm text-[#F5F5F0]">1. Escrow Lockup</h4>
              <p className="text-xs text-[#9A9E98] leading-relaxed">
                Poster creates a bounty and commits the ALGO reward directly into the non-custodial smart escrow.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-[#C6FF4D]/30">02</span>
              <h4 className="font-bold text-sm text-[#F5F5F0]">2. Selection</h4>
              <p className="text-xs text-[#9A9E98] leading-relaxed">
                Contributors submit verified skill profiles. Poster reviews proposals and designates the active worker.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-[#C6FF4D]/30">03</span>
              <h4 className="font-bold text-sm text-[#F5F5F0]">3. Work Delivery</h4>
              <p className="text-xs text-[#9A9E98] leading-relaxed">
                Contributor builds deliverables knowing client funds are already cryptographically secured.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 relative">
              <span className="font-mono text-2xl font-bold text-[#C6FF4D]/30">04</span>
              <h4 className="font-bold text-sm text-[#F5F5F0]">4. Release / Dispute</h4>
              <p className="text-xs text-[#9A9E98] leading-relaxed">
                Poster releases payment upon approval. In disputes, impartial arbitrators review evidence on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust & Security Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-xl border border-[#2B302B] bg-gradient-to-r from-[#141715] to-[#191D19] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C6FF4D]">
              <ShieldCheck className="w-4 h-4" />
              <span>NON-CUSTODIAL GUARANTEE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F0]">
              Zero platform custody over your funds
            </h3>
            <p className="text-xs sm:text-sm text-[#9A9E98] leading-relaxed">
              BountyVault operators cannot seize or redirect escrowed funds. Payouts execute purely via signed Algorand transactions, verified by TEAL contract invariants.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("security")}
              className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              Security Policy
            </button>
            <button
              onClick={() => onNavigate("transactions")}
              className="px-5 py-2.5 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-[#F5F5F0] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              Public Ledger
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
