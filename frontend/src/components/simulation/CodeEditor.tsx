"use client";

import React, { useState } from "react";
import { Sparkles, Code2, Check, RefreshCw } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  onResetStarter: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onResetStarter,
}) => {
  const [showAiModal, setShowAiModal] = useState(false);

  const lines = code.split("\n");

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] border border-panel-border rounded-lg overflow-hidden select-none">
      {/* Editor Tab Header */}
      <div className="h-9 px-3 border-b border-panel-border bg-panel-elevated flex items-center justify-between z-10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#070a12] border border-panel-border text-cyan-tech font-medium">
            <Code2 className="w-3.5 h-3.5" />
            <span>robot_controller.py</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-tech" />
          </div>
          <button
            onClick={onResetStarter}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 ml-1"
            title="Reset code to challenge default template"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Template</span>
          </button>
        </div>

        {/* AI Explain Button */}
        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:text-purple-100 hover:border-purple-400 transition-colors text-[11px] font-mono shadow-purple-glow"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Explain</span>
        </button>
      </div>

      {/* Editor Main Text Area */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs leading-5">
        {/* Line Numbers gutter */}
        <div className="w-10 bg-[#070a12] border-r border-panel-border text-slate-600 select-none py-2 text-right pr-2 font-mono text-[11px]">
          {lines.map((_, i) => (
            <div key={i}>{String(i + 1).padStart(2, "0")}</div>
          ))}
        </div>

        {/* Text Input */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 h-full bg-[#0a0e1a] text-slate-200 p-2 font-mono text-xs resize-none focus:outline-none focus:ring-0 leading-5 selection:bg-cyan-500/30 selection:text-white"
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Status Line at bottom of editor */}
      <div className="h-6 px-3 bg-panel-elevated border-t border-panel-border flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Ln {lines.length}, Col {lines[lines.length - 1]?.length || 0}</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>ROS2 rclpy Verified</span>
        </div>
      </div>

      {/* AI Explain Modal / Popover */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-panel border border-purple-500/50 rounded-lg p-5 max-w-lg w-full shadow-purple-glow font-mono text-xs">
            <div className="flex items-center justify-between border-b border-panel-border pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI ROBOTICS COPILOT • KINEMATIC ANALYSIS</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-slate-300 text-xs">
              <p>
                <strong className="text-cyan-tech">1. Heading Error Formulation:</strong> Uses{" "}
                <code className="bg-[#070a12] px-1 py-0.5 rounded text-amber-300">
                  math.atan2(goal_y - curr_y, goal_x - curr_x)
                </code>{" "}
                to compute the bearing to the current waypoint and normalizes angular differential to prevent wrap-around.
              </p>
              <p>
                <strong className="text-cyan-tech">2. Reactive Obstacle Avoidance:</strong> LiDAR beam sampling at angle 0 checks forward clearance. If below 1.0m, overrides proportional pursuit with an evasive yaw velocity of 1.20 rad/s.
              </p>
              <p>
                <strong className="text-cyan-tech">3. On-Chain Verification:</strong> State trajectory points are cryptographically attested via MST zero-knowledge zk-SNARK verifier.
              </p>
            </div>
            <button
              onClick={() => setShowAiModal(false)}
              className="mt-5 w-full py-2 bg-purple-950 border border-purple-500/40 hover:bg-purple-900 text-purple-200 rounded text-xs font-semibold"
            >
              Back to Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
