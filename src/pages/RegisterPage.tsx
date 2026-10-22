import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import { 
  Shield, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  Briefcase,
  FolderKanban,
  Scale
} from "lucide-react";

interface RegisterPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your full name or team organization.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim().toLowerCase(), password, role);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. An account with this email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      
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
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F0]">Create Your Account</h1>
        <p className="text-xs text-[#9A9E98]">
          Join as a client poster, skilled developer/contributor, or neutral arbitrator.
        </p>
      </div>

      {/* Main Register Card */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F5F0] mb-2">
              Select Primary Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("worker")}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  role === "worker"
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#C6FF4D]"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Contributor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("poster")}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  role === "poster"
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#C6FF4D]"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Poster</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("arbitrator")}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  role === "arbitrator"
                    ? "bg-[#191D19] border-[#C6FF4D] text-[#C6FF4D]"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Arbitrator</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
              Full Name or Organization *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
              <input
                type="text"
                required
                placeholder="Jane Developer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
              <input
                type="email"
                required
                placeholder="jane@algo.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F5F0] mb-1.5">
              Password * (minimum 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-[#2B302B]">
          <p className="text-xs text-[#9A9E98]">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-[#C6FF4D] font-semibold hover:underline"
            >
              Log in here
            </button>
          </p>
        </div>

      </div>

    </div>
  );
};
