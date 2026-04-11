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

export default function CognitiveFingerprint({ fingerprint }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const data = (Object.entries(fingerprint) as [keyof CFType, number][]).map(
    ([key, value]) => ({ dimension: SHORT_LABELS[key], value, fullMark: 100 })
  );

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline gap-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Cognitive Fingerprint
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#1a1a1a" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#555", fontSize: 10, fontFamily: "Courier New" }}
              />
              <Radar
                name="You"
                dataKey="value"
                stroke="#ffffff"
                fill="#ffffff"
                fillOpacity={0.06}
                strokeWidth={1.5}
                dot={{ r: 3, fill: "#fff", strokeWidth: 0 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: 0,
                  fontSize: 11,
                  fontFamily: "Courier New",
                  color: "#e8e8e8",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 py-2">
          {(Object.entries(fingerprint) as [keyof CFType, number][]).map(
            ([key, value]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#777]">{LABELS[key]}</span>
                  <span className="text-[#555] tabular-nums">{value}</span>
                </div>
                <div className="h-1 bg-[#111] relative overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animated ? `${value}%` : "0%",
                      background: value > 70
                        ? "linear-gradient(to right, #10b981, #34d399)"
                        : value > 40
                        ? "linear-gradient(to right, #555, #888)"
                        : "linear-gradient(to right, #ef4444, #f87171)",
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
