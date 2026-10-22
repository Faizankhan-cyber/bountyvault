import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import { 
  Shield, 
  Briefcase, 
  Wrench, 
  Scale, 
  ArrowRight, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon,
  Loader2
} from "lucide-react";

interface AuthPageProps {
  onNavigate: (view: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { login, signup } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("worker");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    if (isRegister && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isRegister) {
        const user = await signup(name.trim(), email.trim(), password, selectedRole);
        onNavigate(user.role);
      } else {
        const user = await login(email.trim(), password);
        onNavigate(user.role);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Testing Presets
  const handleQuickArbitratorLogin = () => {
    setEmail("arbitrator@bountyvault.local");
    setPassword("admin123");
    setSelectedRole("arbitrator");
    setIsRegister(false);
    setError(null);
  };

  const handleQuickDemoWorker = () => {
    setName("Dev Alice");
    setEmail("worker@test.com");
    setPassword("worker123");
    setSelectedRole("worker");
    setError(null);
  };

  const handleQuickDemoPoster = () => {
    setName("Founder Bob");
    setEmail("poster@test.com");
    setPassword("poster123");
    setSelectedRole("poster");
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Centered Brand / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs text-[#9A9E98] font-mono shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF4D]"></span>
            <span>ALGORAND ESCROW GATEWAY</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight">
            {isRegister ? "Create Platform Account" : "Access BountyVault"}
          </h1>

          <p className="text-xs text-[#9A9E98] max-w-sm mx-auto leading-relaxed">
            {isRegister
              ? "Select your platform role to deploy bounties, deliver milestones, or arbitrate disputes."
              : "Enter your credentials to access your decentralized escrow workspace."}
          </p>
        </div>

        {/* Clean Centered Auth Card */}
        <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Segmented Mode Switcher */}
          <div className="flex p-1 rounded-lg bg-[#0B0D0C] border border-[#2B302B] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
                !isRegister
                  ? "bg-[#191D19] text-[#F5F5F0] border border-[#2B302B] shadow-sm"
                  : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
                isRegister
                  ? "bg-[#191D19] text-[#F5F5F0] border border-[#2B302B] shadow-sm"
                  : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-[#6B7068] block">
              {isRegister ? "Select Account Role" : "Workspace Role"}
            </label>
            <div
              role="radiogroup"
              aria-label="Platform role"
              className="grid grid-cols-3 gap-2"
            >
              {/* Poster Card */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={selectedRole === "poster"}
                onClick={() => setSelectedRole("poster")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedRole("poster");
                }}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] flex flex-col items-center justify-center space-y-1 ${
                  selectedRole === "poster"
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#F5F5F0] shadow-sm"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98] hover:border-[#3D443D] hover:text-[#F5F5F0]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    selectedRole === "poster"
                      ? "bg-[#C6FF4D]/10 border-[#C6FF4D] text-[#C6FF4D]"
                      : "bg-[#141715] border-[#2B302B] text-[#9A9E98]"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Poster</div>
                  <div className="text-[10px] text-[#6B7068] leading-tight">Fund Escrow</div>
                </div>
              </div>

              {/* Worker Card */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={selectedRole === "worker"}
                onClick={() => setSelectedRole("worker")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedRole("worker");
                }}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] flex flex-col items-center justify-center space-y-1 ${
                  selectedRole === "worker"
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#F5F5F0] shadow-sm"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98] hover:border-[#3D443D] hover:text-[#F5F5F0]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    selectedRole === "worker"
                      ? "bg-[#C6FF4D]/10 border-[#C6FF4D] text-[#C6FF4D]"
                      : "bg-[#141715] border-[#2B302B] text-[#9A9E98]"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Worker</div>
                  <div className="text-[10px] text-[#6B7068] leading-tight">Claim ALGO</div>
                </div>
              </div>

              {/* Admin Card */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={selectedRole === "arbitrator"}
                onClick={() => setSelectedRole("arbitrator")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedRole("arbitrator");
                }}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] flex flex-col items-center justify-center space-y-1 ${
                  selectedRole === "arbitrator"
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#F5F5F0] shadow-sm"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98] hover:border-[#3D443D] hover:text-[#F5F5F0]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    selectedRole === "arbitrator"
                      ? "bg-[#C6FF4D]/10 border-[#C6FF4D] text-[#C6FF4D]"
                      : "bg-[#141715] border-[#2B302B] text-[#9A9E98]"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Admin</div>
                  <div className="text-[10px] text-[#6B7068] leading-tight">Arbitrate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation or API Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-[#EF4444] text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs" noValidate>
            {isRegister && (
              <div className="space-y-1">
                <label htmlFor="auth-name" className="text-[#9A9E98] font-medium block">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6B7068] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="e.g. Satoshi Nakamoto"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] text-xs placeholder-[#6B7068] focus:outline-none focus:border-[#C6FF4D] focus-visible:ring-1 focus-visible:ring-[#C6FF4D] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="auth-email" className="text-[#9A9E98] font-medium block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7068] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] text-xs placeholder-[#6B7068] focus:outline-none focus:border-[#C6FF4D] focus-visible:ring-1 focus-visible:ring-[#C6FF4D] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="text-[#9A9E98] font-medium block">
                  Password
                </label>
                {isRegister && (
                  <span className="text-[10px] text-[#6B7068]">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7068] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-10 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] text-xs placeholder-[#6B7068] focus:outline-none focus:border-[#C6FF4D] focus-visible:ring-1 focus-visible:ring-[#C6FF4D] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-2.5 text-[#6B7068] hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isRegister
                        ? `Register as ${selectedRole === "arbitrator" ? "Admin" : selectedRole === "poster" ? "Poster" : "Worker"}`
                        : "Sign In"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Footer */}
          <div className="pt-3 border-t border-[#2B302B] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#9A9E98]">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <KeyRound className="w-3 h-3 text-[#C6FF4D]" /> QUICK PRESETS:
              </span>
              <span className="text-[10px] text-[#6B7068]">1-click fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoPoster}
                className="py-1.5 px-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[#F5F5F0] text-[10px] font-medium transition-colors text-center truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                Poster Demo
              </button>
              <button
                type="button"
                onClick={handleQuickDemoWorker}
                className="py-1.5 px-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[#F5F5F0] text-[10px] font-medium transition-colors text-center truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                Worker Demo
              </button>
              <button
                type="button"
                onClick={handleQuickArbitratorLogin}
                className="py-1.5 px-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[#F5F5F0] text-[10px] font-medium transition-colors text-center truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
