"use client";

import React from "react";
import { LidarScan } from "@/types/robot";
import { Radar } from "lucide-react";

interface LiDARVisualizationProps {
  lidar: LidarScan;
}

export const LiDARVisualization: React.FC<LiDARVisualizationProps> = ({ lidar }) => {
  const maxRange = 12.0;

  // Normalize distances [0, 1] relative to center
  const normF = Math.min(1, Math.max(0.1, lidar.frontDistance / maxRange));
  const normL = Math.min(1, Math.max(0.1, lidar.leftDistance / maxRange));
  const normR = Math.min(1, Math.max(0.1, lidar.rightDistance / maxRange));
  const normRear = Math.min(1, Math.max(0.1, lidar.rearDistance / maxRange));

  const size = 160;
  const center = size / 2;
  const radius = 55;

  // Radar polygon points (0, -r) is front (upwards)
  const pFront = { x: center, y: center - normF * radius };
  const pRight = { x: center + normR * radius, y: center };
  const pRear = { x: center, y: center + normRear * radius };
  const pLeft = { x: center - normL * radius, y: center };

  const polygonPath = `${pFront.x},${pFront.y} ${pRight.x},${pRight.y} ${pRear.x},${pRear.y} ${pLeft.x},${pLeft.y}`;

  return (
    <div className="p-3.5 rounded-lg bg-panel-elevated border border-panel-border select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radar className="w-3.5 h-3.5 text-cyan-tech" />
          <span className="text-xs font-bold font-mono text-slate-200 tracking-wide">
            LiDAR Telemetry
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-cyan-tech animate-ping" />
      </div>

      {/* Radar Canvas / SVG Visualizer */}
      <div className="relative flex items-center justify-center my-1">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric reference rings */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.66}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.33}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Crosshairs */}
          <line
            x1={center}
            y1={center - radius - 8}
            x2={center}
            y2={center + radius + 8}
            stroke="#1e293b"
            strokeWidth="1"
          />
          <line
            x1={center - radius - 8}
            y1={center}
            x2={center + radius + 8}
            y2={center}
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Dynamic Radar Detection Polygon */}
          <polygon
            points={polygonPath}
            fill="rgba(0, 240, 255, 0.12)"
            stroke="#00f0ff"
            strokeWidth="1.5"
            className="transition-all duration-150"
          />

          {/* Dynamic Radar Sweep line */}
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - radius}
            stroke="rgba(0, 240, 255, 0.4)"
            strokeWidth="1.5"
            className="animate-radar"
          />

          {/* Vertex point handles */}
          <circle cx={pFront.x} cy={pFront.y} r="3" fill="#00f0ff" />
          <circle cx={pRight.x} cy={pRight.y} r="3" fill="#00f0ff" />
          <circle cx={pRear.x} cy={pRear.y} r="3" fill="#00f0ff" />
          <circle cx={pLeft.x} cy={pLeft.y} r="3" fill="#00f0ff" />

          {/* Center Origin Dot */}
          <circle cx={center} cy={center} r="2.5" fill="#38bdf8" />
        </svg>

        {/* Cardinal Distance Badges */}
        <span className="absolute top-1 text-[10px] font-mono text-cyan-tech font-bold">
          F: {lidar.frontDistance.toFixed(1)}m
        </span>
        <span className="absolute bottom-1 text-[10px] font-mono text-slate-400">
          R: {lidar.rearDistance.toFixed(1)}m
        </span>
        <span className="absolute left-1 text-[10px] font-mono text-slate-400">
          L: {lidar.leftDistance.toFixed(1)}m
        </span>
        <span className="absolute right-1 text-[10px] font-mono text-slate-400">
          R: {lidar.rightDistance.toFixed(1)}m
        </span>
      </div>

      {/* Subtitle specifications */}
      <div className="mt-3 pt-2.5 border-t border-panel-border grid grid-cols-2 text-[10px] font-mono text-slate-400">
        <div>
          <span className="text-slate-500 block">SCAN RANGE</span>
          <span className="text-slate-300">0.10m - 12.0m</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">FOV SECTOR</span>
          <span className="text-cyan-tech">360° Omnidir</span>
        </div>
      </div>
    </div>
  );
};
