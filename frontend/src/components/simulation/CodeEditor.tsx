"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Code2,
  RefreshCw,
  Zap,
  Wand2,
  Check,
  Copy,
  ExternalLink,
  Bot,
  AlertCircle,
} from "lucide-react";
import { copilotService } from "@/services/copilotService";

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
  const [modalMode, setModalMode] = useState<"explain" | "optimize">("explain");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [optimizedCode, setOptimizedCode] = useState<string>("");
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = code.split("\n");

  const handleOpenAiExplain = async () => {
    setShowAiModal(true);
    setModalMode("explain");
    setApplied(false);
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await copilotService.explainCode(code);
      setAiResponse(res.reply);
    } catch (e: any) {
      setAiResponse("Failed to obtain kinematic analysis from Gemini Copilot.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunOptimize = async () => {
    setModalMode("optimize");
    setApplied(false);
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await copilotService.optimizeCode(code);
      setAiResponse(res.reply);

      // Extract python code block if present
      const match = res.reply.match(/```python([\s\S]*?)```/);
      if (match && match[1]) {
        setOptimizedCode(match[1].trim());
      } else {
        setOptimizedCode("");
      }
    } catch (e: any) {
      setAiResponse("Failed to optimize code with Gemini Copilot.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyCode = () => {
    if (optimizedCode) {
      onChange(optimizedCode);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        {/* AI Copilot Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenAiExplain}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:text-purple-100 hover:border-purple-400 transition-colors text-[11px] font-mono shadow-purple-glow"
            title="Analyze kinematics with Gemini Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Copilot</span>
          </button>
        </div>
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
        <div className="flex items-center gap-1.5 text-purple-400">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Gemini Copilot Ready</span>
        </div>
      </div>

      {/* AI Copilot Analysis & Optimization Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-purple-500/50 rounded-xl p-5 max-w-2xl w-full shadow-2xl shadow-purple-950/50 font-mono text-xs max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-panel-border pb-3 shrink-0">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>AI ROBOTICS COPILOT • GEMINI 2.5</span>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-base px-2 py-0.5"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center justify-between pt-3 pb-2 border-b border-panel-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAiExplain}
                  className={`px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                    modalMode === "explain"
                      ? "bg-purple-950 text-purple-200 border border-purple-500/50"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  Kinematic Analysis
                </button>
                <button
                  onClick={handleRunOptimize}
                  className={`px-3 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                    modalMode === "optimize"
                      ? "bg-purple-950 text-purple-200 border border-purple-500/50"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Wand2 className="w-3 h-3 text-purple-400" />
                  <span>Optimize Zero-Collision</span>
                </button>
              </div>

              <Link
                href="/tutor"
                target="_blank"
                className="text-[11px] text-cyan-tech hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <span>Full Tutor Chat</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 font-sans text-xs leading-relaxed text-slate-300">
              {aiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-purple-300 font-mono text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                  <span>Querying Gemini Robotics Engine...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans text-xs bg-panel/60 p-4 rounded-lg border border-panel-border max-h-[460px] overflow-y-auto">
                  {aiResponse}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-panel-border flex items-center justify-between shrink-0 font-mono text-xs">
              <div className="flex items-center gap-2">
                {modalMode === "optimize" && optimizedCode && (
                  <button
                    onClick={handleApplyCode}
                    className="px-3.5 py-1.5 bg-cyan-tech hover:bg-cyan-tech-dark text-black font-bold rounded flex items-center gap-1.5 shadow-cyan-glow transition-all active:scale-95"
                  >
                    {applied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-black fill-black" />
                        <span>Apply to Editor</span>
                      </>
                    )}
                  </button>
                )}
                {aiResponse && (
                  <button
                    onClick={() => handleCopy(optimizedCode || aiResponse)}
                    className="px-3 py-1.5 bg-panel-elevated hover:bg-slate-800 text-slate-300 border border-panel-border rounded flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
