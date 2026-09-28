"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { blockchainService } from "@/services/blockchainService";
import { activityService } from "@/services/activityService";
import { BlockchainStatus, ActivityEvent } from "@/types/event";
import { BlockchainActivityCard } from "@/components/blockchain/BlockchainActivityCard";
import { ActivityDetailDrawer } from "@/components/blockchain/ActivityDetailDrawer";
import { useBlockchainFeed } from "@/hooks/useBlockchainFeed";
import {
  Blocks,
  ShieldCheck,
  Cpu,
  Radio,
  Hash,
  Copy,
  Check,
  Zap,
  Activity,
  Wifi,
  WifiOff,
  ChevronRight,
  RefreshCw,
  Clock,
  Database,
} from "lucide-react";

// Animated block height counter
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    const diff = value - prevRef.current;
    const steps = Math.min(Math.abs(diff), 8);
    const stepSize = diff / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setDisplay(Math.round(prevRef.current + stepSize * step));
      if (step >= steps) {
        clearInterval(id);
        prevRef.current = value;
      }
    }, 40);
    return () => clearInterval(id);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

// Live ticker row
function TickerRow({ event, onClick }: { event: ActivityEvent; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    CHALLENGE_PASSED: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30",
    SIMULATION_COMPLETED: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30",
    CODE_SUBMITTED: "text-purple-400 bg-purple-950/40 border-purple-500/30",
    CHALLENGE_STARTED: "text-blue-400 bg-blue-950/40 border-blue-500/30",
    CHALLENGE_FAILED: "text-red-400 bg-red-950/40 border-red-500/30",
  };
  const dotColorMap: Record<string, string> = {
    CHALLENGE_PASSED: "bg-emerald-400",
    SIMULATION_COMPLETED: "bg-cyan-400",
    CODE_SUBMITTED: "bg-purple-400",
    CHALLENGE_STARTED: "bg-blue-400",
    CHALLENGE_FAILED: "bg-red-400",
  };

  const cls = colorMap[event.type] || "text-slate-400 bg-slate-900/40 border-slate-700/30";
  const dot = dotColorMap[event.type] || "bg-slate-400";

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 bg-[#080c14]/80 border border-panel-border hover:border-cyan-500/30 hover:bg-slate-900/50 rounded cursor-pointer transition-all duration-200 group animate-fadeIn"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      <span className="text-[10px] font-mono text-slate-500 w-16 shrink-0">
        #{event.blockNumber?.toLocaleString()}
      </span>
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cls} shrink-0 whitespace-nowrap`}>
        {event.type.replace(/_/g, " ")}
      </span>
      <span className="text-[11px] text-slate-300 truncate flex-1 font-mono">
        {event.challengeTitle}
      </span>
      <span className="text-[10px] font-mono text-slate-500 shrink-0">{event.timestamp}</span>
      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-500 transition-colors shrink-0" />
    </div>
  );
}

// Chain pulse animation component
function ChainPulse({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-3 rounded-sm transition-all duration-300 ${
            active ? "bg-emerald-400" : "bg-slate-700"
          }`}
          style={{
            animationDelay: `${i * 0.15}s`,
            opacity: active ? 0.4 + i * 0.15 : 0.3,
            height: active ? `${8 + i * 3}px` : "12px",
          }}
        />
      ))}
    </div>
  );
}

