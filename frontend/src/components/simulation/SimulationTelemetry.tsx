"use client";

import React from "react";
import { TelemetryData } from "@/types/telemetry";

export const SimulationTelemetry: React.FC<{ telemetry: TelemetryData }> = ({ telemetry }) => {
  return (
    <div className="p-3 rounded-lg bg-panel-elevated border border-panel-border font-mono text-[11px] grid grid-cols-2 gap-2 text-slate-300">
      <div>Pose: ({telemetry.pose.x.toFixed(2)}, {telemetry.pose.y.toFixed(2)})</div>
      <div>Heading: {telemetry.pose.theta.toFixed(1)}°</div>
      <div>Linear Vel: {telemetry.velocity.linear.toFixed(2)} m/s</div>
      <div>Angular Vel: {telemetry.velocity.angular.toFixed(2)} rad/s</div>
    </div>
  );
};
export default SimulationTelemetry;
