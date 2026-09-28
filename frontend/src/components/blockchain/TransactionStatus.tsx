"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface TransactionStatusProps {
  status: "pending" | "confirmed" | "failed";
  txHash?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, txHash }) => {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {status === "confirmed" && (
        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Confirmed
        </span>
      )}
      {status === "pending" && (
        <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
          <Clock className="w-3 h-3 text-amber-400 animate-spin" />
          Pending
        </span>
      )}
      {status === "failed" && (
        <span className="flex items-center gap-1 text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
          <XCircle className="w-3 h-3 text-red-400" />
          Failed
        </span>
      )}
      {txHash && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{txHash}</span>}
    </div>
  );
};
