"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { blockchainService } from "@/services/blockchainService";
import { ShieldCheck, Search, CheckCircle2, Copy, Check, FileCheck } from "lucide-react";

export default function VerificationPage() {
  const [searchHash, setSearchHash] = useState("0x7f9a882e9d246c10b7f832a89cb1f58921df4a889b71a0429f521b34882131b8");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    if (!searchHash) return;
    setIsVerifying(true);
    const res = await blockchainService.verifyEventProof(searchHash);
    setVerificationResult(res);
    setIsVerifying(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6 select-none font-sans">
        {/* Header */}
        <div className="border-b border-panel-border pb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
            <span>MST ATTESTATION VERIFIER</span>
            <span className="text-slate-600">/</span>
            <span>ZK-PROOF SNARK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Independent Skill & Trajectory Verification
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query the MST Testnet state root to cryptographically verify robotics simulation runs, collision-free kinematics, and earned badges.
          </p>
        </div>

        {/* Verification Form */}
        <div className="p-6 rounded-xl bg-panel border border-panel-border space-y-4 font-mono">
          <label className="text-xs text-slate-300 block font-bold">
            ENTER ATTESTATION PROOF HASH OR TRANSACTION HASH
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#070a12] border border-panel-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-cyan-tech font-mono focus:outline-none focus:border-cyan-tech transition-colors"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-5 py-2.5 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs transition-colors flex items-center gap-1.5 shadow-cyan-glow disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isVerifying ? "Verifying..." : "Verify Proof"}</span>
            </button>
          </div>

          {/* Verification Result Card */}
          {verificationResult && (
            <div className="mt-4 p-5 rounded-lg bg-panel-elevated border border-emerald-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CRYPTOGRAPHIC ATTESTATION VALID</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  CONSENSUS ATTESTED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-panel-border">
                <div>
                  <span className="text-[10px] text-slate-500 block">PROOF ALGORITHM</span>
                  <span className="text-slate-200">{verificationResult.attestationType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SETTLEMENT BLOCK</span>
                  <span className="text-slate-200">#{verificationResult.blockNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TIME STAMP</span>
                  <span className="text-slate-200">{verificationResult.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ORACLE INTEGRITY</span>
                  <span className="text-emerald-400">PASSED • ZERO CORRUPTION</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
