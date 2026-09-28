"use client";

import React from "react";

export const TelemetryChart: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[10px] uppercase font-bold">Velocity Profiler</span>
        <span className="text-cyan-tech text-[10px]">60Hz Stream</span>
      </div>
      <div className="h-16 flex items-end gap-1 pt-2">
        {[20, 35, 45, 60, 75, 80, 85, 90, 85, 80, 70, 60, 50, 40, 30, 20].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-cyan-500/30 hover:bg-cyan-tech rounded-t transition-colors"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};
