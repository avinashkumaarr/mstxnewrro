"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Play,
  RotateCcw,
  ShieldCheck,
  Flame,
  Award,
  Trophy,
  ChevronRight,
  ExternalLink,
  Radar,
  Radio,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { ActivityDetailDrawer } from "@/components/blockchain/ActivityDetailDrawer";
import { ActivityEvent } from "@/types/event";

export default function DashboardOverviewPage() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Welcome Hero Banner (Matching Image 5) */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-panel via-panel-elevated to-[#0d1627] border border-panel-border relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-tech font-bold uppercase tracking-wider">
                  • ROBOTICS & BLOCKCHAIN TRACK
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Ready for Challenge #07: Dynamic Obstacle Avoidance
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                Welcome back, <span className="text-cyan-tech">Souvik</span>
              </h1>

              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Simulated environment ROS2 Foxy cluster synced with MST Testnet block #4,921,803. Your neural path planner is pending validation on Stage 3.
              </p>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/simulation?challenge=challenge-07"
                className="px-5 py-2.5 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-cyan-glow active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Resume Simulation</span>
              </Link>
              <Link
                href="/simulation"
                className="px-4 py-2.5 rounded bg-slate-900 border border-panel-border hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors"
              >
                New Sandbox Lab
              </Link>
              <button className="px-3.5 py-2.5 rounded bg-slate-900 border border-panel-border hover:text-cyan-tech text-xs font-mono text-slate-400 transition-colors flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-tech" />
                <span>Connect Telemetry</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Cards (Matching Image 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Challenges Completed */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">CHALLENGES COMPLETED</span>
              <ShieldCheck className="w-4 h-4 text-cyan-tech" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100">14</span>
              <span className="text-xs font-mono text-slate-500">/ 28</span>
              <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-tech border border-cyan-500/30">
                50% MILESTONE
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-panel-border/50">
              <span className="text-cyan-tech">~ +3 this week</span>
              <span className="text-slate-400">Target: 28</span>
            </div>
          </div>

          {/* Card 2: Learning Streak */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">LEARNING STREAK</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100">12 Days</span>
              <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30 uppercase font-bold">
                ON FIRE
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-panel-border/50">
              <span>Weekly Consistency</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
              </div>
            </div>
          </div>

          {/* Card 3: Verified Credentials */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">VERIFIED CREDENTIALS</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100">3 On-Chain</span>
              <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                • MST v2.4
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-panel-border/50">
              <span>Non-Fungible Soulbound</span>
              <span className="text-emerald-400 font-bold uppercase text-[9px]">IMMUTABLE</span>
            </div>
          </div>

          {/* Card 4: Robotics Mastery */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">ROBOTICS MASTERY</span>
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100">Level 14</span>
              <span className="ml-auto text-[11px] font-mono text-slate-400">3,420 XP</span>
            </div>
            <div className="space-y-1 pt-1 border-t border-panel-border/50">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Progress to Level 15</span>
                <span className="text-purple-300">78%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full w-[78%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Active Workspace Runtime + Skill Mastery Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Workspace Runtime (Left 8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-panel border border-panel-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-tech block">
                  ACTIVE WORKSPACE RUNTIME
                </span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  <span>Autonomous Path Planning: Dynamic A* & Costmaps</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Last simulated 2h ago
              </span>
            </div>

            {/* Split row: Costmap Blueprint + Testbench Validation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Costmap Blueprint Preview */}
              <div className="md:col-span-8 bg-[#070a12] border border-panel-border rounded-lg p-3 relative aspect-video flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                  <span>TARGET TRAJECTORY COSTMAP</span>
                  <span>Grid Res: 0.05m • ROS2 Node #a8</span>
                </div>

                {/* SVG Costmap Simulation illustration */}
                <svg viewBox="0 0 320 180" className="w-full h-full my-auto">
                  {/* Grid */}
                  <pattern id="dashgrid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#162032" strokeWidth="0.8" />
                  </pattern>
                  <rect width="320" height="180" fill="url(#dashgrid)" />

                  {/* Warehouse walls */}
                  <rect x="30" y="30" width="260" height="120" fill="none" stroke="#1e293b" strokeWidth="2" />
                  <rect x="80" y="60" width="50" height="40" fill="#1e293b" stroke="#334155" />
                  <rect x="180" y="70" width="60" height="40" fill="#1e293b" stroke="#334155" />

                  {/* Inflated costmap zones */}
                  <rect x="70" y="50" width="70" height="60" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeDasharray="3 3" />
                  <rect x="170" y="60" width="80" height="60" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeDasharray="3 3" />

                  {/* Trajectory Loop */}
                  <path
                    d="M 50,130 C 50,40 160,40 160,130 C 160,140 270,140 270,50"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="3"
                  />

                  {/* Robot Indicator */}
                  <circle cx="160" cy="130" r="8" fill="#00f0ff" />
                  <circle cx="270" cy="50" r="5" fill="#a855f7" />
                </svg>

                <div className="flex items-center justify-between text-[10px] font-mono z-10">
                  <span className="text-cyan-tech flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech animate-ping" />
                    Global Planner: Active
                  </span>
                  <span className="text-slate-500">A* HEURISTIC: CONVERGED</span>
                </div>
              </div>

              {/* Testbench Validation Card */}
              <div className="md:col-span-4 p-4 rounded-lg bg-panel-elevated border border-panel-border flex flex-col justify-between space-y-3 font-mono">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 text-[10px]">TESTBENCH VALIDATION</span>
                    <span className="text-cyan-tech font-bold text-[10px]">82% COMPLETE</span>
                  </div>
                  <div className="text-xl font-bold text-slate-100">4 / 5</div>

                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">• Map Static Inflate</span>
                      <span className="text-emerald-400 font-bold">PASS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">• A* Heuristic Optimal</span>
                      <span className="text-emerald-400 font-bold">PASS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">• Dynamic Recalculation</span>
                      <span className="text-amber-400 font-bold">RETRY</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href="/simulation?challenge=challenge-07"
                    className="w-full py-2 px-3 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-cyan-glow"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Resume in Robotics Lab</span>
                  </Link>
                  <button className="w-full py-1.5 text-slate-400 hover:text-slate-200 text-[11px] text-center">
                    View Code Diff
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Mastery Radar (Right 4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-panel border border-panel-border space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-tech" />
                <span className="text-xs font-bold text-slate-100 uppercase">Skill Mastery Radar</span>
              </div>
              <span className="text-[10px] text-slate-500">ROS2 ARCH</span>
            </div>

            {/* Radar Diagram */}
            <div className="relative flex items-center justify-center py-2">
              <svg width="180" height="150" viewBox="0 0 180 150">
                {/* Concentric pentagons */}
                <polygon
                  points="90,15 165,55 135,135 45,135 15,55"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <polygon
                  points="90,40 140,65 120,115 60,115 40,65"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                />

                {/* Skill Mastery Polygon */}
                <polygon
                  points="90,20 155,60 125,125 50,118 25,62"
                  fill="rgba(0, 240, 255, 0.15)"
                  stroke="#00f0ff"
                  strokeWidth="1.5"
                />

                <circle cx="90" cy="20" r="3" fill="#00f0ff" />
                <circle cx="155" cy="60" r="3" fill="#00f0ff" />
                <circle cx="125" cy="125" r="3" fill="#00f0ff" />
                <circle cx="50" cy="118" r="3" fill="#00f0ff" />
                <circle cx="25" cy="62" r="3" fill="#00f0ff" />
              </svg>
              <span className="absolute top-1 text-[10px] text-cyan-tech font-bold">
                Kinematic Fit: 84.6%
              </span>
            </div>

            {/* Skill breakdown list */}
            <div className="space-y-2 text-[11px] pt-1 border-t border-panel-border">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Python / ROS2 Scripting</span>
                <span className="text-emerald-400 font-bold">92% (Expert)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Robot Navigation & Odometry</span>
                <span className="text-cyan-tech font-bold">84% (Advanced)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Path Planning (A*, Dijkstra)</span>
                <span className="text-slate-300 font-semibold">76% (Proficient)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Obstacle Avoidance & LiDAR</span>
                <span className="text-amber-400 font-semibold">63% (Intermediate)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recommended Challenges & MST Blockchain Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recommended Challenge (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-panel border border-panel-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-cyan-tech" />
                <span className="text-xs font-bold font-mono text-slate-100 uppercase">
                  Recommended Robotics Challenges
                </span>
              </div>
              <Link href="/challenges" className="text-cyan-tech hover:underline text-xs font-mono flex items-center gap-1">
                Explore All (28) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-panel-elevated border border-panel-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 font-bold">
                    ADVANCED
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">EST. 45 MIN • +350 XP</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">
                  Dynamic Obstacle Avoidance (Lidar-based)
                </h4>
                <p className="text-xs text-slate-400 max-w-xl">
                  Implement real-time 2D planar range scan filtering and dynamic window approach (DWA) for rapid non-holonomic maneuvers.
                </p>
              </div>

              <Link
                href="/simulation?challenge=challenge-07"
                className="px-4 py-2 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 shadow-cyan-glow"
              >
                <span>UNLOCKED</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* MST Blockchain Hub (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-panel border border-panel-border flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-slate-100 uppercase">MST Blockchain Hub</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                • TESTNET
              </span>
            </div>

            <div className="p-3 rounded bg-panel-elevated border border-panel-border space-y-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">CONNECTED OPERATOR</span>
                <span className="text-cyan-tech font-bold">0x8x71C...89A4</span>
              </div>
              <div className="pt-2 border-t border-panel-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">GAS BALANCE</span>
                  <span className="text-slate-200 font-bold">42.85 MST</span>
                </div>
                <Link
                  href="/events"
                  className="px-3 py-1.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors text-[10px]"
                >
                  View Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Detail Drawer */}
        <ActivityDetailDrawer
          event={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      </div>
    </DashboardLayout>
  );
}
