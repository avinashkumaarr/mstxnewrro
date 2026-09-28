"use client";

import React from "react";
import { Cpu, Activity } from "lucide-react";

interface RobotStatusCardProps {
  name?: string;
  status?: string;
  battery?: number;
}

export const RobotStatusCard: React.FC<RobotStatusCardProps> = ({
  name = "AGV-01 (Differential)",
  status = "ONLINE • ROS2 FOXY",
  battery = 98,
}) => {
  return (
    <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-tech" />
          <span className="font-bold text-slate-100">{name}</span>
        </div>
        <span className="text-[10px] text-emerald-400">{status}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-panel-border">
        <span>Battery Reserve</span>
        <span className="text-cyan-tech font-bold">{battery}%</span>
      </div>
    </div>
  );
};
