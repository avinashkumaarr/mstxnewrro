"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  Copy,
  Terminal,
} from "lucide-react";
import { copilotService, ChatMessage } from "@/services/copilotService";

const PROMPT_SUGGESTIONS = [
  "How do I prevent oscillations when dodging moving obstacles?",
  "Explain heading error normalization in differential drive",
  "How does RoboLedger verify zero-collision tolerance?",
  "Write an APF repulsive force snippet for 2D LiDAR",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello Souvik! I am your AI Robotics Copilot powered by Google Gemini, NEWRRO kinematics, and MST verification. You are currently working on Challenge #07 (Dynamic Obstacle Avoidance). How can I assist you with kinematics, LiDAR filtering, or zero-collision controller tuning today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: textToSend.trim() },
    ];
    setMessages(newMessages);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await copilotService.askTutor(newMessages);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Encountered a communication issue with the AI Copilot. Please try again in a few moments.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat reset. I am ready to help you analyze kinematics, debug LiDAR avoidance vectors, or build your custom robot controllers.",
      },
    ]);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4 select-none font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-purple-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
                <span>AI Robotics Tutor & Copilot</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300">
                  GEMINI 2.5 • ROS2 FOXY
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Context-aware guidance for kinematics, LiDAR range filters, path planners, and MST attestations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="p-2 rounded hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-panel-border transition-colors text-xs flex items-center gap-1 font-mono"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <Link
              href="/simulation?challenge=challenge-07"
              className="px-4 py-2 rounded bg-cyan-tech text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-cyan-glow hover:bg-cyan-tech-dark transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Open in Lab</span>
            </Link>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" /> Prompts:
          </span>
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              disabled={loading}
              className="shrink-0 text-[11px] font-mono px-2.5 py-1 rounded bg-panel-elevated hover:bg-purple-950/40 border border-panel-border hover:border-purple-500/30 text-slate-300 hover:text-purple-300 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-panel border border-panel-border font-sans">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === "assistant" ? "" : "flex-row-reverse"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === "assistant"
                    ? "bg-purple-950/80 border border-purple-500/40 text-purple-300 shadow-purple-glow"
                    : "bg-cyan-950/80 border border-cyan-500/40 text-cyan-tech shadow-cyan-glow"
                }`}
              >
                {m.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`group relative p-4 rounded-xl max-w-2xl text-xs leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-panel-elevated border border-panel-border text-slate-200"
                    : "bg-cyan-950/40 border border-cyan-500/30 text-cyan-50"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {m.content}
                </div>

                {m.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(m.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-opacity rounded bg-slate-900/80"
                    title="Copy message"
                  >
                    {copiedIdx === idx ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Thinking / Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-panel-elevated border border-purple-500/30 text-slate-300 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Copilot is analyzing kinematics with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex gap-2 shrink-0 font-mono">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            placeholder="Ask about differential drive, A* path planning, LiDAR topics, or Python syntax..."
            className="flex-1 bg-panel border border-panel-border rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-purple-glow transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask Tutor</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
