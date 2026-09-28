"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Award, Trophy, ShieldCheck, CheckCircle2, Play, ExternalLink, Zap } from "lucide-react";
import { BlockchainActivityCard } from "@/components/blockchain/BlockchainActivityCard";
import { ActivityDetailDrawer } from "@/components/blockchain/ActivityDetailDrawer";
import { ActivityEvent } from "@/types/event";

export default function EvaluationPage() {
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  const evaluationRuns = [
    {
      id: "eval-01",
      challengeTitle: "Challenge #07: Dynamic Obstacle Avoidance & Waypoint Navigation",
      score: 99.4,
      status: "PASSED",
      waypoints: "4/4",
      collisions: 0,
      efficiency: "92%",
      time: "21.4s",
      proof: "0x7f9a882e9d246c10b7f832a89cb1f58921df4a889b71a0429f521b34882131b8",
      block: 4921803,
      date: "Today, 20:42 UTC",
    },
    {
      id: "eval-02",
      challengeTitle: "Challenge #08: Autonomous Path Planning (Dynamic A*)",
      score: 82.0,
      status: "PASSED",
      waypoints: "3/3",
      collisions: 0,
      efficiency: "88%",
      time: "28.1s",
      proof: "0x3a921f0b72189cd188402f1a4e5122189d21c900e5271829019b84172a1531b8",
      block: 4921750,
      date: "Yesterday, 18:15 UTC",
    },
    {
      id: "eval-03",
      challengeTitle: "Challenge #01: Differential Drive Kinematics",
      score: 100.0,
      status: "PASSED",
      waypoints: "2/2",
      collisions: 0,
      efficiency: "97%",
      time: "14.2s",
      proof: "0x89d21c900e5271829019b84172a1531b87f9a882e9d246c10b7f832a89cb1f58",
      block: 4921610,
      date: "Sep 26, 14:20 UTC",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
              <span>EVALUATION ENGINE</span>
              <span className="text-slate-600">/</span>
              <span>KINEMATICS TESTBENCH</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">VERIFIED SCORES</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              Robotics Evaluation & Attestation
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic mathematical scoring of autonomous navigation paths, waypoint arrival precision, collision penalties, and ZK-proof generation.
            </p>
          </div>

          <Link
            href="/simulation?challenge=challenge-07"
            className="px-4 py-2 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-cyan-glow"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Launch Evaluation Run</span>
          </Link>
        </div>

        {/* Evaluation Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2 font-mono">
            <span className="text-slate-500 text-[10px] uppercase">AVERAGE PASS SCORE</span>
            <div className="text-2xl font-bold text-emerald-400">93.8%</div>
            <p className="text-[11px] text-slate-400">Calculated across 14 finished challenge tracks</p>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2 font-mono">
            <span className="text-slate-500 text-[10px] uppercase">ZERO-COLLISION RUNS</span>
            <div className="text-2xl font-bold text-cyan-tech">100%</div>
            <p className="text-[11px] text-slate-400">Strict adherence to 0.35m safety corridor</p>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-2 font-mono">
            <span className="text-slate-500 text-[10px] uppercase">ON-CHAIN PROOFS MINTED</span>
            <div className="text-2xl font-bold text-purple-400">14 / 14</div>
            <p className="text-[11px] text-slate-400">Cryptographically signed on MST Testnet</p>
          </div>
        </div>

        {/* Graded Runs List */}
        <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-tech" />
              <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
                Recent Graded Evaluation Runs
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">MST CHAIN ID: 8841</span>
          </div>

          <div className="space-y-3">
            {evaluationRuns.map((run) => (
              <div
                key={run.id}
                className="p-4 rounded-lg bg-panel-elevated border border-panel-border hover:border-cyan-500/40 transition-all font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-100 font-bold">{run.challengeTitle}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                      {run.status} • {run.score}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>Waypoints: <strong className="text-slate-200">{run.waypoints}</strong></span>
                    <span>Collisions: <strong className="text-emerald-400">{run.collisions}</strong></span>
                    <span>Efficiency: <strong className="text-cyan-tech">{run.efficiency}</strong></span>
                    <span>Time: <strong className="text-slate-200">{run.time}</strong></span>
                    <span>Block: <strong className="text-slate-200">#{run.block}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setSelectedEvent({
                        id: run.id,
                        type: "CHALLENGE_PASSED",
                        challengeId: "challenge-07",
                        challengeTitle: run.challengeTitle,
                        timestamp: run.date,
                        eventHash: run.proof,
                        transactionHash: run.proof,
                        blockNumber: run.block,
                        network: "MST TESTNET (Chain ID: 8841)",
                        status: "confirmed",
                        details: {
                          score: run.score,
                          executionTime: parseFloat(run.time),
                          collisions: run.collisions,
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors flex items-center gap-1.5 text-[11px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View Attestation</span>
                  </button>
                  <Link
                    href="/simulation?challenge=challenge-07"
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-panel-border transition-colors text-[11px]"
                  >
                    Replay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer */}
        <ActivityDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </DashboardLayout>
  );
}
