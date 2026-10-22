import React from "react";
import { Shield, Lock, Scale, Code2, ArrowUpRight } from "lucide-react";

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#2B302B] bg-[#080A09] text-[#9A9E98] text-xs py-14 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & Overview */}
          <div className="space-y-3.5 md:col-span-2 pr-4">
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => onNavigate("home")}
            >
              <div className="w-8 h-8 rounded-lg bg-[#141715] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D]">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-[#F5F5F0] tracking-tight text-base">
                Bounty<span className="text-[#C6FF4D]">Vault</span>
              </span>
            </div>
            <p className="text-[12px] text-[#9A9E98] leading-relaxed max-w-sm">
              Decentralized bounty escrow protocol built on Algorand. Non-custodial smart contracts guarantee work milestone payments and transparent on-chain dispute resolution.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#6B7068]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Testnet Smart Contract Active</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#F5F5F0] tracking-wider mb-3.5 font-mono">Platform</h4>
            <ul className="space-y-2.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("marketplace")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  Explore Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("create-bounty")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  Post a Bounty
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("how-it-works")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("learn")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  Learning Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("learn-simulation")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  Escrow Simulation Lab
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("transactions")}
                  className="hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D]"
                >
                  Escrow Ledger
                </button>
              </li>
            </ul>
          </div>

          {/* Protocols & Security */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#F5F5F0] tracking-wider mb-3.5 font-mono">Architecture</h4>
            <ul className="space-y-2.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigate("security")}
                  className="hover:text-[#F5F5F0] transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C6FF4D]" />
                  <span>Non-Custodial Escrow</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("disputes")}
                  className="hover:text-[#F5F5F0] transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>On-Chain Disputes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("security")}
                  className="hover:text-[#F5F5F0] transition-colors flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#C6FF4D]" />
                  <span>TEAL Smart Contract</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("about")}
                  className="hover:text-[#F5F5F0] transition-colors"
                >
                  About the Protocol
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Network Status */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#F5F5F0] tracking-wider mb-3.5 font-mono">Account & Node</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#141715] border border-[#2B302B] text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9E98]">Network:</span>
                  <span className="text-[#F5F5F0] font-mono">Algorand Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9E98]">Settlement:</span>
                  <span className="text-[#10B981] font-mono">Instant (~3.3s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9E98]">Protocol Fee:</span>
                  <span className="text-[#C6FF4D] font-mono">0% (Testnet)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate("login")}
                  className="hover:text-[#F5F5F0] text-[11px] font-medium transition-colors"
                >
                  Login
                </button>
                <span className="text-[#2B302B]">·</span>
                <button
                  onClick={() => onNavigate("register")}
                  className="hover:text-[#F5F5F0] text-[11px] font-medium transition-colors"
                >
                  Register
                </button>
                <span className="text-[#2B302B]">·</span>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="hover:text-[#C6FF4D] text-[11px] font-medium transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2B302B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6B7068]">
          <p>© {new Date().getFullYear()} BountyVault Protocol. Production-ready decentralized bounty escrow.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate("security")} className="hover:text-[#9A9E98]">Security Guarantees</button>
            <button onClick={() => onNavigate("about")} className="hover:text-[#9A9E98]">Architecture Notes</button>
            <a 
              href="https://testnet.algoexplorer.io" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-[#9A9E98] flex items-center gap-1"
            >
              <span>Testnet Explorer</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