export default function MSTBlockchainPage() {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [localEvents, setLocalEvents] = useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [blockFlash, setBlockFlash] = useState(false);

  // Real-time blockchain feed via WebSocket
  const { isConnected, events: liveEvents, blockHeight, tps, latencyMs } = useBlockchainFeed({
    maxHistory: 20,
  });

  // Trigger visual feedback on each new block
  useEffect(() => {
    if (liveEvents.length === 0) return;
    setPulseActive(true);
    setBlockFlash(true);
    const t1 = setTimeout(() => setPulseActive(false), 800);
    const t2 = setTimeout(() => setBlockFlash(false), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [liveEvents.length]);

  // Load status & local activity history
  useEffect(() => {
    blockchainService.getBlockchainStatus().then(setStatus);
    activityService.getActivityHistory().then(setLocalEvents);
    const unsub = activityService.subscribe(setLocalEvents);
    return () => unsub();
  }, []);

  // Poll status every 5s
  useEffect(() => {
    const id = setInterval(() => {
      blockchainService.getBlockchainStatus().then(setStatus);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  };

  // Merge live events with local (deduplicated)
  const allEvents: ActivityEvent[] = React.useMemo(() => {
    const localIds = new Set(localEvents.map((e) => e.id));
    const liveOnly = liveEvents.filter((e) => !localIds.has(e.id));
    return [...localEvents, ...liveOnly];
  }, [localEvents, liveEvents]);

  // Animated stats
  const displayBlockHeight = blockHeight || status?.blockHeight || 4921803;
  const displayLatency = latencyMs || status?.latencyMs || 8;
  const displayTps = tps || 2.4;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-5 select-none font-sans">

        {/* ── Page Header ── */}
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
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Decentralized state settlement network providing immutable cryptographic proofs for
              autonomous robotics kinematics and safety certification.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs shrink-0">
            {/* Live connection badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] transition-colors ${
                isConnected
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                  : "bg-red-950/40 border-red-500/30 text-red-400"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              {isConnected ? "NODE LIVE" : "RECONNECTING"}
            </div>

            <div className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              CLUSTER SYNCHRONIZED
            </div>
          </div>
        </div>

        {/* ── Network Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Block Height */}
          <div
            className={`p-4 rounded-xl bg-panel border transition-all duration-300 ${
              blockFlash ? "border-cyan-500/60 shadow-lg shadow-cyan-500/10" : "border-panel-border"
            } space-y-1`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Block Height</span>
              <Blocks className="w-3.5 h-3.5 text-cyan-tech" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              #<AnimatedNumber value={displayBlockHeight} />
            </div>
            <div className="flex items-center gap-1.5">
              <ChainPulse active={pulseActive} />
              <span className="text-[10px] text-cyan-tech">avg 1.2s/block</span>
            </div>
          </div>

          {/* Gas Balance */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Gas Balance</span>
              <Database className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300">
              {status?.balanceMST?.toFixed(4) || "42.8500"} MST
            </div>
            <span className="text-[10px] text-slate-400">Operator Gas Reserve</span>
          </div>

          {/* Latency */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">RPC Latency</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{displayLatency} ms</div>
            <div className="flex gap-0.5 items-end h-4">
              {[3, 5, 4, 7, 5, 4, 6, displayLatency > 10 ? 8 : 4].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-sm bg-emerald-500/60"
                  style={{ height: `${h * 2}px` }}
                />
              ))}
            </div>
          </div>

          {/* TPS */}
          <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Throughput</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {displayTps.toFixed(1)} <span className="text-sm font-normal text-slate-400">TPS</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {status?.activeDaemons || 14}/14 validators online
            </span>
          </div>
        </div>

        {/* ── Main 2-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT: Operator Identity + Contracts ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Operator wallet */}
            <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Connected Operator Wallet</span>
                <span className="text-emerald-400 text-[10px] font-bold">• CONNECTED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#070a12] border border-panel-border">
                <span className="text-cyan-tech font-bold select-all text-[11px] truncate max-w-[200px]">
                  {status?.walletAddress || "0x8F71C94b2A06E5D71C17A4B3c2"}
                </span>
                <button
                  onClick={() => handleCopy(status?.walletAddress || "0x8F71C94b2A06E5D71C17A4B3c2")}
                  className="text-slate-400 hover:text-slate-200 ml-2 shrink-0"
                >
                  {copiedAddr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Authorized hardware-in-the-loop (HIL) signer node with capability to mint ZK-verified
                robotics skill badges and mission proofs.
              </p>
            </div>

            {/* Deployed contracts */}
            <div className="p-5 rounded-xl bg-panel border border-panel-border space-y-3 font-mono text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Deployed Contract Registry</span>
              <div className="space-y-2 text-[11px]">
                {[
                  { name: "RobotRegistry.sol", addr: "0x91F2B...49F0", color: "text-purple-300" },
                  { name: "RobotEventLedger.sol", addr: "0x3A21C...88B1", color: "text-cyan-300" },
                  { name: "MissionProofVault.sol", addr: "0xC8A4D...120F", color: "text-emerald-300" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between p-2 rounded bg-[#070a12] border border-panel-border group">
                    <span className="text-slate-300 group-hover:text-slate-100 transition-colors">{c.name}</span>
                    <span className={c.color + " font-mono"}>{c.addr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Network stats */}
            <div className="p-5 rounded-xl bg-panel border border-panel-border font-mono text-xs space-y-3">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Consensus Cluster Status</span>
              <div className="space-y-2">
                {[
                  { label: "Validator Nodes", value: "14 / 14", bar: 100, color: "from-emerald-500 to-emerald-400" },
                  { label: "Block Finality", value: "99.98%", bar: 99.98, color: "from-cyan-500 to-cyan-400" },
                  { label: "ZK Proof Pool", value: "6 / 8", bar: 75, color: "from-purple-500 to-purple-400" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-200 font-bold">{item.value}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Live Transaction Feed ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Live stream header */}
            <div className="p-4 rounded-xl bg-panel border border-panel-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-tech animate-pulse" />
                  <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
                    MST Testnet Live Stream
                  </h2>
                  {isConnected && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Every ~1.2s</span>
                </div>
              </div>

              {/* Live event ticker */}
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
                {liveEvents.length === 0 ? (
                  <div className="py-8 text-center text-[11px] font-mono text-slate-600">
                    <Wifi className="w-5 h-5 mx-auto mb-2 animate-pulse" />
                    {isConnected ? "Waiting for first block…" : "Connecting to blockchain node…"}
                  </div>
                ) : (
                  liveEvents.map((evt) => (
                    <TickerRow
                      key={evt.id}
                      event={evt}
                      onClick={() => setSelectedEvent(evt)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recent local attestations grid */}
            <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
                    Your Attestation Events
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {localEvents.length} records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {localEvents.slice(0, 4).map((evt) => (
                  <BlockchainActivityCard
                    key={evt.id}
                    event={evt}
                    onClick={() => setSelectedEvent(evt)}
                  />
                ))}
                {localEvents.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-[11px] font-mono text-slate-600">
                    Run a simulation to generate blockchain attestations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail Drawer ── */}
        <ActivityDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}
