"use client";

import React from "react";

export const RobotDetails: React.FC<{ robotId: string }> = ({ robotId }) => {
  return (
    <div className="p-4 rounded-lg bg-panel-elevated border border-panel-border font-mono text-xs">
      <span className="text-slate-400">Robot Specs for: {robotId}</span>
    </div>
  );
};
