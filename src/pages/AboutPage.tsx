import React from "react";
import { 
  Shield, 
  Coins, 
  Scale, 
  Code2, 
  Zap, 
  Globe, 
  ArrowRight,
  ExternalLink,
  Users
} from "lucide-react";

interface AboutPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="border-b border-[#2B302B] pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs font-mono text-[#C6FF4D]">
          <Shield className="w-3.5 h-3.5" />
          <span>DECENTRALIZED FREELANCE ESCROW PROTOCOL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F0]">
          About BountyVault
        </h1>
        <p className="text-sm sm:text-base text-[#9A9E98] max-w-2xl leading-relaxed">
          BountyVault was created to solve the fundamental trust problem in online freelance work: clients fear paying before work is completed, while contributors fear delivering work without guaranteed payment.
        </p>
      </div>

      {/* The Core Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#F5F5F0]">
            The Non-Custodial Solution
          </h2>
          <p className="text-xs sm:text-sm text-[#9A9E98] leading-relaxed">
            Traditional freelance platforms charge high fees (up to 20%), freeze funds arbitrarily, and force participants to rely on centralized opaque customer service.
          </p>
          <p className="text-xs sm:text-sm text-[#9A9E98] leading-relaxed">
            BountyVault replaces platform middlemen with Algorand TEAL smart contracts. The client deposits the reward into an independent escrow account. The contributor builds with mathematical confidence that funds cannot be retracted without mutual agreement or formal on-chain arbitration.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#141715] border border-[#2B302B] space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase text-[#C6FF4D] tracking-wider">
            Why Algorand?
          </h3>
          <ul className="space-y-3 text-xs text-[#9A9E98]">
            <li className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-[#C6FF4D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F5F0]">Sub-4s Block Finality:</strong> Payments settle instantaneously with zero possibility of chain forks or rolled back transactions.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Coins className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F5F0]">Negligible Fees:</strong> Transactions cost less than 0.001 ALGO ($0.0002), making micro-bounties and milestone splits economical.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F5F0]">Pure Proof of Stake:</strong> Carbon-negative consensus ensures enterprise-grade environmental sustainability.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* The Ecosystem Roles */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F0]">
          Participant Roles & Network Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="font-mono text-xs font-bold text-[#C6FF4D] uppercase">01 · Clients & Posters</div>
            <h3 className="font-bold text-sm text-[#F5F5F0]">Define Requirements</h3>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Post bounties, set reward amounts in ALGO, review incoming developer proposals, and approve milestones upon deliverable verification.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="font-mono text-xs font-bold text-[#10B981] uppercase">02 · Contributors & Workers</div>
            <h3 className="font-bold text-sm text-[#F5F5F0]">Deliver Verified Work</h3>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Apply to active bounties with proof of expertise, complete tasks with cryptographic reward guarantees, and receive direct wallet transfers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="font-mono text-xs font-bold text-amber-400 uppercase">03 · Impartial Arbitrators</div>
            <h3 className="font-bold text-sm text-[#F5F5F0]">Resolve Disputes</h3>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Examine verifiable git commit logs and pull requests when conflicts arise, executing binding on-chain settlements according to original specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#141715] to-[#191D19] border border-[#2B302B] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-[#F5F5F0]">Ready to build or post bounties?</h3>
          <p className="text-xs text-[#9A9E98]">Connect your Algorand wallet and explore verified active escrows today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("marketplace")}
            className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider"
          >
            Explore Marketplace
          </button>
          <button
            onClick={() => onNavigate("how-it-works")}
            className="px-5 py-2.5 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-[#F5F5F0] font-semibold text-xs uppercase tracking-wider"
          >
            How It Works
          </button>
        </div>
      </div>

    </div>
  );
};
