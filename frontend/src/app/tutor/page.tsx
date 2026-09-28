"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Sparkles, Send, Bot, User, Code2, Play } from "lucide-react";

export default function TutorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello Souvik! I am your AI Robotics Copilot powered by NEWRRO kinematics & MST verification. You are currently working on Challenge #07 (Dynamic Obstacle Avoidance). Would you like help tuning your reactive obstacle repulsion vector or heading error calculation?",
    },
    {
      role: "user",
      content:
        "How do I prevent the robot from oscillating when it gets close to two obstacles simultaneously?",
    },
    {
      role: "assistant",
      content:
        "Great question! When between two obstacles, standard repulsive potential fields create conflicting vectors that cause chatter or oscillation. In our ROS2 simulation, you can apply an Artificial Potential Field (APF) with a deadband or use Reciprocal Velocity Obstacles (RVO) that project collision cones in velocity space rather than position space. Here's a sample snippet:\n\n```python\n# Smooth obstacle avoidance blending\nif front_dist < 1.0:\n    # Pick clearance direction with largest opening\n    direction = 1.0 if left_dist > right_dist else -1.0\n    robot.set_velocity(linear=0.2, angular=direction * 1.1)\n```\n\nYou can test this directly in the Robotics Lab!",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've analyzed your question against the ROS2 Foxy kinematic model. Ensure your linear velocity is clamped within 1.2 m/s to stay compliant with the zero-collision safety rules!",
        },
      ]);
    }, 600);
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
                  ROS2 FOXY TUNED
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Context-aware guidance for kinematics, LiDAR range filters, path planners, and MST attestations.
              </p>
            </div>
          </div>

          <Link
            href="/simulation?challenge=challenge-07"
            className="px-4 py-2 rounded bg-cyan-tech text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-cyan-glow"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Open in Lab</span>
          </Link>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-panel border border-panel-border">
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
                    ? "bg-purple-950/80 border border-purple-500/40 text-purple-300"
                    : "bg-cyan-950/80 border border-cyan-500/40 text-cyan-tech"
                }`}
              >
                {m.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-xl max-w-xl text-xs font-sans leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-panel-elevated border border-panel-border text-slate-200"
                    : "bg-cyan-950/40 border border-cyan-500/30 text-cyan-50"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex gap-2 shrink-0 font-mono">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about differential drive, A* path planning, LiDAR topics, or Python syntax..."
            className="flex-1 bg-panel border border-panel-border rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
          />
          <button
            onClick={handleSend}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-purple-glow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask Tutor</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
