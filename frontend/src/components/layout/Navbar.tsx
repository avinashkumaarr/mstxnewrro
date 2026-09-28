"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, Shield, Activity, Cpu } from "lucide-react";

interface NavbarProps {
  currentRoute?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute }) => {
  return (
    <header className="h-14 border-b border-panel-border bg-panel/80 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left side info */}
      <div className="flex items-center gap-3">
        {/* Version Badge */}
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400">
          v1.4.2-preview
        </span>

        {/* Network status */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>MST Testnet v2.4 (Chain ID: 8841)</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search topics, nodes, bagfiles, hashes..."
          className="w-full bg-[#0a0e1a] border border-panel-border text-xs rounded-md pl-9 pr-8 py-1.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-tech transition-colors font-mono"
        />
        <kbd className="absolute right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          ⌘K
        </kbd>
      </div>

      {/* Right side stats & Profile */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* FPS & Latency */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-panel-border text-slate-300 font-mono text-[11px]">
          <span className="text-cyan-tech flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech"></span>
            8ms
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">60 FPS</span>
        </div>

        {/* MST Token Balance */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono text-[11px]">
          <span className="text-purple-400">⬡</span>
          <span className="font-semibold text-slate-200">42.85</span>
          <span className="text-purple-400 text-[10px]">MST</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
          title="Cluster Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-tech rounded-full animate-ping" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-tech rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-panel-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-black border border-cyan-300/40 shadow-sm">
            SM
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200 leading-tight">Souvik M.</span>
            <span className="text-[10px] font-mono text-cyan-tech leading-tight">Level 14 Robotics Dev</span>
          </div>
        </div>
      </div>
    </header>
  );
};
