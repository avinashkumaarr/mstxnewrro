"use client";

import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface VerificationResultProps {
  verified: boolean;
  blockNumber?: number;
  attestationType?: string;
  timestamp?: string;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  verified,
  blockNumber,
  attestationType = "MST-Proof ZK-7 Snark",
  timestamp,
}) => {
  return (
    <div className="p-4 rounded-lg bg-panel-elevated border border-emerald-500/40 space-y-2 font-mono text-xs">
      <div className="flex items-center gap-2 text-emerald-400 font-bold">
        <CheckCircle2 className="w-4 h-4" />
        <span>{verified ? "ATTESTATION VERIFIED" : "VERIFICATION FAILED"}</span>
      </div>
      <div className="text-[11px] text-slate-300">
        <div>Type: {attestationType}</div>
        {blockNumber && <div>Settled Block: #{blockNumber}</div>}
        {timestamp && <div>Timestamp: {timestamp}</div>}
      </div>
    </div>
  );
};
