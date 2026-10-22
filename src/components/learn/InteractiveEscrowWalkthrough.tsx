import React, { useState } from "react";
import {
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  Layers,
  FileCode,
  DollarSign,
  UserCheck,
  Check,
  Send,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export interface WalkthroughStep {
  id: number;
  title: string;
  actor: "Poster" | "Worker" | "Arbitrator" | "Smart Contract";
  shortDesc: string;
  onChainAction: string;
  contractState: string;
  guarantees: string;
  residualRisk: string;
  bountyVaultMapping: string;
}

export const InteractiveEscrowWalkthrough: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [simulationBranch, setSimulationBranch] = useState<"happy" | "dispute">("happy");
  const [arbitratorDecision, setArbitratorDecision] = useState<"worker" | "poster">("worker");

  // Simulated live state
  const [simState, setSimState] = useState({
    bountyTitle: "Build Algorand ARC-56 Type-Safe Client",
    bountyReward: 350,
    escrowBalance: 0,
    bountyStatus: "draft",
    posterBalance: 1200,
    workerBalance: 85,
    arbitratorBalance: 50,
    selectedWorker: null as string | null,
    workerAddress: "N7W7E4KJ6RPO5M3BXZQG78KL2NV9YTDFR5E6Q1WZX4P9MLO3KFA5678",
    disputeReason: "",
    disputeEvidence: "",
    disputeDecision: null as "worker" | "poster" | null,
    txnLog: [] as { id: string; event: string; detail: string; amount?: number; timestamp: string }[],
  });

  // Steps for Happy Path
  const happySteps: WalkthroughStep[] = [
    {
      id: 0,
      title: "1. Bounty Specification & Creation",
      actor: "Poster",
      shortDesc: "The poster specifies scope, requirements, acceptance criteria, and reward amount.",
      onChainAction: "Drafting bounty parameters in client interface before committing funds.",
      contractState: "Status: 'draft' | Escrow Balance: 0 ALGO | Worker: None",
      guarantees: "No funds have moved yet. Poster retains full control of their private wallet.",
      residualRisk: "Vague or underspecified requirements can lead to mismatched contributor expectations later.",
      bountyVaultMapping: "Maps to the 'Create Bounty' modal in Poster Console."
    },
    {
      id: 1,
      title: "2. Escrow Funding & Lockup",
      actor: "Poster",
      shortDesc: "Poster signs transaction depositing 350 ALGO into the non-custodial escrow contract.",
      onChainAction: "Atomic transfer: Payment of 350 ALGO to Escrow Address + App Call to register bounty.",
      contractState: "Status: 'open' | Escrow Balance: 350 ALGO | Worker: None",
      guarantees: "Funds are locked in the smart contract. The poster CANNOT withdraw funds if an active agreement is formed.",
      residualRisk: "If no qualified workers apply, the poster may need to cancel the bounty to recover the escrow deposit.",
      bountyVaultMapping: "BountyVault records this as event_type: 'created' in the transaction registry with status: 'open'."
    },
    {
      id: 2,
      title: "3. Contributor Application & Selection",
      actor: "Poster",
      shortDesc: "A freelance developer applies with their Algorand wallet address. The poster reviews proposals and selects them.",
      onChainAction: "State transition: Contract records selected worker's public address and updates status.",
      contractState: "Status: 'acquired' | Escrow Balance: 350 ALGO | Assigned: Sarah Dev (N7W7...5678)",
      guarantees: "The worker is guaranteed that 350 ALGO is verified in escrow and assigned exclusively to their address.",
      residualRisk: "The worker could take on the task and fail to deliver by the agreed deadline.",
      bountyVaultMapping: "Maps to POST /api/bounties/:id/select which locks the worker into the acquired bounty."
    },
    {
      id: 3,
      title: "4. Work Submission & Review",
      actor: "Worker",
      shortDesc: "The contributor completes the code and submits deliverables (GitHub PR, tests, docs).",
      onChainAction: "Deliverables referenced on-chain or transmitted via proposal communication logs.",
      contractState: "Status: 'acquired' (Under Review) | Escrow Balance: 350 ALGO",
      guarantees: "The poster cannot unilaterally cancel the bounty while in 'acquired' status.",
      residualRisk: "The poster might claim the work doesn't meet quality standards, or fail to respond.",
      bountyVaultMapping: "The bounty remains in 'acquired' status while the poster tests the submitted code."
    },
    {
      id: 4,
      title: "5. Completion & Payout Release",
      actor: "Poster",
      shortDesc: "Poster inspects work, confirms it meets all criteria, and signs the release transaction.",
      onChainAction: "Contract executes inner transaction: Escrow sends 350 ALGO directly to worker address.",
      contractState: "Status: 'completed' | Escrow Balance: 0 ALGO | Final Txn Confirmed",
      guarantees: "Deterministic payout: 350 ALGO lands directly in worker's account with instant Algorand finality (~3.3s).",
      residualRisk: "None. Both parties satisfied obligations and settlement is mathematically permanent.",
      bountyVaultMapping: "Maps to PATCH /api/bounties/:id/complete in BountyVault, recording on-chain payout txn_id."
    }
  ];

  // Steps for Dispute Path
  const disputeSteps: WalkthroughStep[] = [
    {
      id: 0,
      title: "1. Bounty Specification & Creation",
      actor: "Poster",
      shortDesc: "The poster specifies scope, requirements, acceptance criteria, and reward amount.",
      onChainAction: "Drafting bounty parameters in client interface before committing funds.",
      contractState: "Status: 'draft' | Escrow Balance: 0 ALGO | Worker: None",
      guarantees: "No funds have moved yet. Poster retains full control.",
      residualRisk: "Vague specifications increase likelihood of disputes.",
      bountyVaultMapping: "Maps to the 'Create Bounty' modal in Poster Console."
    },
    {
      id: 1,
      title: "2. Escrow Funding & Lockup",
      actor: "Poster",
      shortDesc: "Poster signs transaction depositing 350 ALGO into the non-custodial escrow contract.",
      onChainAction: "Atomic transfer: Payment of 350 ALGO to Escrow Address + App Call.",
      contractState: "Status: 'open' | Escrow Balance: 350 ALGO | Worker: None",
      guarantees: "Funds are locked in the smart contract.",
      residualRisk: "Escrow cannot evaluate subjective quality of future work.",
      bountyVaultMapping: "BountyVault records this as event_type: 'created'."
    },
    {
      id: 2,
      title: "3. Contributor Application & Selection",
      actor: "Poster",
      shortDesc: "A freelance developer applies. The poster selects them and locks the contract.",
      onChainAction: "Contract records selected worker's public address and updates status to 'acquired'.",
      contractState: "Status: 'acquired' | Escrow Balance: 350 ALGO | Assigned: Sarah Dev (N7W7...5678)",
      guarantees: "Contract prevents poster from cancelling unilaterally without reason.",
      residualRisk: "Counterparty risk: either party might stop communicating.",
      bountyVaultMapping: "Maps to POST /api/bounties/:id/select."
    },
    {
      id: 3,
      title: "4. Deliverable Disagreement & Dispute Trigger",
      actor: "Worker",
      shortDesc: "Contributor delivers work on time, but poster claims it misses edge cases and refuses approval. Either party triggers dispute.",
      onChainAction: "App call to dispute method: Contract locks funds and transitions status to 'disputed'.",
      contractState: "Status: 'disputed' (FROZEN) | Escrow Balance: 350 ALGO",
      guarantees: "Neither poster nor worker can withdraw or drain the funds while under dispute.",
      residualRisk: "Funds are temporarily locked until the arbitrator conducts an investigation and issues a ruling.",
      bountyVaultMapping: "Maps to POST /api/bounties/:id/dispute in BountyVault. Flags bounty in Arbitrator Dashboard."
    },
    {
      id: 4,
      title: "5. Arbitrator Evidence Audit & Investigation",
      actor: "Arbitrator",
      shortDesc: "The independent arbitrator inspects git commit history, PR reviews, and message evidence in the Arbitrator Console.",
      onChainAction: "Off-chain evidence evaluation combined with on-chain cryptographic verification.",
      contractState: "Status: 'disputed' | Under Active Adjudication",
      guarantees: "Impartial review by a designated arbitrator with domain expertise in Algorand development.",
      residualRisk: "Human adjudication involves judgment; smart contracts cannot automate aesthetic or code quality audits.",
      bountyVaultMapping: "Arbitrator logs into Arbitrator Dashboard (/arbitrator) to review evidence."
    },
    {
      id: 5,
      title: "6. Binding On-Chain Settlement",
      actor: "Arbitrator",
      shortDesc: "Arbitrator signs settlement transaction. If ruling for Worker: Escrow pays worker. If ruling for Poster: Escrow refunds poster.",
      onChainAction: "Arbitrator executes resolve method with decision parameter and transaction ID.",
      contractState: `Status: 'resolved' | Final Ruling: In favor of ${arbitratorDecision === "worker" ? "Worker (Sarah Dev)" : "Poster (Alice Founder)"}`,
      guarantees: "Deterministic resolution: The contract strictly enforces the arbitrator's ruling, dispersing 350 ALGO to the designated winner.",
      residualRisk: "Losing party must abide by the binding settlement.",
      bountyVaultMapping: "Maps to PATCH /api/bounties/:id/resolve, writing audit log to transactions table."
    }
  ];

  const currentSteps = simulationBranch === "happy" ? happySteps : disputeSteps;
  const currentStep = currentSteps[Math.min(currentStepIndex, currentSteps.length - 1)];

  const resetSimulation = () => {
    setCurrentStepIndex(0);
    setArbitratorDecision("worker");
    setSimState({
      bountyTitle: "Build Algorand ARC-56 Type-Safe Client",
      bountyReward: 350,
      escrowBalance: 0,
      bountyStatus: "draft",
      posterBalance: 1200,
      workerBalance: 85,
      arbitratorBalance: 50,
      selectedWorker: null,
      workerAddress: "N7W7E4KJ6RPO5M3BXZQG78KL2NV9YTDFR5E6Q1WZX4P9MLO3KFA5678",
      disputeReason: "",
      disputeEvidence: "",
      disputeDecision: null,
      txnLog: [],
    });
  };

  const advanceStep = () => {
    if (currentStepIndex < currentSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      applyStepSimulation(nextIndex, simulationBranch, arbitratorDecision);
    }
  };

  const retreatStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      applyStepSimulation(prevIndex, simulationBranch, arbitratorDecision);
    }
  };

  const applyStepSimulation = (stepIdx: number, branch: "happy" | "dispute", decision: "worker" | "poster") => {
    const timestamp = new Date().toLocaleTimeString();

    if (stepIdx === 0) {
      setSimState((prev) => ({
        ...prev,
        bountyStatus: "draft",
        escrowBalance: 0,
        posterBalance: 1200,
        workerBalance: 85,
        selectedWorker: null,
      }));
    } else if (stepIdx === 1) {
      // Funded
      setSimState((prev) => ({
        ...prev,
        bountyStatus: "open",
        escrowBalance: 350,
        posterBalance: 850,
        workerBalance: 85,
        selectedWorker: null,
        txnLog: [
          {
            id: "SIM-TX-FUND-982A",
            event: "Escrow Deposit",
            detail: "Poster locked 350 ALGO into Escrow Contract Address",
            amount: 350,
            timestamp,
          },
          ...prev.txnLog,
        ],
      }));
    } else if (stepIdx === 2) {
      // Selected
      setSimState((prev) => ({
        ...prev,
        bountyStatus: "acquired",
        escrowBalance: 350,
        posterBalance: 850,
        workerBalance: 85,
        selectedWorker: "Sarah Dev (sarah@algoworker.net)",
        txnLog: [
          {
            id: "SIM-TX-ACQ-44F1",
            event: "Worker Selected",
            detail: "Assigned worker Sarah Dev and locked contract to wallet N7W7...5678",
            timestamp,
          },
          ...prev.txnLog,
        ],
      }));
    } else if (stepIdx === 3) {
      if (branch === "happy") {
        // Work delivered
        setSimState((prev) => ({
          ...prev,
          bountyStatus: "acquired (under review)",
          txnLog: [
            {
              id: "SIM-TX-SUBMIT-112A",
              event: "Deliverable Submitted",
              detail: "Worker committed pull request #14: Type-Safe ARC-56 parser",
              timestamp,
            },
            ...prev.txnLog,
          ],
        }));
      } else {
        // Dispute raised
        setSimState((prev) => ({
          ...prev,
          bountyStatus: "disputed (frozen)",
          disputeReason: "Poster unresponsive after PR submitted with 100% test coverage",
          disputeEvidence: "https://github.com/algorand/arc56-ts/pull/14",
          txnLog: [
            {
              id: "SIM-TX-DISP-772C",
              event: "Dispute Opened",
              detail: "Dispute triggered by Sarah Dev: Escrow locked awaiting arbitration",
              amount: 350,
              timestamp,
            },
            ...prev.txnLog,
          ],
        }));
      }
    } else if (stepIdx === 4) {
      if (branch === "happy") {
        // Completed & Payout
        setSimState((prev) => ({
          ...prev,
          bountyStatus: "completed",
          escrowBalance: 0,
          workerBalance: 435, // 85 + 350
          posterBalance: 850,
          txnLog: [
            {
              id: "SIM-TX-RELEASE-884E",
              event: "Escrow Release",
              detail: "350 ALGO transferred from Escrow to Worker wallet N7W7...5678",
              amount: 350,
              timestamp,
            },
            ...prev.txnLog,
          ],
        }));
      } else {
        // In dispute investigation
        setSimState((prev) => ({
          ...prev,
          bountyStatus: "disputed (auditing)",
        }));
      }
    } else if (stepIdx === 5 && branch === "dispute") {
      // Arbitrator ruled
      const winner = decision;
      const newWorkerBal = winner === "worker" ? 85 + 350 : 85;
      const newPosterBal = winner === "poster" ? 850 + 350 : 850;

      setSimState((prev) => ({
        ...prev,
        bountyStatus: winner === "worker" ? "completed (arbitrated)" : "cancelled (refunded)",
        escrowBalance: 0,
        workerBalance: newWorkerBal,
        posterBalance: newPosterBal,
        disputeDecision: winner,
        txnLog: [
          {
            id: "SIM-TX-SETTLE-990B",
            event: `Arbitrator Ruled for ${winner.toUpperCase()}`,
            detail: `Settlement executed by Arbitrator: 350 ALGO released to ${
              winner === "worker" ? "Worker Sarah Dev" : "Poster Alice Founder (refund)"
            }`,
            amount: 350,
            timestamp,
          },
          ...prev.txnLog,
        ],
      }));
    }
  };

  const handleBranchSwitch = (newBranch: "happy" | "dispute") => {
    setSimulationBranch(newBranch);
    setCurrentStepIndex(0);
    resetSimulation();
  };

  return (
    <div className="space-y-6">
      {/* Simulation Sandbox Notice Banner */}
      <div className="p-4 rounded-xl bg-[#141715] border border-[#C6FF4D]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C6FF4D]/10 border border-[#C6FF4D]/30 flex items-center justify-center text-[#C6FF4D] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#C6FF4D] text-[#0B0D0C]">
                Educational Simulation
              </span>
              <span className="text-xs text-[#9A9E98] font-mono">Isolated Sandbox</span>
            </div>
            <p className="text-xs text-[#9A9E98] mt-1">
              Zero real ALGO spent. No wallet signature required. Safe interactive visualization of BountyVault's actual escrow state machine.
            </p>
          </div>
        </div>

        {/* Branch Switcher */}
        <div className="flex items-center bg-[#0B0D0C] p-1 rounded-lg border border-[#2B302B] shrink-0 w-full sm:w-auto">
          <button
            onClick={() => handleBranchSwitch("happy")}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              simulationBranch === "happy"
                ? "bg-[#C6FF4D] text-[#0B0D0C] shadow-sm"
                : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            Happy Path (Standard)
          </button>
          <button
            onClick={() => handleBranchSwitch("dispute")}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              simulationBranch === "dispute"
                ? "bg-[#EF4444] text-[#F5F5F0] shadow-sm"
                : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            Dispute & Arbitration Path
          </button>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="p-4 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
        <div className="flex items-center justify-between text-xs text-[#9A9E98] mb-1">
          <span className="font-semibold text-[#F5F5F0]">
            Step {currentStepIndex + 1} of {currentSteps.length}: {currentStep.title}
          </span>
          <span className="text-[11px] font-mono">
            {Math.round(((currentStepIndex + 1) / currentSteps.length) * 100)}% Complete
          </span>
        </div>

        {/* Step dots */}
        <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
          {currentSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  applyStepSimulation(idx, simulationBranch, arbitratorDecision);
                }}
                className={`text-left p-2 rounded-lg border transition-all text-xs ${
                  isCurrent
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#F5F5F0]"
                    : isCompleted
                    ? "bg-[#141715] border-[#10B981]/40 text-[#9A9E98]"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#6B7068]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <span
                      className={`w-3.5 h-3.5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isCurrent ? "bg-[#C6FF4D] text-[#0B0D0C]" : "bg-[#2B302B] text-[#9A9E98]"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span className="font-semibold truncate text-[11px]">
                    {step.title.split(".")[1]?.trim() || step.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Current Stage Detailed Explanation & Action Controller */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#2B302B]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                      Actor: {currentStep.actor}
                    </span>
                    <span className="text-[11px] text-[#9A9E98]">Stage {currentStepIndex + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F5F0] mt-0.5">{currentStep.title}</h3>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={retreatStep}
                  disabled={currentStepIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] disabled:opacity-40 text-xs font-medium text-[#F5F5F0] flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={advanceStep}
                  disabled={currentStepIndex === currentSteps.length - 1}
                  className="px-3.5 py-1.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-[#F5F5F0] leading-relaxed bg-[#0B0D0C] p-4 rounded-lg border border-[#2B302B]">
              <p className="font-medium text-sm text-[#F5F5F0] mb-1">{currentStep.shortDesc}</p>
              <p className="text-[#9A9E98]">{currentStep.onChainAction}</p>
            </div>

            {/* In-depth 3-Card Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#191D19] border border-[#2B302B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" /> What Smart Escrow Guarantees Here
                </div>
                <p className="text-xs text-[#9A9E98] leading-relaxed">{currentStep.guarantees}</p>
              </div>

              <div className="p-4 rounded-lg bg-[#191D19] border border-[#2B302B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EF4444]">
                  <AlertTriangle className="w-4 h-4" /> Residual Risk / Human Factor
                </div>
                <p className="text-xs text-[#9A9E98] leading-relaxed">{currentStep.residualRisk}</p>
              </div>
            </div>

            {/* BountyVault Real System Mapping */}
            <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]/80 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#C6FF4D] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-semibold text-[#F5F5F0]">How BountyVault Implements This:</span>
                <p className="text-[#9A9E98]">{currentStep.bountyVaultMapping}</p>
              </div>
            </div>

            {/* Conditional Arbitrator Decision Selector on Final Step of Dispute Branch */}
            {simulationBranch === "dispute" && currentStepIndex === currentSteps.length - 1 && (
              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#EF4444]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F0]">
                  <Scale className="w-4 h-4 text-[#EF4444]" />
                  Simulate Arbitrator Decision:
                </div>
                <p className="text-xs text-[#9A9E98]">
                  Select the ruling to observe how smart escrow directs the payout:
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setArbitratorDecision("worker");
                      applyStepSimulation(5, "dispute", "worker");
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      arbitratorDecision === "worker"
                        ? "bg-[#10B981] text-[#0B0D0C] border-[#10B981]"
                        : "bg-[#141715] border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Rule for Worker (Pay 350 ALGO)
                  </button>
                  <button
                    onClick={() => {
                      setArbitratorDecision("poster");
                      applyStepSimulation(5, "dispute", "poster");
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      arbitratorDecision === "poster"
                        ? "bg-[#C6FF4D] text-[#0B0D0C] border-[#C6FF4D]"
                        : "bg-[#141715] border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Rule for Poster (Refund 350 ALGO)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Simulated State Inspector & Ledger Feed */}
        <div className="space-y-6">
          {/* Simulated Contract & Wallet State */}
          <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B302B]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#C6FF4D]" />
                <h4 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">
                  Live Contract State
                </h4>
              </div>
              <button
                onClick={resetSimulation}
                className="text-[11px] text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1"
                title="Reset simulation to beginning"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* State Table */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#0B0D0C] border border-[#2B302B]">
                <span className="text-[#9A9E98]">Bounty Status:</span>
                <span className="font-mono font-semibold uppercase px-2 py-0.5 rounded text-[11px] bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                  {simState.bountyStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#0B0D0C] border border-[#2B302B]">
                <span className="text-[#9A9E98]">Escrow Locked:</span>
                <span className="font-mono font-bold text-[#F5F5F0] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#C6FF4D]" />
                  {simState.escrowBalance} ALGO
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#0B0D0C] border border-[#2B302B]">
                <span className="text-[#9A9E98]">Assigned Worker:</span>
                <span className="font-mono text-[11px] text-[#F5F5F0] truncate max-w-[140px]">
                  {simState.selectedWorker ? "Sarah Dev" : "Unassigned"}
                </span>
              </div>
            </div>

            {/* Simulated Wallets */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#6B7068] tracking-wider block">
                Simulated Participant Balances
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-[#9A9E98]">
                  <span>Poster (Alice):</span>
                  <span className="text-[#F5F5F0]">{simState.posterBalance} ALGO</span>
                </div>
                <div className="flex justify-between items-center text-[#9A9E98]">
                  <span>Worker (Sarah):</span>
                  <span className="text-[#C6FF4D]">{simState.workerBalance} ALGO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Transaction Log */}
          <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2B302B]">
              <span className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">
                Simulated Ledger Activity
              </span>
              <span className="text-[10px] font-mono text-[#6B7068]">
                {simState.txnLog.length} Txns
              </span>
            </div>

            {simState.txnLog.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7068]">
                Advance to Step 2 to generate simulated transactions.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                {simState.txnLog.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded bg-[#0B0D0C] border border-[#2B302B] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#C6FF4D]">{tx.id}</span>
                      <span className="text-[10px] text-[#6B7068]">{tx.timestamp}</span>
                    </div>
                    <div className="font-semibold text-[#F5F5F0] text-[11px]">{tx.event}</div>
                    <p className="text-[11px] text-[#9A9E98]">{tx.detail}</p>
                    {tx.amount && (
                      <div className="text-[10px] text-[#10B981] font-mono font-semibold">
                        Amount: {tx.amount} ALGO
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
