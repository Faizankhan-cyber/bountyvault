import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  UserCheck
} from "lucide-react";

interface LoginPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please provide your email address and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div 
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 cursor-pointer select-none mb-2"
        >
          <div className="w-9 h-9 rounded-lg bg-[#141715] border border-[#2B302B] flex items-center justify-center text-[#C6FF4D] shadow-sm">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#F5F5F0]">
            Bounty<span className="text-[#C6FF4D]">Vault</span>
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F0]">Sign In to Your Account</h1>
        <p className="text-xs text-[#9A9E98]">
          Manage your posted smart escrows, track proposals, or arbitrate contested bounties.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
              <input
                type="email"
                required
                placeholder="name@algo.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#F5F5F0]">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7068] hover:text-[#9A9E98]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Testing Presets */}
        <div className="pt-4 border-t border-[#2B302B] space-y-2.5">
          <div className="text-[11px] font-mono uppercase text-[#6B7068] text-center tracking-wider">
            Quick-Login Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset("poster@test.com", "poster123")}
              className="py-1.5 px-2 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[11px] font-mono text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors"
            >
              Poster Demo
            </button>
            <button
              type="button"
              onClick={() => setPreset("worker@test.com", "worker123")}
              className="py-1.5 px-2 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[11px] font-mono text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors"
            >
              Worker Demo
            </button>
            <button
              type="button"
              onClick={() => setPreset("arbitrator@bountyvault.local", "admin123")}
              className="py-1.5 px-2 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[11px] font-mono text-[#F5F5F0] hover:text-amber-400 transition-colors"
            >
              Arbitrator
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-[#9A9E98]">
            Don't have an account yet?{" "}
            <button
              onClick={() => onNavigate("register")}
              className="text-[#C6FF4D] font-semibold hover:underline"
            >
              Register here
            </button>
          </p>
        </div>

      </div>

    </div>
  );
};
