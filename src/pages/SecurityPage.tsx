import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  Code2, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ExternalLink,
  KeyRound,
  FileCheck2
} from "lucide-react";

interface SecurityPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      
      {/* Header */}
      <div className="border-b border-[#2B302B] pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs font-mono text-[#C6FF4D]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC INVARIANTS & AUDITABILITY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F0]">
          Security & Escrow Architecture
        </h1>
        <p className="text-sm sm:text-base text-[#9A9E98] max-w-2xl leading-relaxed">
          BountyVault eliminates freelance payment risk through mathematically enforced smart contract rules. Learn about our trust assumptions, threat boundaries, and Algorand state proofs.
        </p>
      </div>

      {/* Core Security Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#F5F5F0]">Non-Custodial Escrow</h3>
          <p className="text-xs text-[#9A9E98] leading-relaxed">
            Client funds are deposited directly into Algorand smart contract accounts. Neither BountyVault developers nor server infrastructure hold private custody over deposits.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center text-[#10B981]">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#F5F5F0]">Deterministic TEAL Logic</h3>
          <p className="text-xs text-[#9A9E98] leading-relaxed">
            Smart contract execution is deterministic and immutable. Once deployed, payout rules cannot be altered by third parties or modified mid-task.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#F5F5F0]">On-Chain Arbitration</h3>
          <p className="text-xs text-[#9A9E98] leading-relaxed">
            Unresolved conflicts trigger smart contract freezes. Only designated arbitrator signatures can split or release disputed balances following evidence review.
          </p>
        </div>
      </div>

      {/* State Machine Transition Table */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#F5F5F0]">Escrow State Machine Specifications</h2>
          <p className="text-xs text-[#9A9E98] mt-1">
            Every lifecycle change requires cryptographic authorization matching exact smart contract constraints.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2B302B] bg-[#191D19] text-[#6B7068] font-mono text-[11px] uppercase">
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Initial State</th>
                <th className="py-3 px-4">Terminal State</th>
                <th className="py-3 px-4">Required Authorization</th>
                <th className="py-3 px-4">Escrow Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B302B] text-[#9A9E98] font-mono text-[11px]">
              <tr>
                <td className="py-3 px-4 font-bold text-[#F5F5F0]">FundEscrow</td>
                <td className="py-3 px-4">Null</td>
                <td className="py-3 px-4 text-[#C6FF4D]">OPEN</td>
                <td className="py-3 px-4">Poster Txn Deposit</td>
                <td className="py-3 px-4">Contract Escrow Account</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#F5F5F0]">AssignWorker</td>
                <td className="py-3 px-4 text-[#C6FF4D]">OPEN</td>
                <td className="py-3 px-4 text-amber-400">ACQUIRED</td>
                <td className="py-3 px-4">Poster Signature</td>
                <td className="py-3 px-4">Locked to Worker Address</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#F5F5F0]">ReleaseEscrow</td>
                <td className="py-3 px-4 text-amber-400">ACQUIRED</td>
                <td className="py-3 px-4 text-[#10B981]">COMPLETED</td>
                <td className="py-3 px-4">Poster Release Signature</td>
                <td className="py-3 px-4 text-[#10B981]">100% to Contributor</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#F5F5F0]">RefundCancel</td>
                <td className="py-3 px-4 text-[#C6FF4D]">OPEN</td>
                <td className="py-3 px-4 text-[#6B7068]">CANCELLED</td>
                <td className="py-3 px-4">Poster Signature (Unassigned)</td>
                <td className="py-3 px-4">100% Refund to Poster</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#F5F5F0]">FileDispute</td>
                <td className="py-3 px-4 text-amber-400">ACQUIRED</td>
                <td className="py-3 px-4 text-[#EF4444]">DISPUTED</td>
                <td className="py-3 px-4">Poster or Worker Signature</td>
                <td className="py-3 px-4 text-[#EF4444]">Frozen in Smart Contract</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#F5F5F0]">ArbitrateVerdict</td>
                <td className="py-3 px-4 text-[#EF4444]">DISPUTED</td>
                <td className="py-3 px-4 text-purple-400">RESOLVED</td>
                <td className="py-3 px-4">Verified Arbitrator Key</td>
                <td className="py-3 px-4">Awarded Recipient Account</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Honest Limits & Trust Boundaries */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-[#F5F5F0] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Honest Limitations & Best Practices</span>
        </h2>
        <div className="space-y-3 text-xs text-[#9A9E98] leading-relaxed">
          <p>
            • <strong>Off-Chain Code Verification:</strong> While payment settlement is guaranteed by the Algorand blockchain, code quality and functional deliverables must be reviewed by the client or verified via public Git pull requests prior to signing the release transaction.
          </p>
          <p>
            • <strong>Private Key Custody:</strong> Users are solely responsible for protecting their private seed phrases when connecting via Pera Wallet. BountyVault will never prompt for your 25-word mnemonic seed.
          </p>
          <p>
            • <strong>Dispute Evidence:</strong> In arbitration, ensure git pull requests, commit hashes, and message logs are clearly cited. Arbitrators resolve verdicts based strictly on documented specifications.
          </p>
        </div>
      </div>

      {/* Call to Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#2B302B]">
        <button
          onClick={() => onNavigate("transactions")}
          className="text-xs text-[#C6FF4D] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Inspect Public Transaction Ledger</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate("marketplace")}
          className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
        >
          Browse Secure Bounties
        </button>
      </div>

    </div>
  );
};
