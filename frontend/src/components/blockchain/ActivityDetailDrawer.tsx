"use client";

import React, { useState } from "react";
import { ActivityEvent } from "@/types/event";
import { X, Copy, Check, ExternalLink, ShieldCheck, Cpu, Box, Radio } from "lucide-react";

interface ActivityDetailDrawerProps {
  event: ActivityEvent | null;
  onClose: () => void;
}

export const ActivityDetailDrawer: React.FC<ActivityDetailDrawerProps> = ({
  event,
  onClose,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [viewRecordModal, setViewRecordModal] = useState(false);

  if (!event) return null;

  const copyToClipboard = (text: string, type: "hash" | "tx") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1500);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-lg bg-panel border-l border-panel-border h-full flex flex-col shadow-2xl z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-panel-border flex items-center justify-between bg-panel-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-tech">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                On-Chain Attestation Record
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                ID: {event.id} • {event.timestamp}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status banner */}
          <div className="p-3.5 rounded-lg bg-[#0a0e1a] border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Verification Status</span>
              <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {event.status === "confirmed" ? "ZK-7 PROVED & CONFIRMED" : event.status.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Network</span>
              <span className="text-xs font-mono text-purple-300 font-semibold">{event.network}</span>
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-panel-elevated border border-panel-border">
              <span className="text-[10px] text-slate-500 block mb-1">EVENT TYPE</span>
              <span className="text-sm font-semibold text-cyan-tech">
                {event.type.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-3 rounded bg-panel-elevated border border-panel-border">
              <span className="text-[10px] text-slate-500 block mb-1">CHALLENGE REFERENCE</span>
              <span className="text-xs text-slate-200">
                {event.challengeTitle || event.challengeId}
              </span>
            </div>

            {/* Event Hash */}
            <div className="p-3 rounded bg-panel-elevated border border-panel-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">EVENT HASH (SHA-256 STATE MERKLE ROOT)</span>
                <button
                  onClick={() => copyToClipboard(event.eventHash, "hash")}
                  className="text-cyan-tech hover:underline flex items-center gap-1 text-[10px]"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedHash ? "Copied" : "Copy Hash"}
                </button>
              </div>
              <div className="p-2 rounded bg-[#070a12] border border-panel-border text-[11px] text-cyan-tech break-all select-all">
                {event.eventHash}
              </div>
            </div>

            {/* Transaction Hash */}
            {event.transactionHash && (
              <div className="p-3 rounded bg-panel-elevated border border-panel-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">TRANSACTION HASH</span>
                  <button
                    onClick={() => copyToClipboard(event.transactionHash!, "tx")}
                    className="text-purple-400 hover:underline flex items-center gap-1 text-[10px]"
                  >
                    {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedTx ? "Copied" : "Copy Tx"}
                  </button>
                </div>
                <div className="p-2 rounded bg-[#070a12] border border-panel-border text-[11px] text-purple-300 break-all select-all">
                  {event.transactionHash}
                </div>
              </div>
            )}

            {/* Block & Gas Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-panel-elevated border border-panel-border">
                <span className="text-[10px] text-slate-500 block mb-0.5">BLOCK HEIGHT</span>
                <span className="text-slate-100 font-bold">#{event.blockNumber || 4921803}</span>
              </div>
              <div className="p-3 rounded bg-panel-elevated border border-panel-border">
                <span className="text-[10px] text-slate-500 block mb-0.5">GAS CONSUMED</span>
                <span className="text-slate-100 font-bold">{event.details?.gasUsed || "0.00038 MST"}</span>
              </div>
            </div>

            {/* Performance telemetry snapshot */}
            {event.details && (
              <div className="p-3.5 rounded bg-panel-elevated border border-panel-border space-y-2">
                <span className="text-[10px] text-slate-500 uppercase block">Attested Robotics Telemetry</span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  {event.details.score !== undefined && (
                    <div className="p-2 rounded bg-slate-900/60 border border-panel-border">
                      <span className="text-[10px] text-slate-500 block">Score</span>
                      <span className="text-emerald-400 font-bold text-xs">{event.details.score}%</span>
                    </div>
                  )}
                  {event.details.executionTime !== undefined && (
                    <div className="p-2 rounded bg-slate-900/60 border border-panel-border">
                      <span className="text-[10px] text-slate-500 block">Time</span>
                      <span className="text-slate-200 font-bold text-xs">{event.details.executionTime}s</span>
                    </div>
                  )}
                  {event.details.collisions !== undefined && (
                    <div className="p-2 rounded bg-slate-900/60 border border-panel-border">
                      <span className="text-[10px] text-slate-500 block">Collisions</span>
                      <span className="text-slate-200 font-bold text-xs">{event.details.collisions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-panel-border bg-panel-elevated flex items-center justify-between gap-3">
          <button
            onClick={() => copyToClipboard(event.eventHash, "hash")}
            className="flex-1 py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-panel-border transition-colors flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Hash
          </button>
          <button
            onClick={() => copyToClipboard(event.transactionHash || event.eventHash, "tx")}
            className="flex-1 py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-purple-300 border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Tx
          </button>
          <button
            onClick={() => setViewRecordModal(true)}
            className="py-2 px-4 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-cyan-glow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Record
          </button>
        </div>

        {/* Record view popover */}
        {viewRecordModal && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-panel border border-cyan-500/50 rounded-lg p-5 max-w-md w-full shadow-cyan-glow font-mono text-xs">
              <div className="flex items-center justify-between border-b border-panel-border pb-3">
                <span className="text-cyan-tech font-bold">MST EXPLORER RECORD # {event.blockNumber}</span>
                <button onClick={() => setViewRecordModal(false)} className="text-slate-400 hover:text-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2 text-slate-300">
                <div className="p-2 rounded bg-[#0a0e1a]">
                  <span className="text-slate-500 block text-[10px]">EVM CONTRACT:</span>
                  <span className="text-cyan-tech">0x91F2B003e84Ac34289C82B5f128e49F03B917</span>
                </div>
                <div className="p-2 rounded bg-[#0a0e1a]">
                  <span className="text-slate-500 block text-[10px]">VERIFIER ORACLE:</span>
                  <span className="text-slate-300">NEWRRO-ROS2-HIL-VALIDATOR-01</span>
                </div>
                <div className="p-2 rounded bg-[#0a0e1a]">
                  <span className="text-slate-500 block text-[10px]">CONSENSUS ATTESTATION:</span>
                  <span className="text-emerald-400">PASSED • ZERO MUTATION PROOF VALID</span>
                </div>
              </div>
              <button
                onClick={() => setViewRecordModal(false)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
