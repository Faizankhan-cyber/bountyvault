import React from "react";
import { Shield, Lock, Scale, Code2 } from "lucide-react";

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleHowItWorksClick = () => {
    if (onNavigate) {
      onNavigate("landing");
      setTimeout(() => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <footer className="border-t border-[#2B302B] bg-[#080A09] text-[#9A9E98] text-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Description */}
          <div className="space-y-3 md:col-span-1">
            <div 
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => onNavigate && onNavigate("landing")}
            >
              <div className="w-7 h-7 rounded-md bg-[#141715] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D]">
                <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-[#F5F5F0] tracking-tight text-sm">
                Bounty<span className="text-[#C6FF4D]">Vault</span>
              </span>
            </div>
            <p className="text-[12px] text-[#9A9E98] leading-relaxed">
              Decentralized escrow protocol engineered on Algorand. Mathematical lockups, verified deliverables, and transparent dispute arbitration.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#F5F5F0] tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-[12px] text-[#9A9E98]">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate("bounties")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
                >
                  Explore Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={handleHowItWorksClick}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate("learn")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
                >
                  Learn & Academy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate("auth")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
                >
                  Login / Registration
                </button>
              </li>
            </ul>
          </div>

          {/* Protocols */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#F5F5F0] tracking-wider mb-3">Protocol Architecture</h4>
            <ul className="space-y-2 text-[12px]">
              <li className="flex items-center gap-2 text-[#9A9E98]">
                <Lock className="w-3.5 h-3.5 text-[#C6FF4D]" /> Non-Custodial Smart Escrow
              </li>
              <li className="flex items-center gap-2 text-[#9A9E98]">
                <Scale className="w-3.5 h-3.5 text-[#10B981]" /> On-Chain Dispute Arbitration
              </li>
              <li className="flex items-center gap-2 text-[#9A9E98]">
                <Code2 className="w-3.5 h-3.5 text-[#C6FF4D]" /> Algorand TEAL Smart Contracts
              </li>
            </ul>
          </div>

          {/* Network & Specs */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#F5F5F0] tracking-wider mb-3">Network Status</h4>
            <div className="p-3 rounded-lg bg-[#141715] border border-[#2B302B] text-[12px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#9A9E98]">Network:</span>
                <span className="text-[#F5F5F0] font-mono">Algorand Testnet</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9A9E98]">Node Provider:</span>
                <span className="text-[#F5F5F0] font-mono">AlgoNode Cloud</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9A9E98]">Contract State:</span>
                <span className="text-[#10B981] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  BountyEscrow.teal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2B302B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6B7068]">
          <p>© {new Date().getFullYear()} BountyVault. Production-ready decentralized escrow architecture.</p>
          <div className="flex items-center gap-5">
            <span>Security Audited</span>
            <span>Escrow Invariants</span>
            <span>Algorand Foundation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
