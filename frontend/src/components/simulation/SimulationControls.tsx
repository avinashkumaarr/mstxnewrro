"use client";

import React, { useState } from "react";
import { SimulationStatus } from "@/types/simulation";
import { TelemetryData } from "@/types/telemetry";
import { Play, Square, RotateCcw, Save, ShieldCheck, ChevronDown, Check } from "lucide-react";

interface SimulationControlsProps {
  status: SimulationStatus;
  speed: number;
  telemetry: TelemetryData;
  challengeTitle: string;
  challengeNumber: string;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSave: () => void;
  onSubmitAttestation: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  status,
  speed,
  telemetry,
  challengeTitle,
  challengeNumber,
  onRun,
  onStop,
  onReset,
  onSpeedChange,
  onSave,
  onSubmitAttestation,
}) => {
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "RUNNING":
        return (
          <span className="flex items-center gap-1.5 text-cyan-tech font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-tech animate-ping" />
            SIMULATION RUNNING
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            SIMULATION COMPLETED - GOAL REACHED
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            SIMULATION FAILED - BREACH DETECTED
          </span>
        );
      case "PAUSED":
        return (
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            SIMULATION PAUSED
          </span>
        );
      case "IDLE":
      default:
        return (
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            SIMULATION IDLE - WAITING FOR RUN
          </span>
        );
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
  };

  return (
    <div className="bg-panel border-b border-panel-border select-none">
      {/* Top Action Row */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Mission breadcrumb & Status */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-tech font-bold text-[10px] tracking-wider">
            MISSION CORE
          </span>
          <span className="text-slate-200 font-medium hidden sm:inline">
            Challenge #{challengeNumber}: {challengeTitle}
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-[11px] font-mono">{getStatusBadge()}</span>
        </div>

        {/* Buttons Group */}
        <div className="flex items-center gap-2">
          {/* Run Code */}
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs font-mono transition-all shadow-cyan-glow active:scale-95"
            title="Execute Python Kinematics (F5)"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Run Code (F5)</span>
          </button>

          {/* Stop */}
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-panel-border hover:border-red-500/50 hover:text-red-400 text-slate-300 text-xs font-mono transition-all active:scale-95"
            title="Halt Robot Motion (Shift+F5)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-panel-border hover:border-slate-500 text-slate-300 text-xs font-mono transition-all active:scale-95"
            title="Reset Simulation Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sim</span>
          </button>

          {/* Speed Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-panel-border text-xs font-mono text-slate-300 hover:border-slate-600 transition-colors"
            >
              <span>SPEED {speed.toFixed(1)}x</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {speedDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 w-24 bg-panel-elevated border border-panel-border rounded shadow-xl py-1 z-30 font-mono text-xs">
                {[0.5, 1.0, 2.0, 4.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onSpeedChange(s);
                      setSpeedDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1 hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      speed === s ? "text-cyan-tech font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>{s.toFixed(1)}x</span>
                    {speed === s && <Check className="w-3 h-3 text-cyan-tech" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border border-panel-border hover:border-slate-600 text-slate-300 text-xs font-mono transition-colors"
            title="Save script to local buffer"
          >
            {savedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedNotice ? "Saved" : "Save"}</span>
          </button>

          {/* Submit for On-Chain Evaluation */}
          <button
            onClick={onSubmitAttestation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-950 border border-purple-500/60 hover:bg-purple-900 text-purple-200 font-semibold text-xs font-mono transition-all shadow-purple-glow active:scale-95"
            title="Submit simulation trajectory to MST Testnet verifier"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Submit for On-Chain Evaluation</span>
          </button>
        </div>
      </div>

      {/* Telemetry Bar Strip */}
      <div className="px-4 py-1.5 bg-[#070a12] border-t border-panel-border flex flex-wrap items-center justify-between gap-y-1 gap-x-4 text-[10px] font-mono text-slate-400">
        {/* Pose */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">POSE:</span>
          <span>X: <strong className="text-cyan-tech">{String(telemetry.pose.x.toFixed(2)).padStart(5, "0")}m</strong></span>
          <span className="text-slate-700">|</span>
          <span>Y: <strong className="text-cyan-tech">{String(telemetry.pose.y.toFixed(2)).padStart(5, "0")}m</strong></span>
          <span className="text-slate-700">|</span>
          <span>θ: <strong className="text-cyan-tech">{telemetry.pose.theta.toFixed(1)}°</strong></span>
        </div>

        {/* Velocity */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">VEL:</span>
          <span>v: <strong className="text-slate-200">{telemetry.velocity.linear.toFixed(2)} m/s</strong></span>
          <span className="text-slate-700">|</span>
          <span>ω: <strong className="text-slate-200">{telemetry.velocity.angular.toFixed(2)} rad/s</strong></span>
        </div>

        {/* Goal Dist */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold">GOAL DIST:</span>
          <strong className="text-slate-200">{telemetry.motion.goalDistance.toFixed(2)}m</strong>
        </div>

        {/* Collisions */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold">COLLISIONS:</span>
          <strong className={telemetry.motion.collisions > 0 ? "text-red-400 font-extrabold" : "text-slate-200"}>
            {telemetry.motion.collisions}
          </strong>
        </div>

        {/* LiDAR spec */}
        <div className="hidden lg:flex items-center gap-1.5 text-cyan-tech">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
          <span>LIDAR: 64 rays @ 10Hz</span>
        </div>

        {/* Simulation Time */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold">SIM TIME:</span>
          <strong className="text-slate-200">{formatSeconds(telemetry.motion.executionTime)}</strong>
        </div>

        {/* FPS */}
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span>FPS:</span>
          <strong>{telemetry.system.fps.toFixed(1)}</strong>
        </div>
      </div>
    </div>
  );
};
