"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Award, ShieldCheck, ExternalLink, Download } from "lucide-react";

export default function CertificatesPage() {
  const credentials = [
    {
      id: "cred-01",
      title: "MST Certified Autonomous Robotics Developer - Level 1",
      issuedTo: "Souvik M. (0x8x71C...89A4)",
      date: "September 2026",
      tokenType: "Soulbound Token (ERC-5192)",
      tokenId: "#8412",
      badgeColor: "from-cyan-500 to-blue-600",
      skills: ["Differential Drive", "ROS2 rclpy", "Obstacle Avoidance", "LiDAR Raycasting"],
      proof: "0x7f9a882e9d246c10b7f832a89cb1f58921df4a889b71a0429f521b34882131b8",
    },
    {
      id: "cred-02",
      title: "Advanced Velocity Obstacle & RVO Specialist",
      issuedTo: "Souvik M. (0x8x71C...89A4)",
      date: "September 2026",
      tokenType: "Soulbound Token (ERC-5192)",
      tokenId: "#8490",
      badgeColor: "from-purple-500 to-indigo-600",
      skills: ["RVO Algorithms", "Dynamic Costmaps", "Non-Holonomic Maneuvers"],
      proof: "0x3a921f0b72189cd188402f1a4e5122189d21c900e5271829019b84172a1531b8",
    },
    {
      id: "cred-03",
      title: "ROS2 Galactic Bagfile & HIL Telemetry Master",
      issuedTo: "Souvik M. (0x8x71C...89A4)",
      date: "August 2026",
      tokenType: "Soulbound Token (ERC-5192)",
      tokenId: "#8104",
      badgeColor: "from-emerald-500 to-teal-600",
      skills: ["MCAP Recording", "Swarm Sync", "Deterministic Replay"],
      proof: "0x89d21c900e5271829019b84172a1531b87f9a882e9d246c10b7f832a89cb1f58",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        <div className="border-b border-panel-border pb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400">
            <span>SOULBOUND CREDENTIALS</span>
            <span className="text-slate-600">/</span>
            <span>MST TESTNET</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">NON-FUNGIBLE ATTESTATIONS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Verified Robotics Certificates & Badges
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-proof, non-transferable on-chain skill tokens minted on the MST Blockchain upon successful evaluation pass.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="p-6 rounded-xl bg-panel border border-panel-border hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group hover:shadow-cyan-glow"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cred.badgeColor} flex items-center justify-center text-white shadow-lg`}>
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-cyan-tech font-bold uppercase block">
                    {cred.tokenType} • {cred.tokenId}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-tech transition-colors mt-0.5">
                    {cred.title}
                  </h3>
                </div>

                <div className="text-xs font-mono text-slate-400 space-y-1">
                  <div>Holder: <strong className="text-slate-200">{cred.issuedTo}</strong></div>
                  <div>Issued: <strong className="text-slate-200">{cred.date}</strong></div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cred.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-panel-border text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-panel-border flex items-center justify-between font-mono text-xs">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  IMMUTABLE
                </span>
                <button className="text-cyan-tech hover:underline text-xs flex items-center gap-1">
                  <span>View Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
