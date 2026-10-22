import React, { useState } from "react";
import { 
  ShieldAlert, 
  Lock, 
  UserCheck, 
  Code2, 
  CheckCircle2, 
  Scale, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Coins, 
  Info, 
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  BookOpen
} from "lucide-react";

interface EscrowSimulationPageProps {
  onNavigate: (view: string, param?: string) => void;
}

type SimulationStage = 
  | "create" 
  | "fund" 
  | "apply_select" 
  | "submit_review" 
  | "path_choice"
  | "approved_settle" 
  | "dispute_open"
  | "dispute_verdict_worker"
  | "dispute_verdict_poster";

export const EscrowSimulationPage: React.FC<EscrowSimulationPageProps> = ({ onNavigate }) => {
  const [stage, setStage] = useState<SimulationStage>("create");
  const [simReward, setSimReward] = useState(150);
  const [simTitle, setSimTitle] = useState("Build Algorand ARC-56 UI Component");

  const resetSimulation = () => {
    setStage("create");
  };

  const getStageNumber = (): number => {
    switch (stage) {
      case "create": return 1;
      case "fund": return 2;
      case "apply_select": return 3;
      case "submit_review": return 4;
      case "path_choice": return 5;
      case "approved_settle": return 6;
      case "dispute_open": return 5;
      case "dispute_verdict_worker": return 6;
      case "dispute_verdict_poster": return 6;
    }
  };

  const getContractStatus = (): { status: string; color: string; invariant: string } => {
    switch (stage) {
      case "create":
        return { status: "DRAFT (OFF-CHAIN)", color: "text-[#9A9E98]", invariant: "Uninitialized contract" };
      case "fund":
        return { status: "OPEN (ESCROW FUNDED)", color: "text-[#C6FF4D]", invariant: "Poster can cancel if unassigned" };
      case "apply_select":
        return { status: "ACQUIRED (LOCKED TO WORKER)", color: "text-amber-400", invariant: "Unilateral cancellation blocked" };
      case "submit_review":
        return { status: "ACQUIRED (WORK DELIVERED)", color: "text-amber-400", invariant: "Awaiting poster approval or dispute" };
      case "path_choice":
        return { status: "ACQUIRED (DECISION POINT)", color: "text-amber-400", invariant: "Release or dispute trigger" };
      case "approved_settle":
        return { status: "COMPLETED (SETTLED)", color: "text-[#10B981]", invariant: "100% funds disbursed to contributor" };
      case "dispute_open":
        return { status: "DISPUTED (FROZEN)", color: "text-[#EF4444]", invariant: "Only arbitrator signature can disburse" };
      case "dispute_verdict_worker":
        return { status: "RESOLVED (AWARDED WORKER)", color: "text-[#10B981]", invariant: "Arbitrator verdict executed" };
      case "dispute_verdict_poster":
        return { status: "RESOLVED (REFUNDED POSTER)", color: "text-[#9A9E98]", invariant: "Arbitrator refund executed" };
    }
  };

  const contractInfo = getContractStatus();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Simulation Warning Banner */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>EDUCATIONAL SANDBOX SIMULATION</strong> · No real Algorand transactions, no wallet signatures, and zero real tokens involved.
          </span>
        </div>
        <button
          onClick={resetSimulation}
          className="px-3 py-1 rounded bg-[#141715] hover:bg-[#191D19] border border-amber-700/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2B302B] pb-6">
        <div>
          <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Protocol Lab</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0]">
            Bounty Escrow Lifecycle Walkthrough
          </h1>
          <p className="text-xs sm:text-sm text-[#9A9E98] mt-1 max-w-xl">
            Step through how smart contracts govern funds at every stage of a bounty, from deposit to release or dispute arbitration.
          </p>
        </div>

        <button
          onClick={() => onNavigate("learn")}
          className="text-xs text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learn Hub</span>
        </button>
      </div>

      {/* Simulation Progress Stepper */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2 text-xs font-mono">
          {[
            { id: 1, label: "1. Create Bounty", active: getStageNumber() >= 1 },
            { id: 2, label: "2. Lock Escrow", active: getStageNumber() >= 2 },
            { id: 3, label: "3. Contributor Selected", active: getStageNumber() >= 3 },
            { id: 4, label: "4. Deliverable Review", active: getStageNumber() >= 4 },
            { id: 5, label: "5. Settle or Dispute", active: getStageNumber() >= 5 },
          ].map((item, idx) => (
            <React.Fragment key={item.id}>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  item.active 
                    ? "bg-[#C6FF4D] text-[#0B0D0C]" 
                    : "bg-[#191D19] text-[#6B7068] border border-[#2B302B]"
                }`}>
                  {item.id}
                </span>
                <span className={item.active ? "text-[#F5F5F0] font-semibold" : "text-[#6B7068]"}>
                  {item.label}
                </span>
              </div>
              {idx < 4 && <div className="flex-1 h-0.5 bg-[#2B302B] mx-2"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Sandbox Grid: Simulated Contract State (Left) + Interactive Stage Control (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Simulated Contract Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2B302B] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
                <span className="font-mono text-xs text-[#F5F5F0] font-semibold">Simulated TEAL State</span>
              </div>
              <span className="font-mono text-[10px] text-[#6B7068]">AppID: 8841-TEST</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                <div className="text-[10px] text-[#6B7068] uppercase">Contract State</div>
                <div className={`font-bold text-sm ${contractInfo.color}`}>
                  {contractInfo.status}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                <div className="text-[10px] text-[#6B7068] uppercase">Locked Escrow Balance</div>
                <div className="text-xl font-bold text-[#C6FF4D]">
                  {stage === "create" ? "0.00" : simReward} ALGO
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                <div className="text-[10px] text-[#6B7068] uppercase">Assigned Worker Key</div>
                <div className="text-[#9A9E98] text-[11px] truncate">
                  {stage === "create" || stage === "fund" 
                    ? "NONE (Awaiting proposal selection)" 
                    : "ALGO-SIM-WORKER-ADDR-7X9B2104"}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#191D19] border border-[#2B302B] space-y-1">
                <div className="text-[10px] text-[#6B7068] uppercase">Active Invariant Rule</div>
                <div className="text-[#F5F5F0] text-[11px]">
                  {contractInfo.invariant}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7068] leading-relaxed pt-2">
              In real deployment, this state is permanently recorded on Algorand's ledger and verifiable using TEAL byte logic.
            </div>
          </div>
        </div>

        {/* Right: Interactive Step Action Board */}
        <div className="lg:col-span-7 bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
          
          {/* STAGE 1: CREATE BOUNTY */}
          {stage === "create" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#C6FF4D]">Step 1 of 5</span>
                <h3 className="text-xl font-bold text-[#F5F5F0]">Poster Defines Bounty Requirements</h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  The client enters task parameters. At this moment, the bounty is simply a proposal specification. No tokens have been locked into escrow yet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 text-xs">
                <div>
                  <label className="block text-[#6B7068] mb-1 font-mono">Bounty Title (editable)</label>
                  <input
                    type="text"
                    value={simTitle}
                    onChange={(e) => setSimTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141715] border border-[#2B302B] rounded text-[#F5F5F0] focus:outline-none focus:border-[#C6FF4D]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B7068] mb-1 font-mono">Reward Amount (ALGO)</label>
                  <input
                    type="number"
                    value={simReward}
                    onChange={(e) => setSimReward(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#141715] border border-[#2B302B] rounded text-[#C6FF4D] font-mono font-bold focus:outline-none focus:border-[#C6FF4D]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStage("fund")}
                  className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Simulate: Fund Escrow & Publish Bounty</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: FUND ESCROW */}
          {stage === "fund" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#C6FF4D]">Step 2 of 5</span>
                <h3 className="text-xl font-bold text-[#F5F5F0]">Escrow Lockup Executed</h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  The poster transfers {simReward} ALGO into the smart contract account. The bounty transitions to the <strong className="text-[#C6FF4D]">OPEN</strong> state. 
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-2 text-xs">
                <div className="text-[#10B981] font-mono flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Smart Contract Invariant: Solvency Confirmed</span>
                </div>
                <p className="text-[#9A9E98] leading-relaxed">
                  Because the funds are locked in the TEAL contract account, contributors browsing the marketplace can verify on-chain that the reward is guaranteed upon milestone approval.
                </p>
                <p className="text-[#6B7068] text-[11px]">
                  <strong>Poster Rights:</strong> At this stage, because no contributor has been assigned yet, the poster can still cancel and recover 100% of the escrow funds.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStage("apply_select")}
                  className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Simulate: Contributor Applies & Poster Selects Candidate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: CONTRIBUTOR SELECTED */}
          {stage === "apply_select" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#C6FF4D]">Step 3 of 5</span>
                <h3 className="text-xl font-bold text-[#F5F5F0]">Worker Assignment (State &rarr; ACQUIRED)</h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  Developer Alice submitted her application with relevant experience. The poster selected Alice, updating the smart contract state to <strong className="text-amber-400">ACQUIRED</strong> and recording Alice's Algorand address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F5F0]">Selected Contributor: Alice Dev</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191D19] text-[#10B981]">
                    Address Verified
                  </span>
                </div>
                <div className="p-3 rounded bg-[#141715] border border-[#2B302B] text-[11px] text-amber-300">
                  <AlertTriangle className="w-4 h-4 inline mr-1 -mt-0.5" />
                  <strong>Critical Invariant Lock:</strong> The poster can NO LONGER cancel the bounty unilaterally. Funds are locked to protect Alice as she writes code.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStage("submit_review")}
                  className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Simulate: Alice Completes & Delivers Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: WORK DELIVERED & REVIEW */}
          {stage === "submit_review" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#C6FF4D]">Step 4 of 5</span>
                <h3 className="text-xl font-bold text-[#F5F5F0]">Deliverable Submitted for Client Review</h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  Alice submits pull request link and commit references satisfying the bounty criteria. The client now inspects the deliverable.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-2 text-xs">
                <div className="text-[#F5F5F0] font-semibold">Simulated Submission Details:</div>
                <div className="text-[#9A9E98] font-mono text-[11px]">
                  PR #14: Implemented TypeScript ARC-56 client wrapper with 100% test coverage.
                </div>
                <p className="text-[#6B7068] text-[11px] leading-relaxed pt-1">
                  The client has two choices: approve the deliverable and release the {simReward} ALGO, or contest the deliverable if requirements were not met.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStage("path_choice")}
                  className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Proceed to Decision Point</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: DECISION FORK (APPROVE vs DISPUTE) */}
          {stage === "path_choice" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#C6FF4D]">Step 5: The Fork</span>
                <h3 className="text-xl font-bold text-[#F5F5F0]">Choose the Simulation Path</h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  Experience both possible outcomes to understand how smart contracts handle happy paths vs. conflict resolution:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Path A */}
                <div className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Path A: Happy Path</span>
                    </div>
                    <p className="text-xs text-[#9A9E98] leading-relaxed">
                      The poster reviews the code, approves the milestone, and signs a transaction releasing the full {simReward} ALGO to Alice.
                    </p>
                  </div>
                  <button
                    onClick={() => setStage("approved_settle")}
                    className="w-full py-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs transition-colors"
                  >
                    Simulate Approval
                  </button>
                </div>

                {/* Path B */}
                <div className="p-5 rounded-xl bg-[#0B0D0C] border border-rose-900/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold text-[#EF4444] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Path B: Dispute Path</span>
                    </div>
                    <p className="text-xs text-[#9A9E98] leading-relaxed">
                      A disagreement occurs. The poster or Alice triggers an on-chain dispute, freezing the funds pending arbitrator verdict.
                    </p>
                  </div>
                  <button
                    onClick={() => setStage("dispute_open")}
                    className="w-full py-2 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800 text-rose-300 font-semibold text-xs transition-colors"
                  >
                    Simulate Dispute
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PATH A RESULT: APPROVED */}
          {stage === "approved_settle" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2 text-xs">
                <div className="text-[#10B981] font-mono font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Escrow Successfully Released & Settled!</span>
                </div>
                <p className="text-[#F5F5F0] leading-relaxed">
                  The client signed the payment approval transaction. The smart contract immediately disbursed the {simReward} ALGO to Alice’s Algorand address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-2 text-xs font-mono">
                <div className="text-[#6B7068]">SIMULATED TRANSACTION HASH:</div>
                <div className="text-[#C6FF4D] text-[11px] truncate">
                  SIM-ALGO-TXN-794A8812BCFE9102456C
                </div>
                <div className="text-[#9A9E98] text-[11px] pt-1">
                  Settlement latency: ~3.3 seconds · Finality: 100% Irrevocable
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStage("path_choice")}
                  className="px-4 py-2 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0]"
                >
                  Try Dispute Path
                </button>
                <button
                  onClick={resetSimulation}
                  className="flex-1 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
                >
                  Restart Simulation
                </button>
              </div>
            </div>
          )}

          {/* PATH B STEP: DISPUTE OPENED */}
          {stage === "dispute_open" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#EF4444]">Dispute Raised</span>
                <h3 className="text-xl font-bold text-[#F5F5F0]">Smart Contract Frozen in Arbitration</h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  An on-chain dispute was officially filed. The smart contract blocks standard poster release and prevents poster withdrawal. A verified arbitrator reviews submitted evidence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3 text-xs">
                <div className="text-[#F5F5F0] font-semibold">Arbitrator Evidence Docket:</div>
                <p className="text-[#9A9E98] leading-relaxed">
                  The arbitrator inspects the original bounty specifications, timestamped commit logs, and test reports. Now, simulate the arbitrator's ruling:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setStage("dispute_verdict_worker")}
                  className="p-3 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs transition-colors"
                >
                  Rule in Favor of Alice (Worker Payout)
                </button>
                <button
                  onClick={() => setStage("dispute_verdict_poster")}
                  className="p-3 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-amber-600 text-amber-400 font-semibold text-xs transition-colors"
                >
                  Rule in Favor of Client (Refund)
                </button>
              </div>
            </div>
          )}

          {/* PATH B VERDICT: WORKER */}
          {stage === "dispute_verdict_worker" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2 text-xs">
                <div className="text-[#10B981] font-mono font-bold text-sm flex items-center gap-1.5">
                  <Scale className="w-5 h-5" />
                  <span>Arbitrator Ruled in Favor of Contributor</span>
                </div>
                <p className="text-[#F5F5F0] leading-relaxed">
                  The arbitrator verified that Alice fulfilled the technical specifications. The contract executes an irreversible on-chain payout of {simReward} ALGO to Alice.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setStage("path_choice")}
                  className="px-4 py-2 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-medium text-[#9A9E98]"
                >
                  Back to Fork
                </button>
                <button
                  onClick={resetSimulation}
                  className="flex-1 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
                >
                  Restart Simulation
                </button>
              </div>
            </div>
          )}

          {/* PATH B VERDICT: POSTER */}
          {stage === "dispute_verdict_poster" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2 text-xs">
                <div className="text-amber-400 font-mono font-bold text-sm flex items-center gap-1.5">
                  <Scale className="w-5 h-5" />
                  <span>Arbitrator Ruled in Favor of Client</span>
                </div>
                <p className="text-[#F5F5F0] leading-relaxed">
                  The arbitrator found the deliverable incomplete. The contract executed a {simReward} ALGO refund back to the poster’s wallet address.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setStage("path_choice")}
                  className="px-4 py-2 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-medium text-[#9A9E98]"
                >
                  Back to Fork
                </button>
                <button
                  onClick={resetSimulation}
                  className="flex-1 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
                >
                  Restart Simulation
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Lesson Summary & Truth Callout */}
      <div className="p-6 rounded-2xl bg-[#141715] border border-[#2B302B] space-y-3">
        <h3 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C6FF4D]" />
          <span>Key Architectural Takeaway</span>
        </h3>
        <p className="text-xs text-[#9A9E98] leading-relaxed">
          Smart contracts solve solvency and counterparty default: the client cannot run away with the money once work starts, and the contributor knows funds exist upfront. However, human judgment is still essential for evaluating off-chain quality. In BountyVault, on-chain arbitration fills this gap transparently.
        </p>
      </div>

    </div>
  );
};
