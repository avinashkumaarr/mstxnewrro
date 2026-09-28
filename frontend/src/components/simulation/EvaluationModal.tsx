"use client";

import React, { useState } from "react";
import { SimulationResult } from "@/types/simulation";
import { ActivityEvent } from "@/types/event";
import {
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface EvaluationModalProps {
  result: SimulationResult | null;
  attestationEvent: ActivityEvent | null;
  onClose: () => void;
  onRetry: () => void;
  onViewActivityDetails: (event: ActivityEvent) => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  result,
  attestationEvent,
  onClose,
  onRetry,
  onViewActivityDetails,
}) => {
  const [copiedProof, setCopiedProof] = useState(false);

  if (!result) return null;

  const isPassed = result.status === "PASSED";

  const handleCopyProof = (proof: string) => {
    navigator.clipboard.writeText(proof);
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-panel border border-panel-border rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header Banner */}
        <div
          className={`p-5 border-b border-panel-border flex items-center justify-between ${
            isPassed ? "bg-emerald-950/40" : "bg-red-950/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                isPassed
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-red-500/20 border-red-500/40 text-red-400"
              }`}
            >
              {isPassed ? <Trophy className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                EVALUATION REPORT
              </span>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Mission {result.status}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono ${
                    isPassed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  Score: {result.score}/100
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Evaluation Metrics Breakdown */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 font-mono bg-[#070a12] p-3 rounded border border-panel-border">
            {result.summaryMessage}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border">
              <span className="text-[10px] text-slate-500 block">WAYPOINTS</span>
              <span className="text-sm font-bold text-slate-100">
                {result.waypointsReached}/{result.totalWaypoints}
              </span>
            </div>

            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border">
              <span className="text-[10px] text-slate-500 block">COLLISIONS</span>
              <span
                className={`text-sm font-bold ${
                  result.collisions === 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {result.collisions}
              </span>
            </div>

            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border">
              <span className="text-[10px] text-slate-500 block">EFFICIENCY</span>
              <span className="text-sm font-bold text-cyan-tech">{result.pathEfficiency}%</span>
            </div>

            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border">
              <span className="text-[10px] text-slate-500 block">EXECUTION</span>
              <span className="text-sm font-bold text-slate-100">{result.executionTime}s</span>
            </div>
          </div>

          {/* MST On-Chain Attestation Card (Image 1 style) */}
          {attestationEvent && (
            <div className="p-4 rounded-lg bg-panel-elevated border border-purple-500/40 shadow-purple-glow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold font-mono text-purple-200">
                    MST ON-CHAIN ATTESTATION
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-500/50 text-purple-300 font-semibold">
                  TESTNET SYNCD
                </span>
              </div>

              {/* Proof Box */}
              <div className="flex items-center justify-between p-2.5 rounded bg-[#070a12] border border-panel-border mt-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Proof:</span>
                  <span className="text-cyan-tech font-bold">
                    {attestationEvent.eventHash.slice(0, 16)}...{attestationEvent.eventHash.slice(-8)}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyProof(attestationEvent.eventHash)}
                  className="p-1 hover:text-cyan-tech text-slate-400 transition-colors"
                  title="Copy Attestation Proof Hash"
                >
                  {copiedProof ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Attestation Specs */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Block: #{attestationEvent.blockNumber}</span>
                <span>Latency: {attestationEvent.details?.latencyMs || 18}ms</span>
                <span className="text-emerald-400 font-semibold">
                  Score: {result.score}% ({result.collisions === 0 ? "Zero Collisions" : `${result.collisions} Breaches`})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-panel-border bg-panel-elevated flex items-center justify-between gap-3 font-mono text-xs">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-panel-border transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Simulation</span>
          </button>

          <div className="flex items-center gap-2">
            {attestationEvent && (
              <button
                onClick={() => onViewActivityDetails(attestationEvent)}
                className="px-3 py-2 rounded bg-purple-950 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View On-Chain Proof</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold transition-colors shadow-cyan-glow"
            >
              Continue Working
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
