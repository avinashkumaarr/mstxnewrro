"use client";

import React from "react";
import { Challenge } from "@/types/challenge";
import { FileText, CheckSquare, Square, Sliders, Shield } from "lucide-react";

interface MissionBriefProps {
  challenge: Challenge;
  goalReached?: boolean;
}

export const MissionBrief: React.FC<MissionBriefProps> = ({ challenge, goalReached = false }) => {
  return (
    <div className="p-3.5 rounded-lg bg-panel-elevated border border-panel-border select-none space-y-4">
      {/* Title & Stage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-cyan-tech" />
          <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
            Mission Brief
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-panel-border text-slate-400 font-semibold">
          STAGE 1/3
        </span>
      </div>

      {/* Objective Text */}
      <p className="text-xs text-slate-300 font-sans leading-relaxed">
        {challenge.objective}
      </p>

      {/* Evaluation Rules */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 block">
          EVALUATION RULES
        </span>
        <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
          {challenge.evaluationRules.map((rule) => {
            const isChecked = rule.id === "rule-4" ? goalReached : rule.checked;
            return (
              <div key={rule.id} className="flex items-start gap-2">
                {isChecked ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className={isChecked ? "text-slate-200" : "text-slate-400"}>
                  {rule.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arena Configuration */}
      <div className="pt-3 border-t border-panel-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
            ARENA CONFIGURATION
          </span>
          <Sliders className="w-3 h-3 text-slate-500" />
        </div>

        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px]">PRESET PROFILE</span>
            <span className="text-cyan-tech font-semibold">{challenge.environment}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-1.5 rounded bg-[#070a12] border border-panel-border">
              <span className="text-[9px] text-slate-500 block">OBSTACLES</span>
              <span className="text-slate-200 font-semibold text-[10px]">
                {challenge.arenaConfig.obstacleDensity}
              </span>
            </div>
            <div className="p-1.5 rounded bg-[#070a12] border border-panel-border">
              <span className="text-[9px] text-slate-500 block">NOISE MODEL</span>
              <span className="text-slate-200 font-semibold text-[10px]">
                {challenge.arenaConfig.noiseModel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
