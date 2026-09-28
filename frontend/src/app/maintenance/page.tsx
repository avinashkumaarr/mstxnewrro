"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Database,
  Radio,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  HardDrive,
  Cloud,
  Layers,
  Search,
} from "lucide-react";

export default function MaintenanceBagfilesPage() {
  const [autoSync, setAutoSync] = useState(true);

  const captures = [
    {
      id: "cap-1",
      filename: "lidar_run_20250514_corridor_nav.mcap",
      format: "MCAP",
      badge: "ZK-PROVED",
      time: "Today, 14:18:02 UTC",
      duration: "04m 32s",
      topics: "6 Topics: /scan, /odom, /tf, /cmd_vel...",
      msgs: "48,200 msgs",
      size: "342.6 MB",
      comp: "ZSTD COMP.",
      status: "SYNCED: CLOUD & MST",
      cid: "QmX9...41aB",
    },
    {
      id: "cap-2",
      filename: "obstacle_avoidance_hil_bench_04.db3",
      format: "SQLITE3 (.db3)",
      badge: "BENCHMARK RUN",
      time: "Today, 11:42:19 UTC",
      duration: "12m 45s",
      topics: "12 Topics: /camera/depth, /lidar_points, /joint_states...",
      msgs: "184,910 msgs",
      size: "1.18 GB",
      comp: "UNCOMPRESSED",
      status: "SYNCING TO SWARM: 64%",
      isSyncing: true,
    },
    {
      id: "cap-3",
      filename: "slam_cartographer_loop_closure_v2.db3",
      format: "SQLITE3 (.db3)",
      badge: "LOOP CLOSURE POSITIVE",
      time: "Yesterday, 22:04:15 UTC",
      duration: "01m 18s",
      topics: "4 Topics: /submap_list, /trajectory_node_list, /tf",
      msgs: "12,400 msgs",
      size: "84.2 MB",
      comp: "LZ4 COMP.",
      status: "SYNCED: S3 VAULT + Pin to MST IPFS",
    },
    {
      id: "cap-4",
      filename: "imu_wheel_odometry_drift_test.bag",
      format: "ROS1 COMPAT (.bag)",
      badge: "STANDARD ROS",
      time: "May 12, 18:31:00 UTC",
      duration: "28m 10s",
      topics: "3 Topics: /imu/data_raw, /wheel_ticks, /odom",
      msgs: "338,400 msgs",
      size: "612.0 MB",
      comp: "STANDARD ROS",
      status: "SYNCED: CLOUD & MST",
      cid: "QmR8...99eF",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Header (Matching Image 4) */}
        <div className="p-6 rounded-xl bg-panel border border-panel-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-tech">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-100 font-mono">
                    Sensor Data & ROS2 Bagfile Captures
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold">
                    V2.4 MCAP READY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct HIL logging from ROS2 Galactic / Iron •{" "}
                  <strong className="text-cyan-tech font-mono">STORAGE: 4.82 GB / 10.0 GB (48% ALLOCATED)</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button className="px-3 py-1.5 rounded bg-slate-900 border border-panel-border hover:border-slate-500 text-slate-300">
                Recording Profiles
              </button>
              <button className="px-3 py-1.5 rounded bg-slate-900 border border-panel-border hover:border-slate-500 text-slate-300">
                Auto-Prune
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs pt-1">
            <button className="px-3 py-1.5 rounded bg-cyan-tech text-black font-bold">
              All Captures (8)
            </button>
            <button className="px-3 py-1.5 rounded bg-panel-elevated border border-panel-border text-slate-300 hover:border-slate-500">
              LiDAR Scans (pcd / .db3)
            </button>
            <button className="px-3 py-1.5 rounded bg-panel-elevated border border-panel-border text-slate-300 hover:border-slate-500">
              IMU & Odometry (4)
            </button>
            <button className="px-3 py-1.5 rounded bg-panel-elevated border border-panel-border text-slate-300 hover:border-slate-500">
              Camera & Point Cloud (3)
            </button>
            <button className="px-3 py-1.5 rounded bg-panel-elevated border border-panel-border text-slate-300 hover:border-slate-500">
              Starred / Benchmarks (2)
            </button>
          </div>

          {/* Storage Meter & Auto-sync */}
          <div className="p-3 rounded-lg bg-[#070a12] border border-panel-border flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-cyan-tech">• Local SSD: 2.14 GB</span>
              <span className="text-blue-400">• Cloud S3: 1.82 GB</span>
              <span className="text-purple-400">• MST IPFS Swarm: 0.86 GB</span>
              <span className="text-slate-400">5.18 GB FREE</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                <span>AUTO-SYNC TO MST SWARM</span>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-tech focus:ring-0"
                />
              </label>

              <button className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-panel-border text-[11px]">
                Export Selected (ZIP)
              </button>
              <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm">
                Sync All Pending (3)
              </button>
            </div>
          </div>

          {/* Captures Table */}
          <div className="space-y-2 pt-2 font-mono text-xs">
            {captures.map((cap) => (
              <div
                key={cap.id}
                className="p-3.5 rounded-lg bg-panel-elevated border border-panel-border hover:border-cyan-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded bg-slate-800 border-slate-700 text-cyan-tech" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-bold">{cap.filename}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-tech border border-panel-border">
                        {cap.format}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                        {cap.badge}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>{cap.time}</span>
                      <span>{cap.duration}</span>
                      <span>{cap.topics}</span>
                      <span className="text-slate-300 font-semibold">{cap.msgs}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="text-[11px]">
                    <span className="text-slate-200 font-bold block">{cap.size}</span>
                    <span className="text-[9px] text-slate-500">{cap.comp}</span>
                  </div>

                  <div className="text-[10px]">
                    <span className={`block font-semibold ${cap.isSyncing ? "text-amber-400" : "text-emerald-400"}`}>
                      {cap.status}
                    </span>
                    {cap.cid && <span className="text-cyan-tech text-[9px]">CID: {cap.cid}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-panel-border text-[11px]">
                      Export
                    </button>
                    <Link
                      href="/simulation?challenge=challenge-07"
                      className="px-3 py-1.5 rounded bg-cyan-tech text-black font-bold text-[11px] flex items-center gap-1 shadow-cyan-glow"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>Replay</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Daemon Footer */}
          <div className="pt-3 border-t border-panel-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="text-cyan-tech flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-tech animate-ping" />
                ACTIVE RECORDER DAEMON: ros2 bag record -a (IDLE)
              </span>
              <span>Buffer: <strong className="text-slate-200">100 MB Ring</strong></span>
              <span>Compression: <strong className="text-slate-200">ZSTD</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Manage Remote S3 / IPFS Endpoints</span>
              <button className="px-4 py-2 rounded bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold text-xs shadow-cyan-glow">
                Record New Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
