"use client";

import React, { useState } from "react";
import { CredentialEvidenceMilestone } from "@/types/certificate";
import {
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Award,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

interface CertificateEvidenceTimelineProps {
  evidence: CredentialEvidenceMilestone[];
  certificateId: string;
}

export const CertificateEvidenceTimeline: React.FC<CertificateEvidenceTimelineProps> = ({
  evidence,
  certificateId,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const getStepIcon = (eventName: string) => {
    const lower = eventName.toLowerCase();
    if (lower.includes("start")) return <Clock className="w-4 h-4 text-cyan-400" />;
    if (lower.includes("code")) return <Code2 className="w-4 h-4 text-purple-400" />;
    if (lower.includes("simulat")) return <Cpu className="w-4 h-4 text-blue-400" />;
    if (lower.includes("pass") || lower.includes("eval"))
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (lower.includes("cert") || lower.includes("approv"))
      return <Award className="w-4 h-4 text-amber-400" />;
    if (lower.includes("blockchain") || lower.includes("record") || lower.includes("confirm"))
      return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-4 font-sans select-none">
      <div className="flex items-center justify-between border-b border-panel-border pb-3">
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-tech animate-pulse" />
            Verified Achievement History
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cryptographic learning evidence chain proving exact simulation and evaluation milestones.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-elevated border border-panel-border text-slate-400">
          {evidence.length} Milestones
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-600 before:to-emerald-500">
        {evidence.map((step, idx) => {
          const isConfirmed = step.status === "confirmed" || step.status === "verified";

          return (
            <div key={step.id || idx} className="relative group">
              {/* Dot Icon Indicator */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#080d17] border-2 border-cyan-500/60 flex items-center justify-center shadow-cyan-glow group-hover:scale-110 transition-transform">
                {getStepIcon(step.eventName)}
              </div>

              {/* Milestone Content Card */}
              <div className="p-3.5 rounded-xl bg-panel-elevated/80 border border-panel-border hover:border-cyan-500/40 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-tech transition-colors">
                      {step.eventName}
                    </span>
                    {step.score !== undefined && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        Score: {step.score}/100
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {step.timestamp}
                  </span>
                </div>

                {step.details && (
                  <p className="text-[11px] text-slate-300 font-sans">
                    {step.details}
                  </p>
                )}

                <div className="pt-2 border-t border-panel-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Activity ID:</span>
                    <span className="text-slate-200">{step.activityId}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Status:</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isConfirmed ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {step.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Event Hash Display with Copy */}
                {step.eventHash && (
                  <div className="flex items-center justify-between gap-2 pt-1 font-mono text-[10px] bg-slate-950/80 px-2 py-1 rounded border border-panel-border">
                    <span className="text-slate-500">Hash:</span>
                    <span className="text-cyan-400/90 truncate max-w-[200px] sm:max-w-[280px]">
                      {step.eventHash}
                    </span>
                    <button
                      onClick={() => handleCopy(step.eventHash)}
                      className="text-slate-400 hover:text-cyan-tech transition-colors flex items-center gap-1 ml-auto flex-shrink-0"
                      title="Copy Event Hash"
                    >
                      {copiedHash === step.eventHash ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
