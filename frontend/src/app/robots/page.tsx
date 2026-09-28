"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Cpu, Radio, Play, Crosshair } from "lucide-react";

// The dummy token created during database init
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZjMwMWY4Ni0yZjkzLTRhNjItODZkYi0yNDcyODAwNDg4MzkiLCJleHAiOjE3OTA3MDgxMTB9.gI0kkdP9cbM2PkjrOq5CVI5r4yqnVLGLxiuz2F4KjkA";

export default function RobotsFleetPage() {
  const [robots, setRobots] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [targetGoal, setTargetGoal] = useState({ x: 10, y: 10 });
  const [maxSpeed, setMaxSpeed] = useState(1.0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Create a dummy simulation if none exists for default_sim_id
      const simRes = await fetch("http://localhost:8000/api/v1/simulations", {
        headers: { Authorization: `Bearer ${DEV_TOKEN}` }
      });
      const simData = await simRes.json();
      setSimulations(simData);
      
      const robRes = await fetch("http://localhost:8000/api/v1/robots", {
        headers: { Authorization: `Bearer ${DEV_TOKEN}` }
      });
      const robData = await robRes.json();
      setRobots(robData);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendCommand = async (simId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/simulations/${simId}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEV_TOKEN}`
        },
        body: JSON.stringify({
          goal: targetGoal,
          max_speed: maxSpeed
        })
      });
      alert("Command sent successfully to simulation!");
    } catch (e) {
      alert("Failed to send command");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
        <div className="border-b border-panel-border pb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-tech">
            <span>FLEET CONTROL DASHBOARD</span>
            <span className="text-slate-600">/</span>
            <span>FASTAPI INTEGRATION</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Robot Control Panel
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure navigation parameters and set goals for active simulations via REST API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Active Robots / Simulations */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase">Available Simulations</h2>
            {loading ? <p className="text-slate-500">Loading from Backend...</p> : simulations.length === 0 ? (
              <div className="p-4 rounded-xl bg-panel border border-panel-border text-slate-400">
                <p>No active simulations in database.</p>
                <p className="text-[10px] mt-2">Hint: The Python script is running as 'default_sim_id' but it might not be registered in DB. You can still use the control panel if you override the ID.</p>
              </div>
            ) : simulations.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-panel border border-panel-border space-y-3">
                <div className="flex items-center gap-2 text-cyan-tech">
                  <Play className="w-4 h-4" />
                  <span className="font-bold">Sim: {s.id}</span>
                </div>
                <div className="text-[10px] text-slate-400">Status: {s.status}</div>
                <button
                  onClick={() => sendCommand(s.id)}
                  className="px-3 py-1.5 bg-cyan-tech text-black font-bold rounded shadow-cyan-glow active:scale-95"
                >
                  Send Command
                </button>
              </div>
            ))}
            
            {/* Fallback panel for 'default_sim_id' which is what our python script uses */}
            <div className="p-4 rounded-xl bg-panel border border-panel-border space-y-3 mt-4 border-dashed border-cyan-500/50">
                <div className="flex items-center justify-between text-cyan-tech">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span className="font-bold">Direct Control (default_sim_id)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-[10px]">WebSocket Active</span>
                </div>
                <p className="text-[10px] text-slate-400">Send command to the currently running Python Robust Controller via FastAPI.</p>
                <button
                  onClick={() => sendCommand("default_sim_id")}
                  className="w-full py-2 bg-cyan-tech text-black font-bold rounded shadow-cyan-glow transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Crosshair className="w-4 h-4" /> Update Navigation Goal
                </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="p-6 rounded-xl bg-panel-elevated border border-panel-border space-y-6">
            <h2 className="text-sm font-bold text-slate-200 uppercase flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-tech" />
              Navigation Parameters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target X Coordinate (m)</label>
                <input 
                  type="number" 
                  value={targetGoal.x} 
                  onChange={e => setTargetGoal({...targetGoal, x: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[#0a111a] border border-panel-border rounded p-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target Y Coordinate (m)</label>
                <input 
                  type="number" 
                  value={targetGoal.y} 
                  onChange={e => setTargetGoal({...targetGoal, y: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[#0a111a] border border-panel-border rounded p-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Maximum Speed (m/s)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={maxSpeed} 
                  onChange={e => setMaxSpeed(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-[#0a111a] border border-panel-border rounded p-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="pt-4 border-t border-panel-border">
                <Link
                  href="/simulation?challenge=challenge-07"
                  className="block w-full text-center py-2 border border-cyan-500/50 text-cyan-tech rounded hover:bg-cyan-950/30 transition"
                >
                  View Live Simulation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
