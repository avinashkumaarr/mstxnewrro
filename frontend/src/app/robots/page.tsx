"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Cpu, Radio, Play, ShieldCheck, ChevronRight } from "lucide-react";

export default function RobotsFleetPage() {
  const robots = [
    {
      id: "agv-01",
      name: "NEWRRO AGV-01",
      type: "Differential Drive Kinematic Mobile Robot",
      status: "ACTIVE • ROS2 RUNNING",
      firmware: "ROS2 Foxy / Micro-ROS",
      lidar: "64-channel 360° LiDAR @ 10Hz",
      maxSpeed: "1.2 m/s",
      currentTrack: "Warehouse Grid Alpha v2.1",
    },
    {
      id: "agv-02",
      name: "NEWRRO OMNI-02",
      type: "Mecanum Holonomic Vector Platform",
      status: "STANDBY • CALIBRATED",
      firmware: "ROS2 Humble",
      lidar: "128-channel 3D Solid State LiDAR",
      maxSpeed: "2.0 m/s",
      currentTrack: "Warehouse Grid Beta v1.8",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        <div className="border-b border-panel-border pb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
            <span>FLEET REGISTRY</span>
            <span className="text-slate-600">/</span>
            <span>KINEMATIC MODELS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Robot Models & Kinematic Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configured simulation agents, sensor suites, wheel odometry specs, and on-chain identity records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {robots.map((r) => (
            <div key={r.id} className="p-6 rounded-xl bg-panel border border-panel-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-tech">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">{r.name}</h2>
                    <span className="text-[10px] text-cyan-tech font-bold">{r.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300 pt-2 border-t border-panel-border">
                <div className="flex justify-between">
                  <span className="text-slate-500">TYPE</span>
                  <span>{r.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FIRMWARE</span>
                  <span>{r.firmware}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SENSORS</span>
                  <span>{r.lidar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MAX SPEED</span>
                  <span>{r.maxSpeed}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-panel-border flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Environment: {r.currentTrack}</span>
                <Link
                  href="/simulation?challenge=challenge-07"
                  className="px-3.5 py-1.5 rounded bg-cyan-tech text-black font-bold text-xs flex items-center gap-1 shadow-cyan-glow"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Launch in Lab</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
