"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ActivityEvent } from "@/types/event";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export interface BlockchainTick {
  blockHeight: number;
  blockHash: string;
  tps: number;
  latencyMs: number;
  pendingTxns: number;
  timestamp: string;
  transaction: ActivityEvent;
}

export interface UseBlockchainFeedOptions {
  onTick?: (tick: BlockchainTick) => void;
  maxHistory?: number;
  enabled?: boolean;
}

export function useBlockchainFeed({
  onTick,
  maxHistory = 50,
  enabled = true,
}: UseBlockchainFeedOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestTick, setLatestTick] = useState<BlockchainTick | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [blockHeight, setBlockHeight] = useState(4921803);
  const [tps, setTps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws/blockchain`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data) as BlockchainTick & { type: string };
          if (data.type === "BLOCK_PRODUCED") {
            setLatestTick(data);
            setBlockHeight(data.blockHeight);
            setTps(data.tps);
            setLatencyMs(data.latencyMs);
            if (data.transaction) {
              setEvents((prev) => [data.transaction, ...prev].slice(0, maxHistory));
            }
            onTick?.(data);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket not available
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, [enabled, maxHistory, onTick]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { isConnected, latestTick, events, blockHeight, tps, latencyMs };
}
