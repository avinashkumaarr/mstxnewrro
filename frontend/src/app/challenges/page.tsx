"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { challengeService } from "@/services/challengeService";
import { Challenge } from "@/types/challenge";
import {
  Trophy,
  Play,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    challengeService.getChallenges().then(setChallenges);
  }, []);

  const tracks = [
    { name: "All Tracks", key: "All", count: 42 },
    { name: "Navigation & Odometry", key: "Navigation & Odometry", count: 10 },
    { name: "Obstacle Avoidance", key: "Obstacle Avoidance", count: 8 },
    { name: "Path Planning", key: "Path Planning", count: 9 },
    { name: "Python ROS2", key: "Python ROS2", count: 7 },
    { name: "SLAM & Mapping", key: "SLAM & Mapping", count: 8 },
  ];

  const filteredChallenges = challenges.filter((c) => {
    const matchTrack = selectedTrack === "All" || c.track === selectedTrack;
    const matchDiff = selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.track.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTrack && matchDiff && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
              <span>WORKSPACE</span>
              <span className="text-slate-600">/</span>
              <span>CURRICULUM REGISTRY</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">ROS2 HUMBLE • GALACTIC SYNC</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              Robotics Engineering Challenges
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete graded simulation tracks, master autonomous robotics algorithms, and unlock blockchain-verified MST certifications.
            </p>
          </div>

          {/* Quick Stats Pill Group */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border text-center">
              <span className="text-[10px] text-slate-500 block uppercase">CATALOG</span>
              <strong className="text-slate-200">42</strong> <span className="text-[10px] text-slate-400">Challenges</span>
            </div>
            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border text-center">
              <span className="text-[10px] text-slate-500 block uppercase">TRACKS</span>
              <strong className="text-cyan-tech">6</strong> <span className="text-[10px] text-slate-400">Tracks</span>
            </div>
            <div className="p-2.5 rounded bg-panel-elevated border border-panel-border text-center">
              <span className="text-[10px] text-slate-500 block uppercase">CLEARED</span>
              <strong className="text-emerald-400">14</strong> <span className="text-[10px] text-slate-400">Finished</span>
            </div>
            <div className="p-2.5 rounded bg-purple-950/40 border border-purple-500/40 text-center">
              <span className="text-[10px] text-purple-400 block uppercase">MST CLAIMS</span>
              <strong className="text-purple-300">3</strong> <span className="text-[10px] text-purple-400">Mintable</span>
            </div>
          </div>
        </div>

        {/* Hero Featured Challenge Card (Matching Image 3) */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-panel via-panel-elevated to-[#0b1424] border border-panel-border relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-cyan-tech/60 tracking-widest uppercase">
            GAZEBO PHYSICS ENGINE INTERFACE • ARENA_ID: #489-RVO
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left description */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold uppercase">
                  FEATURED TRACK
                </span>
                <span className="text-[10px] font-mono text-slate-400">ADVANCED • 45 MIN</span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono">
                  350 XP + MST Advanced Nav Badge
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-100">
                Dynamic Obstacle Avoidance & Velocity Obstacles (VO)
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Implement a reactive obstacle avoidance algorithm using Reciprocal Velocity Obstacles (RVO) in dynamic multi-robot warehouse environments. Formulate non-linear motion vectors to avoid dynamic collisions in ROS2 Foxy nodes with real-time laser scan topics.
              </p>

              {/* Spec parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                <div className="p-2 rounded bg-[#070a12] border border-panel-border">
                  <span className="text-[9px] text-slate-500 block">KINEMATICS</span>
                  <span className="text-slate-200">Non-Holonomic RVO</span>
                </div>
                <div className="p-2 rounded bg-[#070a12] border border-panel-border">
                  <span className="text-[9px] text-slate-500 block">SIMULATION LATENCY</span>
                  <span className="text-cyan-tech">~12ms @ 50Hz</span>
                </div>
                <div className="p-2 rounded bg-[#070a12] border border-panel-border">
                  <span className="text-[9px] text-slate-500 block">CONSENSUS ATTEST</span>
                  <span className="text-purple-300">MST-Proof ZK-7</span>
                </div>
                <div className="p-2 rounded bg-[#070a12] border border-panel-border">
                  <span className="text-[9px] text-slate-500 block">SAFETY TOLERANCE</span>
                  <span className="text-emerald-400">0.15m Buffer</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/simulation?challenge=challenge-07"
                  className="px-5 py-2.5 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-cyan-glow"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Challenge</span>
                </Link>
                <button className="px-4 py-2.5 rounded bg-slate-900 border border-panel-border hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors">
                  View Syllabus & Prerequisites
                </button>
                <span className="text-[11px] font-mono text-slate-500 ml-2">
                  189 Engineers Completed
                </span>
              </div>
            </div>

            {/* Right side preview radar vector graphic */}
            <div className="lg:col-span-5 flex items-center justify-center p-4">
              <div className="relative w-full max-w-sm aspect-video bg-[#070a12] border border-panel-border rounded-lg p-4 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 300 180" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#1b253b" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="150" y1="0" x2="150" y2="180" stroke="#1b253b" strokeWidth="0.8" strokeDasharray="3 3" />

                  {/* Planned trajectory curve */}
                  <path
                    d="M 30,120 Q 90,80 150,110 T 260,110"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                  />

                  {/* FOV Cone */}
                  <path
                    d="M 150,110 L 250,75 L 250,130 Z"
                    fill="rgba(0, 240, 255, 0.08)"
                    stroke="rgba(0, 240, 255, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {/* Robot AGV */}
                  <circle cx="150" cy="110" r="7" fill="#00f0ff" />
                  <circle cx="150" cy="110" r="14" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Velocity vector */}
                  <line x1="150" y1="110" x2="240" y2="85" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="240" cy="85" r="5" fill="#38bdf8" />

                  {/* Dynamic hazard vector */}
                  <line x1="200" y1="150" x2="160" y2="130" stroke="#f43f5e" strokeWidth="1.5" />
                  <circle cx="200" cy="150" r="5" fill="#f43f5e" />

                  {/* Goal label */}
                  <circle cx="260" cy="110" r="4" fill="#a855f7" />
                  <text x="250" y="130" fill="#a855f7" fontSize="8" fontFamily="monospace">
                    GOAL_POS
                  </text>
                </svg>

                <div className="absolute bottom-2 left-3 text-[8px] font-mono text-slate-500">
                  RAY_CAST: 360° LIDAR
                </div>
                <div className="absolute bottom-2 right-3 text-[8px] font-mono text-cyan-tech font-bold">
                  RECIPROCAL_VEL_ACTIVE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filtering Bar */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges by algorithm (e.g. A*, SLAM, PID, Dijkstra, Costmaps)..."
              className="w-full bg-panel border border-panel-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-tech transition-colors"
            />
          </div>

          {/* Track Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase mr-1">TRACK:</span>
            {tracks.map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedTrack(t.key)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedTrack === t.key
                    ? "bg-cyan-tech text-black font-bold shadow-cyan-glow"
                    : "bg-panel border border-panel-border text-slate-300 hover:border-slate-600"
                }`}
              >
                <span>{t.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    selectedTrack === t.key ? "bg-black/20 text-black" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Difficulty Filters */}
          <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase">DIFFICULTY:</span>
              {["All", "Beginner", "Intermediate", "Advanced"].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`hover:text-cyan-tech transition-colors ${
                    selectedDifficulty === d ? "text-cyan-tech font-bold underline" : ""
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button className="text-cyan-tech font-bold">All</button>
              <button className="hover:text-slate-200">In Progress</button>
              <button className="hover:text-slate-200">Completed</button>
              <button className="hover:text-slate-200">Locked</button>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredChallenges.map((ch) => (
            <div
              key={ch.id}
              className="p-5 rounded-lg bg-panel border border-panel-border hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-cyan-glow"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-panel-border text-cyan-tech font-bold">
                    #{ch.number}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        ch.difficulty === "Beginner"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          : ch.difficulty === "Intermediate"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                          : "bg-red-950/60 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded">
                      +{ch.xp} XP
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-tech transition-colors">
                  {ch.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ch.objective}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-panel-border/70 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ch.estimatedTime}</span>
                </div>

                <Link
                  href={`/simulation?challenge=${ch.id}`}
                  className="px-3.5 py-1.5 rounded bg-cyan-tech/10 border border-cyan-tech/40 text-cyan-tech hover:bg-cyan-tech hover:text-black font-semibold transition-all flex items-center gap-1 text-[11px]"
                >
                  <span>Start Challenge</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
