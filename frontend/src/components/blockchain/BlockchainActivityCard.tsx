"use client";

import React, { useState } from "react";
import { ActivityEvent } from "@/types/event";
import { CheckCircle2, Clock, XCircle, Copy, Check, ExternalLink, ShieldCheck, Zap } from "lucide-react";

interface BlockchainActivityCardProps {
  event: ActivityEvent;
  onClick?: () => void;
  compact?: boolean;
}

export const BlockchainActivityCard: React.FC<BlockchainActivityCardProps> = ({
  event,
  onClick,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case "confirmed":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Verified
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3 text-red-400" />
            Failed
          </span>
        );
    }
  };

  const formatHash = (h: string) => {
    if (!h) return "0x...";
    return `${h.slice(0, 10)}...${h.slice(-8)}`;
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-between p-2.5 rounded bg-panel-elevated/80 border border-panel-border hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-slate-800/40"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-slate-400">{event.timestamp}</span>
          <span className="text-xs font-medium text-slate-200 capitalize">
            {event.type.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg bg-panel-elevated border border-panel-border hover:border-cyan-500/40 cursor-pointer transition-all hover:shadow-cyan-glow group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-purple-950/50 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-100">
                {event.type.replace(/_/g, " ")}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                MST TESTNET
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {event.challengeTitle || event.challengeId}
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Hash Details */}
      <div className="mt-3.5 pt-3 border-t border-panel-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-slate-500 block text-[10px]">EVENT PROOF HASH</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-cyan-tech">{formatHash(event.eventHash)}</span>
            <button
              onClick={(e) => handleCopy(e, event.eventHash)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Copy event hash"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {event.transactionHash && (
          <div>
            <span className="text-slate-500 block text-[10px]">TX HASH / BLOCK</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-purple-300">{formatHash(event.transactionHash)}</span>
              {event.blockNumber && (
                <span className="text-[10px] text-slate-400">#{event.blockNumber}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Optional details footer */}
      {event.details && (
        <div className="mt-2.5 pt-2 border-t border-panel-border/30 flex items-center justify-between text-[10px] font-mono text-slate-400">
          {event.details.score !== undefined && (
            <span className="text-emerald-400 font-semibold">
              Score: {event.details.score}%
            </span>
          )}
          {event.details.executionTime !== undefined && (
            <span>Time: {event.details.executionTime}s</span>
          )}
          {event.details.collisions !== undefined && (
            <span className={event.details.collisions === 0 ? "text-slate-400" : "text-red-400"}>
              Collisions: {event.details.collisions}
            </span>
          )}
          <span className="text-slate-500">{event.timestamp}</span>
        </div>
      )}
    </div>
  );
};
