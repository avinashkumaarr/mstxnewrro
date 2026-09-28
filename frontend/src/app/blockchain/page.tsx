"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { blockchainService } from "@/services/blockchainService";
import { BlockchainStatus, ActivityEvent } from "@/types/event";
import { activityService } from "@/services/activityService";
import { BlockchainActivityCard } from "@/components/blockchain/BlockchainActivityCard";
import { ActivityDetailDrawer } from "@/components/blockchain/ActivityDetailDrawer";
import { Blocks, ShieldCheck, Cpu, Radio, Hash, ExternalLink, Copy, Check } from "lucide-react";

export default function MSTBlockchainPage() {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  useEffect(() => {
    blockchainService.getBlockchainStatus().then(setStatus);
    activityService.getActivityHistory().then(setEvents);
  }, []);

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400">
              <span>MST INFRASTRUCTURE</span>
              <span className="text-slate-600">/</span>
              <span>TESTNET v2.4</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">CHAIN ID: 8841</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              MST Blockchain Node & Attestation Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Decentralized state settlement network providing immutable cryptographic proofs for autonomous robotics kinematics and safety certification.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              CLUSTER SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Network Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">BLOCK HEIGHT</span>
            <div className="text-2xl font-bold text-slate-100">#{status?.blockHeight || 4921803}</div>
            <span className="text-[10px] text-cyan-tech">Avg block time: 1.2s</span>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">GAS BALANCE</span>
            <div className="text-2xl font-bold text-purple-300">{status?.balanceMST || 42.85} MST</div>
            <span className="text-[10px] text-slate-400">Operator Gas Reserve</span>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">NETWORK LATENCY</span>
            <div className="text-2xl font-bold text-emerald-400">{status?.latencyMs || 8} ms</div>
            <span className="text-[10px] text-slate-400">Validator RPC Latency</span>
          </div>

          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">ACTIVE DAEMONS</span>
            <div className="text-2xl font-bold text-cyan-tech">{status?.activeDaemons || 14} / 14</div>
            <span className="text-[10px] text-emerald-400">All validators online</span>
          </div>
        </div>

        {/* Operator Identity & Smart Contracts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase font-bold">CONNECTED OPERATOR WALLET</span>
              <span className="text-emerald-400 text-[10px]">• CONNECTED</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#070a12] border border-panel-border">
              <span className="text-cyan-tech font-bold select-all">
                {status?.walletAddress || "0x8x71C94b2A06E5D71C17A4"}
              </span>
              <button
                onClick={() => handleCopy(status?.walletAddress || "0x8x71C94b2A06E5D71C17A4")}
                className="text-slate-400 hover:text-slate-200"
              >
                {copiedAddr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Authorized hardware-in-the-loop (HIL) signer node with capability to mint ZK-verified robotics skill badges.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold">DEPLOYED CONTRACT REGISTRY</span>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#070a12] border border-panel-border">
                <span className="text-slate-300">RobotRegistry.sol</span>
                <span className="text-purple-300">0x91F2B...49F0</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#070a12] border border-panel-border">
                <span className="text-slate-300">RobotEventLedger.sol</span>
                <span className="text-purple-300">0x3A21C...88B1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Blockchain Attestation Events */}
        <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Blocks className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
                MST Testnet Attestation Stream
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">LIVE FEED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.slice(0, 4).map((evt) => (
              <BlockchainActivityCard
                key={evt.id}
                event={evt}
                onClick={() => setSelectedEvent(evt)}
              />
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
