"use client";

import React, { useEffect, useState } from "react";
import { ActivityEvent } from "@/types/event";
import { activityService } from "@/services/activityService";
import { BlockchainActivityCard } from "@/components/blockchain/BlockchainActivityCard";
import { Activity, Clock } from "lucide-react";

interface RecentEventsProps {
  onSelectEvent: (event: ActivityEvent) => void;
  compact?: boolean;
  maxItems?: number;
}

export const RecentEvents: React.FC<RecentEventsProps> = ({
  onSelectEvent,
  compact = true,
  maxItems = 5,
}) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    activityService.getActivityHistory().then(setEvents);
    const unsubscribe = activityService.subscribe(setEvents);
    return () => unsubscribe();
  }, []);

  const displayedEvents = events.slice(0, maxItems);

  return (
    <div className="p-3.5 rounded-lg bg-panel-elevated border border-panel-border select-none space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-tech" />
          <span className="text-xs font-bold font-mono text-slate-200 tracking-wide uppercase">
            Recent On-Chain Activity
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">MST TESTNET</span>
      </div>

      <div className="space-y-1.5">
        {displayedEvents.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No on-chain activity recorded yet.
          </div>
        ) : (
          displayedEvents.map((evt) => (
            <BlockchainActivityCard
              key={evt.id}
              event={evt}
              compact={compact}
              onClick={() => onSelectEvent(evt)}
            />
          ))
        )}
      </div>
    </div>
  );
};
