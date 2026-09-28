"use client";

import React from "react";
import { RobotState } from "@/types/robot";

export const RobotModel: React.FC<{ robot: RobotState }> = ({ robot }) => {
  return (
    <div className="p-2 rounded bg-slate-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-tech">
      AGV Pose: ({robot.x.toFixed(2)}, {robot.y.toFixed(2)}) θ={(robot.theta * 180 / Math.PI).toFixed(1)}°
    </div>
  );
};
export default RobotModel;
