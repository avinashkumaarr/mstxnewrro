"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Trophy,
  Award,
  Sparkles,
  Layers,
  FileCheck,
  Blocks,
  GraduationCap,
  Hexagon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: "cyan" | "green" | "purple";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "CORE STATION",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Robotics Lab", href: "/simulation", icon: Cpu, badge: "LIVE", badgeColor: "cyan" },
      { name: "Challenges", href: "/challenges", icon: Trophy },
      { name: "Evaluation", href: "/evaluation", icon: Award },
    ],
  },
  {
    title: "AUTONOMOUS & WEB3",
    items: [
      { name: "AI Robotics Tutor", href: "/tutor", icon: Sparkles },
      { name: "Activity Ledger", href: "/events", icon: Layers },
      { name: "Certificates", href: "/certificates", icon: Award },
      { name: "Verification", href: "/verify", icon: FileCheck },
      { name: "MST Blockchain", href: "/blockchain", icon: Blocks },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Instructor Portal", href: "/instructor", icon: GraduationCap },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-panel border-r border-panel-border flex flex-col h-screen select-none shrink-0 z-40">
      {/* Brand Header */}
      <div className="p-4 border-b border-panel-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-cyan-tech/10 border border-cyan-tech/30 flex items-center justify-center text-cyan-tech group-hover:border-cyan-tech transition-colors shadow-cyan-glow">
            <Hexagon className="w-5 h-5 fill-cyan-tech/20 text-cyan-tech" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-100 tracking-tight">RoboLab</span>
              <span className="font-extrabold text-sm text-cyan-tech tracking-wider">CHAIN</span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
              Autonomous Node OS
            </div>
          </div>
        </Link>

        {/* Runtime Badge */}
        <div className="mt-3.5 px-2.5 py-1 rounded bg-[#0a0e1a] border border-panel-border flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 text-[10px]">WORKSPACE RUNTIME</span>
          <span className="text-cyan-tech font-semibold text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            ROS2 FOXY
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            <div className="mt-1.5 space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-cyan-950/40 text-cyan-tech border border-cyan-500/30 font-semibold shadow-cyan-glow"
                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-cyan-tech" : "text-slate-400"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          item.badgeColor === "cyan"
                            ? "bg-cyan-500/20 text-cyan-tech border border-cyan-500/40 animate-pulse"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Cluster Health Widget */}
      <div className="p-4 border-t border-panel-border bg-[#0a0e1a]/80">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <span className="text-slate-400 text-[10px]">CLUSTER HEALTH</span>
          <span className="text-cyan-tech text-[10px] font-bold">SYNCHRONIZED</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full w-full" />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 text-[10px]">Active Daemons</span>
          <span className="text-slate-200 text-[11px] font-bold">14/14</span>
        </div>
      </div>
    </aside>
  );
};
