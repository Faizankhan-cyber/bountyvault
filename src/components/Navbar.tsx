import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { Shield, Wallet, LogOut, Menu, X, User as UserIcon } from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { address, isConnected, shortAddress, connectWallet, disconnectWallet, setCustomAddress } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [customInputAddress, setCustomInputAddress] = useState("");

  // Keyboard navigation & escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (walletModalOpen) setWalletModalOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [walletModalOpen, mobileMenuOpen]);

  const getDashboardViewForRole = () => {
    if (!role) return "auth";
    if (role === "poster") return "poster";
    if (role === "worker") return "worker";
    if (role === "arbitrator") return "arbitrator";
    return "bounties";
  };

  const handleHowItWorksClick = () => {
    setMobileMenuOpen(false);
    if (currentView !== "landing") {
      onNavigate("landing");
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById("how-it-works");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleManualWalletConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputAddress.trim()) {
      setCustomAddress(customInputAddress.trim());
      setCustomInputAddress("");
      setWalletModalOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B0D0C]/95 backdrop-blur-md border-b border-[#2B302B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-6">
            {/* Zone 1: Brand Wordmark */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded-lg p-1"
              onClick={() => {
                onNavigate("landing");
                setMobileMenuOpen(false);
              }}
              tabIndex={0}
              role="button"
              aria-label="BountyVault Home"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onNavigate("landing");
                }
              }}
            >
              <div className="w-7 h-7 rounded-md bg-[#141715] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D] shadow-sm">
                <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-base tracking-tight text-[#F5F5F0] whitespace-nowrap">
                Bounty<span className="text-[#C6FF4D]">Vault</span>
              </span>
            </div>

            {/* Zone 2: Navigation Links (Marketplace, Learn, How It Works) */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide">
              <button
                onClick={() => onNavigate("bounties")}
                className={`transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded px-1.5 py-1 ${
                  currentView === "bounties" ? "text-[#F5F5F0] font-semibold" : "text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => onNavigate("learn")}
                className={`transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded px-1.5 py-1 ${
                  currentView === "learn" ? "text-[#C6FF4D] font-semibold" : "text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                Learn
              </button>
              <button
                onClick={handleHowItWorksClick}
                className="transition-colors whitespace-nowrap text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded px-1.5 py-1"
              >
                How It Works
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => onNavigate(getDashboardViewForRole())}
                  className={`transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded px-1.5 py-1 ${
                    ["poster", "worker", "arbitrator"].includes(currentView)
                      ? "text-[#C6FF4D] font-semibold"
                      : "text-[#9A9E98] hover:text-[#F5F5F0]"
                  }`}
                >
                  {role === "poster"
                    ? "Poster Console"
                    : role === "worker"
                    ? "Worker Dashboard"
                    : "Arbitrator Admin"}
                </button>
              )}
            </nav>

            {/* Zone 3: Wallet, Login, and Get Started */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Wallet Button */}
              {isConnected ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  <span className="font-mono text-[#F5F5F0] font-medium text-[11px]">{shortAddress}</span>
                  <button
                    onClick={() => disconnectWallet()}
                    className="ml-1 text-[11px] text-[#9A9E98] hover:text-[#EF4444] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EF4444] rounded"
                    title="Disconnect wallet"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] text-xs font-medium text-[#F5F5F0] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#C6FF4D]" />
                  <span>Connect Wallet</span>
                </button>
              )}

              {/* User Session or Login / Get Started */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#2B302B]">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs text-[#9A9E98]">
                    <UserIcon className="w-3.5 h-3.5 text-[#9A9E98]" />
                    <span className="font-medium text-[#F5F5F0] max-w-[90px] truncate">{user?.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-md text-[#9A9E98] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate("auth")}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate("auth")}
                    className="px-3.5 py-1.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold shadow-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-[#9A9E98] hover:text-[#F5F5F0] hover:bg-[#141715] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0D0C] border-b border-[#2B302B] px-4 pt-3 pb-5 space-y-3">
            <div className="flex flex-col gap-2 text-sm font-medium">
              <button
                onClick={() => {
                  onNavigate("bounties");
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 ${
                  currentView === "bounties" ? "text-[#C6FF4D] font-semibold" : "text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => {
                  onNavigate("learn");
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 ${
                  currentView === "learn" ? "text-[#C6FF4D] font-semibold" : "text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                Learn Center
              </button>
              <button
                onClick={handleHowItWorksClick}
                className="text-left py-2 text-[#9A9E98] hover:text-[#F5F5F0]"
              >
                How It Works
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    onNavigate(getDashboardViewForRole());
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-[#C6FF4D] font-semibold"
                >
                  {role === "poster"
                    ? "Poster Console"
                    : role === "worker"
                    ? "Worker Dashboard"
                    : "Arbitrator Admin"}
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-[#2B302B] space-y-2.5">
              {isConnected ? (
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#141715] border border-[#2B302B]">
                  <span className="text-[#9A9E98]">Wallet:</span>
                  <span className="font-mono text-[#F5F5F0]">{shortAddress}</span>
                  <button
                    onClick={() => disconnectWallet()}
                    className="text-[#EF4444] font-medium ml-2"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setWalletModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#141715] border border-[#2B302B] text-[#F5F5F0] text-xs font-semibold"
                >
                  <Wallet className="w-4 h-4 text-[#C6FF4D]" />
                  Connect Wallet
                </button>
              )}

              {isAuthenticated ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#9A9E98]">
                    {user?.name} ({role})
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-[#EF4444] font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onNavigate("auth");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg bg-[#141715] border border-[#2B302B] text-[#F5F5F0] text-xs font-semibold text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("auth");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] text-xs font-semibold text-center"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Wallet Connection Modal */}
      {walletModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setWalletModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D]">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#F5F5F0]">Connect Algorand Wallet</h3>
              </div>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="text-[#9A9E98] hover:text-[#F5F5F0] p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Connect via Pera Wallet browser extension or input your Algorand address to participate in escrow verification.
            </p>

            <div className="space-y-3 pt-1">
              <button
                onClick={async () => {
                  const addr = await connectWallet();
                  if (addr) setWalletModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] hover:border-[#3D443D] text-xs font-semibold text-[#F5F5F0] flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Pera Wallet Connect
                </span>
                <span className="text-[11px] text-[#9A9E98]">Direct Sync</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#2B302B]"></div>
                <span className="flex-shrink mx-3 text-[11px] text-[#6B7068] uppercase tracking-wider">or address</span>
                <div className="flex-grow border-t border-[#2B302B]"></div>
              </div>

              <form onSubmit={handleManualWalletConnect} className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste Algorand address (e.g. 52-char ALGO address)"
                  value={customInputAddress}
                  onChange={(e) => setCustomInputAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  Set Account Address
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
