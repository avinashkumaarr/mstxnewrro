"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { activityService } from "@/services/activityService";
import { ActivityEvent } from "@/types/event";
import { BlockchainActivityCard } from "@/components/blockchain/BlockchainActivityCard";
import { ActivityDetailDrawer } from "@/components/blockchain/ActivityDetailDrawer";
import { Layers, Search, Filter, ShieldCheck, Download, RefreshCw } from "lucide-react";

export default function ActivityLedgerPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshEvents = () => {
    activityService.getActivityHistory().then(setEvents);
  };

  useEffect(() => {
    refreshEvents();
    const unsub = activityService.subscribe(setEvents);
    return () => unsub();
  }, []);

  const filtered = events.filter((e) => {
    const matchType = filterType === "ALL" || e.type === filterType;
    const matchSearch =
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.eventHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.transactionHash && e.transactionHash.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.challengeTitle && e.challengeTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400">
              <span>MST BLOCKCHAIN</span>
              <span className="text-slate-600">/</span>
              <span>ACTIVITY LEDGER</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">TESTNET ATTESTATIONS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              On-Chain Activity Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable cryptographic record of robotics simulations, code submissions, and evaluation milestones on MST Testnet.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={refreshEvents}
              className="p-2 rounded bg-panel-elevated border border-panel-border hover:border-slate-500 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by hash, ID, challenge..."
              className="w-full bg-panel border border-panel-border rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-tech transition-colors"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto font-mono text-[11px]">
            {["ALL", "CHALLENGE_PASSED", "SIMULATION_COMPLETED", "CODE_SUBMITTED", "CHALLENGE_STARTED"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                  filterType === t
                    ? "bg-purple-950 border border-purple-500/60 text-purple-300 font-bold"
                    : "bg-panel border border-panel-border text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-slate-500 font-mono text-xs bg-panel border border-panel-border rounded-xl">
              No blockchain activities matching your filter criteria.
            </div>
          ) : (
            filtered.map((event) => (
              <BlockchainActivityCard
                key={event.id}
                event={event}
                onClick={() => setSelectedEvent(event)}
              />
            ))
          )}
        </div>

        {/* Detail Drawer */}
        <ActivityDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </DashboardLayout>
  );
}
