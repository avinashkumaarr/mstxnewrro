"use client";

import React, { useMemo } from "react";

interface QRCodeVectorProps {
  value: string;
  size?: number;
  className?: string;
  includeBorder?: boolean;
}

/**
 * Deterministic Vector QR Code generator
 * Generates valid standard QR finder patterns (7x7 outer boxes with 3x3 centers)
 * and a deterministic pseudo-random module grid based on input string hash.
 * Completely dependency-free, razor-sharp on Retina/4K displays and print.
 */
export const QRCodeVector: React.FC<QRCodeVectorProps> = ({
  value,
  size = 120,
  className = "",
  includeBorder = true,
}) => {
  const { matrix, gridCount } = useMemo(() => {
    const gridCount = 25; // 25x25 matrix (Version 2 QR format)
    const m: boolean[][] = Array.from({ length: gridCount }, () =>
      Array(gridCount).fill(false)
    );

    // Helper: draw finder pattern at (r, c)
    const drawFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            m[startR + r][startC + c] = true;
          }
        }
      }
    };

    // Draw standard 3 finder corners
    drawFinder(0, 0); // Top-left
    drawFinder(0, gridCount - 7); // Top-right
    drawFinder(gridCount - 7, 0); // Bottom-left

    // Draw timing patterns
    for (let i = 8; i < gridCount - 8; i++) {
      if (i % 2 === 0) {
        m[6][i] = true;
        m[i][6] = true;
      }
    }

    // Draw alignment pattern around (16, 16)
    const ar = 16;
    const ac = 16;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (
          Math.abs(r) === 2 ||
          Math.abs(c) === 2 ||
          (r === 0 && c === 0)
        ) {
          m[ar + r][ac + c] = true;
        }
      }
    }

    // Seeded PRNG for reproducible data pattern based on value string
    let seed = 0;
    for (let i = 0; i < value.length; i++) {
      seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    }

    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed >>> 16) / 65536;
    };

    // Populate data cells that are not in reserved finder/timing areas
    for (let r = 0; r < gridCount; r++) {
      for (let c = 0; c < gridCount; c++) {
        // Skip finders & separators
        const inTopLeft = r <= 7 && c <= 7;
        const inTopRight = r <= 7 && c >= gridCount - 8;
        const inBottomLeft = r >= gridCount - 8 && c <= 7;
        const inAlignment = Math.abs(r - ar) <= 2 && Math.abs(c - ac) <= 2;
        const inTiming = r === 6 || c === 6;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlignment && !inTiming) {
          m[r][c] = pseudoRandom() > 0.45;
        }
      }
    }

    return { matrix: m, gridCount };
  }, [value]);

  const cellSize = 100 / gridCount;

  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center p-1.5 ${
        includeBorder
          ? "bg-slate-950 border border-cyan-500/40 rounded-lg shadow-sm"
          : "bg-transparent"
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        <rect width="100" height="100" fill="#ffffff" rx="2" />
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#080c14"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
