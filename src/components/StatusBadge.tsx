import React from "react";
import { BountyStatus, ApplicantStatus } from "../types";

interface StatusBadgeProps {
  status: BountyStatus | ApplicantStatus | string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const s = (status || "").toLowerCase();

  const getStyle = () => {
    switch (s) {
      case "open":
      case "pending":
        return {
          label: s === "open" ? "OPEN FOR PROPOSALS" : "PENDING REVIEW",
          bg: "bg-[#191D19]",
          text: "text-[#C6FF4D]",
          border: "border-[#2B302B]",
          dot: "bg-[#C6FF4D]",
        };
      case "acquired":
      case "selected":
        return {
          label: s === "acquired" ? "IN PROGRESS" : "SELECTED",
          bg: "bg-amber-950/20",
          text: "text-amber-400",
          border: "border-amber-800/30",
          dot: "bg-amber-400",
        };
      case "completed":
        return {
          label: "SETTLED / COMPLETED",
          bg: "bg-emerald-950/20",
          text: "text-[#10B981]",
          border: "border-emerald-800/30",
          dot: "bg-[#10B981]",
        };
      case "disputed":
        return {
          label: "IN DISPUTE",
          bg: "bg-rose-950/20",
          text: "text-[#EF4444]",
          border: "border-rose-800/30",
          dot: "bg-[#EF4444]",
        };
      case "cancelled":
      case "rejected":
        return {
          label: s === "cancelled" ? "CANCELLED & REFUNDED" : "REJECTED",
          bg: "bg-[#141715]",
          text: "text-[#9A9E98]",
          border: "border-[#2B302B]",
          dot: "bg-[#6B7068]",
        };
      default:
        return {
          label: s.toUpperCase(),
          bg: "bg-[#141715]",
          text: "text-[#9A9E98]",
          border: "border-[#2B302B]",
          dot: "bg-[#9A9E98]",
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      <span>{style.label}</span>
    </span>
  );
};
