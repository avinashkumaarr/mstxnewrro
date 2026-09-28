"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GraduationCap, Users, ShieldCheck, Award, CheckCircle2, Search } from "lucide-react";

export default function InstructorPortalPage() {
  const students = [
    { name: "Souvik M.", wallet: "0x8x71C...89A4", challengesCleared: 14, avgScore: "94.2%", level: "Level 14", status: "Active" },
    { name: "Alex K.", wallet: "0x39F2A...18C0", challengesCleared: 11, avgScore: "91.0%", level: "Level 11", status: "Active" },
    { name: "Elena V.", wallet: "0x7812D...44E9", challengesCleared: 16, avgScore: "96.5%", level: "Level 16", status: "Active" },
    { name: "David T.", wallet: "0x9910C...55B2", challengesCleared: 8, avgScore: "87.3%", level: "Level 8", status: "Pending Eval" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        <div className="border-b border-panel-border pb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
            <span>MANAGEMENT</span>
            <span className="text-slate-600">/</span>
            <span>INSTRUCTOR PORTAL</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">COHORT PROGRESS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Robotics Cohort & Credential Verification
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time student simulation benchmarks, review kinematic evaluation telemetry, and sign off on MST soulbound badges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">ENROLLED ENGINEERS</span>
            <div className="text-2xl font-bold text-slate-100">48 Students</div>
          </div>
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">SIMULATIONS RUN TODAY</span>
            <div className="text-2xl font-bold text-cyan-tech">342 Runs</div>
          </div>
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">PASS RATE</span>
            <div className="text-2xl font-bold text-emerald-400">89.4%</div>
          </div>
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">PENDING CERTIFICATES</span>
            <div className="text-2xl font-bold text-purple-400">7 Mintable</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Student Robotics Benchmarks
            </h2>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full bg-[#070a12] border border-panel-border rounded text-xs pl-8 pr-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-tech"
              />
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {students.map((st) => (
              <div
                key={st.wallet}
                className="p-3.5 rounded-lg bg-panel-elevated border border-panel-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-100 font-bold">{st.name}</span>
                    <span className="text-[10px] text-cyan-tech">{st.level}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {st.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Wallet: {st.wallet}</div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 text-[10px] block">CLEARED</span>
                    <span className="text-slate-200 font-bold">{st.challengesCleared} / 28</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">AVG SCORE</span>
                    <span className="text-emerald-400 font-bold">{st.avgScore}</span>
                  </div>
                  <button className="px-3 py-1.5 rounded bg-cyan-tech text-black font-bold text-[11px]">
                    Inspect Telemetry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
