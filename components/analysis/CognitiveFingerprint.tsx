"use client";

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
  systems_thinking: "Systems",
  pattern_seeking: "Patterns",
  first_principles: "First Principles",
  execution_speed: "Execution",
  depth_vs_breadth: "Depth",
  uncertainty_tolerance: "Uncertainty",
};

interface Props {
  fingerprint: CFType;
}

export default function CognitiveFingerprint({ fingerprint }: Props) {
  const data = (Object.entries(fingerprint) as [keyof CFType, number][]).map(
    ([key, value]) => ({ dimension: LABELS[key], value, fullMark: 100 })
  );

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Cognitive Fingerprint
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Radar */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <PolarGrid stroke="#222" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#666", fontSize: 10, fontFamily: "Courier New" }}
              />
              <Radar
                name="You"
                dataKey="value"
                stroke="#ffffff"
                fill="#ffffff"
                fillOpacity={0.08}
                strokeWidth={1.5}
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

        {/* Score bars */}
        <div className="space-y-3 py-2">
          {(Object.entries(fingerprint) as [keyof CFType, number][]).map(
            ([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#888]">{LABELS[key]}</span>
                  <span className="text-[#555]">{value}</span>
                </div>
                <div className="h-px bg-[#1a1a1a] relative">
                  <div
                    className="h-px bg-white absolute top-0 left-0 transition-all"
                    style={{ width: `${value}%` }}
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
