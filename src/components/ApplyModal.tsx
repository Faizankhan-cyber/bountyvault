import React, { useState, useEffect } from "react";
import { Bounty } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { X, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ApplyModalProps {
  bounty: Bounty;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ bounty, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { address } = useWallet();

  const [form, setForm] = useState({
    worker_name: user?.name || "",
    worker_email: user?.email || "",
    worker_skills: "",
    worker_reason: "",
    wallet_address: address || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        worker_name: user.name || prev.worker_name,
        worker_email: user.email || prev.worker_email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (address) {
      setForm((prev) => ({ ...prev, wallet_address: address }));
    }
  }, [address]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.worker_name.trim() || !form.worker_email.trim() || !form.worker_skills.trim() || !form.worker_reason.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.applyToBounty(bounty.id, {
        worker_name: form.worker_name.trim(),
        worker_email: form.worker_email.trim(),
        worker_skills: form.worker_skills.trim(),
        worker_reason: form.worker_reason.trim(),
        wallet_address: form.wallet_address.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit proposal. You may have already applied.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#C6FF4D]">
                Bounty #{bounty.id}
              </span>
              <span className="text-[11px] text-[#9A9E98] font-mono">{bounty.reward} ALGO Escrow</span>
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F0] leading-snug line-clamp-1">{bounty.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9A9E98] hover:text-[#F5F5F0] p-1.5 rounded-lg hover:bg-[#191D19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#F5F5F0] mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={form.worker_name}
                onChange={(e) => setForm({ ...form, worker_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
                placeholder="Jane Developer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F5F5F0] mb-1">Your Email Address *</label>
              <input
                type="email"
                required
                value={form.worker_email}
                onChange={(e) => setForm({ ...form, worker_email: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
                placeholder="jane@algo.dev"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F5F5F0] mb-1">
              Relevant Skills & Stack *
            </label>
            <input
              type="text"
              required
              value={form.worker_skills}
              onChange={(e) => setForm({ ...form, worker_skills: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              placeholder="e.g. TypeScript, Algorand SDK, TEAL, React 19"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F5F5F0] mb-1">
              Proposal & Execution Plan *
            </label>
            <textarea
              required
              rows={4}
              value={form.worker_reason}
              onChange={(e) => setForm({ ...form, worker_reason: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none resize-none"
              placeholder="Explain why you are qualified, your expected delivery timeline, and links to prior verified open-source work..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F5F5F0] mb-1">
              Algorand Payout Address (Optional)
            </label>
            <input
              type="text"
              value={form.wallet_address}
              onChange={(e) => setForm({ ...form, wallet_address: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs font-mono text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
              placeholder="58-character Algorand wallet address"
            />
            <p className="text-[10px] text-[#6B7068] mt-1">
              If left blank, you can provide or update your wallet address upon task selection.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#2B302B]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] hover:bg-[#191D19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Proposal...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
