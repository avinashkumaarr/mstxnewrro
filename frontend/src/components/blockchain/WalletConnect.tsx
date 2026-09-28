"use client";

import React, { useState } from "react";
import { formatAddress } from "@/lib/utils";

interface WalletConnectProps {
  address?: string;
  connected?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  address = "0x8x71C94b2A06E5D71C17A4",
  connected = true,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-panel-elevated border border-panel-border text-xs font-mono">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-slate-300">{formatAddress(address)}</span>
      <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
        MST
      </span>
    </div>
  );
};
