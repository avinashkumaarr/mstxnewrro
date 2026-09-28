"use client";

import React, { useRef, useEffect, useState } from "react";
import { simulationEngine } from "@/simulation/engine";
import { Challenge } from "@/types/challenge";
import { Maximize2, Hash, Eye, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface SimulationCanvasProps {
  challenge: Challenge;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ challenge }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showGrid, setShowGrid] = useState(true);
  const [showLidarRays, setShowLidarRays] = useState(true);
  const [showPlannedPath, setShowPlannedPath] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number;

    const render = () => {
      // Resize handling
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const arenaWidth = challenge.arenaConfig.arenaWidth;
      const arenaHeight = challenge.arenaConfig.arenaHeight;

      // Coordinate transformation: World meters to Canvas pixels
      const padding = 35;
      const scaleX = ((width - padding * 2) / arenaWidth) * zoomLevel;
      const scaleY = ((height - padding * 2) / arenaHeight) * zoomLevel;
      const scale = Math.min(scaleX, scaleY);

      // Center arena in canvas
      const offsetX = (width - arenaWidth * scale) / 2;
      const offsetY = height - (height - arenaHeight * scale) / 2;

      // World to Screen helper: Simulation Y is upward (standard Cartesian)
      const toScreen = (x: number, y: number) => ({
        x: offsetX + x * scale,
        y: offsetY - y * scale,
      });

      // Clear Canvas
      ctx.fillStyle = "#080c14";
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Blueprint Grid
      if (showGrid) {
        ctx.strokeStyle = "rgba(27, 37, 59, 0.45)";
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let gx = 0; gx <= arenaWidth; gx += 2) {
          const p1 = toScreen(gx, 0);
          const p2 = toScreen(gx, arenaHeight);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Coordinate label
          ctx.fillStyle = "#334155";
          ctx.font = "9px monospace";
          ctx.fillText(`${gx}m`, p1.x + 2, p1.y + 12);
        }

        // Horizontal grid lines
        for (let gy = 0; gy <= arenaHeight; gy += 2) {
          const p1 = toScreen(0, gy);
          const p2 = toScreen(arenaWidth, gy);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.fillStyle = "#334155";
          ctx.font = "9px monospace";
          ctx.fillText(`${gy}m`, p1.x - 22, p1.y - 2);
        }
      }

      // 2. Arena Boundary Walls
      const originScreen = toScreen(0, arenaHeight);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.strokeRect(originScreen.x, originScreen.y, arenaWidth * scale, arenaHeight * scale);

      // World Origin [0, 0] marker
      const originPt = toScreen(0, 0);
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originPt.x - 8, originPt.y);
      ctx.lineTo(originPt.x + 16, originPt.y);
      ctx.moveTo(originPt.x, originPt.y + 8);
      ctx.lineTo(originPt.x, originPt.y - 16);
      ctx.stroke();

      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("[0, 0]", originPt.x + 4, originPt.y - 4);

      // Get current engine states
      const robot = simulationEngine.getRobot();
      const obstacles = simulationEngine.getObstacles();
      const waypoints = simulationEngine.getWaypoints();
      const executedPath = simulationEngine.getExecutedPath();
      const lidar = simulationEngine.getLidarScan();

      // 3. Planned Trajectory Path (Cyan Dashed Curve)
      if (showPlannedPath && waypoints.length > 0) {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const startPt = toScreen(challenge.initialRobotPose.x, challenge.initialRobotPose.y);
        ctx.moveTo(startPt.x, startPt.y);

        for (const wp of waypoints) {
          const wpPt = toScreen(wp.x, wp.y);
          ctx.lineTo(wpPt.x, wpPt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Executed Trajectory Trail
      if (executedPath.length > 1) {
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const first = toScreen(executedPath[0].x, executedPath[0].y);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < executedPath.length; i++) {
          const pt = toScreen(executedPath[i].x, executedPath[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // 5. Waypoints
      for (const wp of waypoints) {
        const pt = toScreen(wp.x, wp.y);
        const radiusPx = wp.radius * scale;

        // Outer radius ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radiusPx, 0, Math.PI * 2);
        ctx.strokeStyle = wp.reached ? "#10b981" : wp.isGoal ? "#a855f7" : "#00f0ff";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center beacon
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = wp.reached ? "#10b981" : wp.isGoal ? "#a855f7" : "#00f0ff";
        ctx.fill();

        // Label and cost badge
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = wp.reached ? "#34d399" : "#e2e8f0";
        const tag = wp.isGoal ? "TARGET [GOAL]" : `${wp.name} (cost: ${wp.cost})`;
        ctx.fillText(tag, pt.x + 8, pt.y - 4);
      }

      // 6. Obstacles
      for (const obs of obstacles) {
        const topLeft = toScreen(obs.x, obs.y + obs.height);
        const obsW = obs.width * scale;
        const obsH = obs.height * scale;

        // Check collision style
        const isColliding = obs.colliding;
        const isDynamic = obs.isDynamic;

        // Fill background
        ctx.fillStyle = isColliding
          ? "rgba(239, 68, 68, 0.3)"
          : isDynamic
          ? "rgba(244, 63, 94, 0.12)"
          : "rgba(30, 41, 59, 0.65)";
        ctx.fillRect(topLeft.x, topLeft.y, obsW, obsH);

        // Border
        ctx.strokeStyle = isColliding ? "#ef4444" : isDynamic ? "#f43f5e" : "#475569";
        ctx.lineWidth = isColliding ? 2.5 : 1.5;
        ctx.strokeRect(topLeft.x, topLeft.y, obsW, obsH);

        // Diagonal hazard stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(topLeft.x, topLeft.y, obsW, obsH);
        ctx.clip();

        ctx.strokeStyle = isColliding
          ? "rgba(239, 68, 68, 0.5)"
          : isDynamic
          ? "rgba(244, 63, 94, 0.3)"
          : "rgba(71, 85, 105, 0.25)";
        ctx.lineWidth = 2;
        for (let s = -obsH; s < obsW + obsH; s += 10) {
          ctx.beginPath();
          ctx.moveTo(topLeft.x + s, topLeft.y);
          ctx.lineTo(topLeft.x + s + obsH, topLeft.y + obsH);
          ctx.stroke();
        }
        ctx.restore();

        // Name tag
        ctx.fillStyle = isColliding ? "#ef4444" : isDynamic ? "#f43f5e" : "#94a3b8";
        ctx.font = "8px monospace";
        ctx.fillText(obs.name, topLeft.x + 4, topLeft.y + obsH - 4);
      }

      // 7. LiDAR Rays Visualization
      if (showLidarRays && lidar.rays.length > 0) {
        const robScreen = toScreen(robot.x, robot.y);

        for (const ray of lidar.rays) {
          const hitScreen = toScreen(ray.hitX, ray.hitY);

          // Subtle beam
          ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(robScreen.x, robScreen.y);
          ctx.lineTo(hitScreen.x, hitScreen.y);
          ctx.stroke();

          // Laser hit point dot
          if (ray.hit) {
            ctx.fillStyle = ray.distance < 1.2 ? "#ef4444" : "#00f0ff";
            ctx.beginPath();
            ctx.arc(hitScreen.x, hitScreen.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 8. Robot AGV-01
      const robScreen = toScreen(robot.x, robot.y);
      const robRadiusPx = (robot.width / 2) * scale;

      ctx.save();
      ctx.translate(robScreen.x, robScreen.y);
      // Invert angle for canvas Y-flip
      ctx.rotate(-robot.theta);

      // Left wheel
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.fillRect(-robRadiusPx * 0.8, -robRadiusPx - 4, robRadiusPx * 1.6, 4);
      ctx.strokeRect(-robRadiusPx * 0.8, -robRadiusPx - 4, robRadiusPx * 1.6, 4);

      // Right wheel
      ctx.fillRect(-robRadiusPx * 0.8, robRadiusPx, robRadiusPx * 1.6, 4);
      ctx.strokeRect(-robRadiusPx * 0.8, robRadiusPx, robRadiusPx * 1.6, 4);

      // Robot Chassis
      ctx.fillStyle = "#0e182a";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, robRadiusPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Heading arrow pointer
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.moveTo(robRadiusPx + 4, 0);
      ctx.lineTo(robRadiusPx - 4, -4);
      ctx.lineTo(robRadiusPx - 4, 4);
      ctx.closePath();
      ctx.fill();

      // Front caster / sensor dome
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      ctx.restore();

      // AGV Floating Telemetry Pill above robot
      ctx.fillStyle = "rgba(10, 14, 26, 0.88)";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      const tagText = `AGV-01: v=${robot.linearVelocity.toFixed(2)} m/s | ω=${robot.angularVelocity.toFixed(2)} rad/s`;
      ctx.font = "bold 9px monospace";
      const tagW = ctx.measureText(tagText).width + 12;
      ctx.strokeRect(robScreen.x - tagW / 2, robScreen.y - robRadiusPx - 20, tagW, 16);
      ctx.fillRect(robScreen.x - tagW / 2, robScreen.y - robRadiusPx - 20, tagW, 16);

      ctx.fillStyle = "#00f0ff";
      ctx.fillText(tagText, robScreen.x - tagW / 2 + 6, robScreen.y - robRadiusPx - 8);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [challenge, showGrid, showLidarRays, showPlannedPath, zoomLevel]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] bg-[#080c14] border border-panel-border rounded-lg overflow-hidden select-none flex flex-col"
    >
      {/* Viewport Top Header Toolbar */}
      <div className="h-9 px-3 border-b border-panel-border bg-panel-elevated/90 backdrop-blur-sm flex items-center justify-between z-10 text-[10px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-semibold tracking-wider">
            VIEWPORT: 2D BLUEPRINT KINEMATICS
          </span>
          <span className="text-cyan-tech font-bold bg-[#070a12] px-2 py-0.5 rounded border border-panel-border">
            WORLD_ORIGIN [0,0]
          </span>
        </div>

        {/* Viewport Action Toggles */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded transition-colors ${
              showGrid ? "text-cyan-tech bg-cyan-950/60" : "hover:text-slate-200"
            }`}
            title="Toggle Blueprint Grid"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowPlannedPath(!showPlannedPath)}
            className={`p-1 rounded transition-colors ${
              showPlannedPath ? "text-cyan-tech bg-cyan-950/60" : "hover:text-slate-200"
            }`}
            title="Toggle Planned Curve"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-panel-border mx-1" />
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.1))}
            className="p-1 rounded hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="p-1 rounded hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1 rounded hover:text-slate-200"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2D Canvas */}
      <div className="flex-1 relative w-full h-full">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>

      {/* Watermark at bottom */}
      <div className="absolute bottom-2 left-3 pointer-events-none text-[9px] font-mono text-slate-500/80 tracking-widest uppercase">
        NEWRRO DYNAMICS 2D ENGINE (dt=0.01s)
      </div>
    </div>
  );
};
