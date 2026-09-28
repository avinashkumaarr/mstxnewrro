"use client";

import React from "react";
import { Cpu } from "lucide-react";

export const RobotCard: React.FC<{ name: string; type: string }> = ({ name, type }) => {
  return (
    <div className="p-4 rounded-lg bg-panel-elevated border border-panel-border font-mono text-xs space-y-1">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-cyan-tech" />
        <span className="font-bold text-slate-100">{name}</span>
      </div>
      <p className="text-[11px] text-slate-400">{type}</p>
    </div>
  );
};
