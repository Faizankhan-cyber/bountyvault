import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { 
  Shield, 
  Wallet, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { address, isConnected, shortAddress, connectWallet, disconnectWallet, setCustomAddress } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [customInputAddress, setCustomInputAddress] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (walletModalOpen) setWalletModalOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [walletModalOpen, mobileMenuOpen]);

  const handleManualWalletConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputAddress.trim()) {
      setCustomAddress(customInputAddress.trim());
      setCustomInputAddress("");
      setWalletModalOpen(false);
    }
  };

  const navLinks = [
    { id: "home", label: "Home", href: "/" },
    { id: "marketplace", label: "Marketplace", href: "/marketplace" },
    { id: "how-it-works", label: "How It Works", href: "/how-it-works" },
    { id: "learn", label: "Learn", href: "/learn" },
    { id: "transactions", label: "Transactions", href: "/transactions" },
    { id: "security", label: "Security", href: "/security" },
    { id: "about", label: "About", href: "/about" },
  ];

  const isNavActive = (id: string) => {
    if (id === "home") return currentView === "home" || currentView === "landing";
    if (id === "marketplace") return currentView === "marketplace" || currentView === "bounties" || currentView === "bounty-detail";
    if (id === "learn") return currentView === "learn" || currentView === "lesson-detail" || currentView === "learn-simulation";
    return currentView === id;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B0D0C]/90 backdrop-blur-md border-b border-[#2B302B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Brand Wordmark (ThreatLens style typography & shield) */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded-lg p-1"
              onClick={() => {
                onNavigate("home");
                setMobileMenuOpen(false);
              }}
              tabIndex={0}
              role="button"
              aria-label="BountyVault Home"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onNavigate("home");
                }
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#141715] border border-[#2B302B] group-hover:border-[#C6FF4D]/50 flex items-center justify-center text-[#C6FF4D] shadow-sm transition-colors">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[#F5F5F0] leading-tight">
                  Bounty<span className="text-[#C6FF4D]">Vault</span>
                </span>
                <span className="text-[9px] font-mono tracking-wider text-[#6B7068] uppercase -mt-0.5">
                  Algorand Escrow
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation Links with active highlight states */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium tracking-wide">
              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
                      active
                        ? "text-[#F5F5F0] bg-[#141715] border border-[#2B302B] font-semibold text-shadow"
                        : "text-[#9A9E98] hover:text-[#F5F5F0] hover:bg-[#141715]/50"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Role Actions, User Session & Algorand Wallet */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              
              {/* Optional Post Bounty Quick Action */}
              {isAuthenticated && role === "poster" && (
                <button
                  onClick={() => onNavigate("create-bounty")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#C6FF4D]/40 text-xs font-medium text-[#C6FF4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Bounty</span>
                </button>
              )}

              {/* Wallet Button */}
              {isConnected ? (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#141715] border border-[#2B302B] text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="font-mono text-[#F5F5F0] font-medium text-[11px]">{shortAddress}</span>
                  <button
                    onClick={() => disconnectWallet()}
                    className="ml-1 text-[10px] text-[#9A9E98] hover:text-[#EF4444] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EF4444] rounded"
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

              {/* Authenticated Controls vs Unauthenticated Login/Register */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#2B302B]">
                  <button
                    onClick={() => onNavigate("dashboard")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                      currentView === "dashboard"
                        ? "bg-[#C6FF4D] text-[#0B0D0C] border-[#C6FF4D]"
                        : "bg-[#141715] text-[#F5F5F0] border-[#2B302B] hover:border-[#3D443D]"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                    <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-black/20">
                      {role}
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-md text-[#9A9E98] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <button
                    onClick={() => onNavigate("login")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
                      currentView === "login"
                        ? "text-[#F5F5F0] bg-[#141715]"
                        : "text-[#9A9E98] hover:text-[#F5F5F0]"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onNavigate("register")}
                    className="px-3.5 py-1.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold shadow-sm transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="lg:hidden flex items-center gap-2">
              {isConnected && (
                <span className="text-[11px] font-mono text-[#F5F5F0] bg-[#141715] px-2 py-1 rounded border border-[#2B302B]">
                  {shortAddress}
                </span>
              )}
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
          <div className="lg:hidden bg-[#0B0D0C] border-b border-[#2B302B] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 text-sm font-medium">
              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between text-left py-2.5 px-3 rounded-lg transition-colors ${
                      active
                        ? "text-[#C6FF4D] bg-[#141715] font-semibold"
                        : "text-[#9A9E98] hover:text-[#F5F5F0]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#6B7068]" />
                  </button>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between text-left py-2.5 px-3 rounded-lg text-[#C6FF4D] bg-[#141715] font-semibold mt-1"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    User Dashboard ({role})
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {isAuthenticated && role === "poster" && (
                <button
                  onClick={() => {
                    onNavigate("create-bounty");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-left py-2.5 px-3 rounded-lg text-[#F5F5F0] bg-[#191D19] border border-[#2B302B]"
                >
                  <PlusCircle className="w-4 h-4 text-[#C6FF4D]" />
                  <span>Post a New Bounty</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-[#2B302B] space-y-3">
              {isConnected ? (
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#141715] border border-[#2B302B]">
                  <span className="text-[#9A9E98]">Wallet Address:</span>
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#141715] border border-[#2B302B] text-[#F5F5F0] text-xs font-semibold"
                >
                  <Wallet className="w-4 h-4 text-[#C6FF4D]" />
                  Connect Algorand Wallet
                </button>
              )}

              {isAuthenticated ? (
                <div className="flex items-center justify-between pt-2 px-1">
                  <div className="text-xs">
                    <div className="text-[#F5F5F0] font-medium">{user?.name}</div>
                    <div className="text-[#6B7068] text-[11px]">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-[#EF4444] font-medium flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onNavigate("login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#141715] border border-[#2B302B] text-[#F5F5F0] text-xs font-semibold text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] text-xs font-semibold text-center"
                  >
                    Register
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setWalletModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
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
                className="text-[#9A9E98] hover:text-[#F5F5F0] p-1 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Connect via Pera Wallet or input an Algorand address for testnet escrow signatures and direct reward settlements.
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
                <span className="text-[11px] text-[#9A9E98]">Direct Wallet Bridge</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#2B302B]"></div>
                <span className="flex-shrink mx-3 text-[11px] text-[#6B7068] uppercase tracking-wider font-mono">or paste address</span>
                <div className="flex-grow border-t border-[#2B302B]"></div>
              </div>

              <form onSubmit={handleManualWalletConnect} className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste Algorand address (58 characters)"
                  value={customInputAddress}
                  onChange={(e) => setCustomInputAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors"
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
