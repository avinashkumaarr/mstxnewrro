"use client";

import React from "react";

export const Warehouse: React.FC<{ width: number; height: number; preset: string }> = ({
  width,
  height,
  preset,
}) => {
  return (
    <div className="p-2 rounded bg-slate-900 border border-panel-border text-[10px] font-mono text-slate-400">
      Warehouse: {preset} ({width}m x {height}m)
    </div>
  );
};
export default Warehouse;
