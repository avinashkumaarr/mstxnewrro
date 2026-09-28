"use client";

import React from "react";
import { Obstacle as ObstacleType } from "@/types/robot";

export const ObstacleComponent: React.FC<{ obstacle: ObstacleType }> = ({ obstacle }) => {
  return (
    <div className="p-2 rounded bg-slate-900 border border-panel-border text-[10px] font-mono text-slate-400">
      <span>{obstacle.name}</span> [{obstacle.width}m x {obstacle.height}m]
    </div>
  );
};
export default ObstacleComponent;
