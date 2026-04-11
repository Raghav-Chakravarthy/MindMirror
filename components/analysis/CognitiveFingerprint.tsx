"use client";

import { useEffect, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CognitiveFingerprint as CFType } from "@/lib/types";

const LABELS: Record<keyof CFType, string> = {
  systems_thinking: "Systems Thinking",
  pattern_seeking: "Pattern Seeking",
  first_principles: "First Principles",
  execution_speed: "Execution Speed",
  depth_vs_breadth: "Depth vs Breadth",
  uncertainty_tolerance: "Uncertainty Tolerance",
};

const SHORT_LABELS: Record<keyof CFType, string> = {
  systems_thinking: "Systems",
  pattern_seeking: "Patterns",
  first_principles: "Principles",
  execution_speed: "Execution",
  depth_vs_breadth: "Depth",
  uncertainty_tolerance: "Uncertainty",
};

interface Props {
  fingerprint: CFType;
}

function getBarColor(value: number): string {
  if (value > 70) return "#7c3aed";
  if (value > 40) return "#3b82f6";
  return "#ef4444";
}

function getBarGradient(value: number): string {
  if (value > 70) return "linear-gradient(to right, #7c3aed, #a78bfa)";
  if (value > 40) return "linear-gradient(to right, #3b82f6, #60a5fa)";
  return "linear-gradient(to right, #ef4444, #f87171)";
}

export default function CognitiveFingerprint({ fingerprint }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const data = (Object.entries(fingerprint) as [keyof CFType, number][]).map(
    ([key, value]) => ({ dimension: SHORT_LABELS[key], value, fullMark: 100 })
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-purple-500/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Cognitive Fingerprint
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              />
              <Radar
                name="You"
                dataKey="value"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10, 10, 15, 0.95)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#e8e8e8",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6 py-2">
          {(Object.entries(fingerprint) as [keyof CFType, number][]).map(
            ([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-white/60">{LABELS[key]}</span>
                  <span className="text-sm text-white/80 font-data font-bold">{value}</span>
                </div>
                <div className="h-2 bg-white/[0.05] relative overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animated ? `${value}%` : "0%",
                      background: getBarGradient(value),
                      boxShadow: value > 70 ? `0 0 10px ${getBarColor(value)}44` : "none",
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
