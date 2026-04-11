"use client";

import { useEffect, useState, useRef } from "react";
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

function getBarGradient(value: number): string {
  if (value > 70) return "linear-gradient(to right, #7c3aed, #a78bfa)";
  if (value > 40) return "linear-gradient(to right, #3b82f6, #60a5fa)";
  return "linear-gradient(to right, #ef4444, #f87171)";
}

function getBarColor(value: number): string {
  if (value > 70) return "#7c3aed";
  if (value > 40) return "#3b82f6";
  return "#ef4444";
}

function getLabel(value: number): string {
  if (value > 80) return "Exceptional";
  if (value > 60) return "Strong";
  if (value > 40) return "Moderate";
  if (value > 20) return "Developing";
  return "Low";
}

export default function CognitiveFingerprint({ fingerprint }: Props) {
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 300);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = (Object.entries(fingerprint) as [keyof CFType, number][]).map(
    ([key, value]) => ({ dimension: SHORT_LABELS[key], value, fullMark: 100 })
  );

  return (
    <section ref={sectionRef} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-purple-500/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Cognitive Fingerprint
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6 h-80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/10" />
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
                fillOpacity={animated ? 0.15 : 0}
                strokeWidth={2}
                dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10, 10, 15, 0.95)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#e8e8e8",
                  backdropFilter: "blur(8px)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-5 py-2">
          {(Object.entries(fingerprint) as [keyof CFType, number][]).map(
            ([key, value], idx) => (
              <div
                key={key}
                className="space-y-2 transition-all duration-500"
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? "translateX(0)" : "translateX(12px)",
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-white/60">{LABELS[key]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{getLabel(value)}</span>
                    <span className="text-sm text-white/80 font-data font-bold">{value}</span>
                  </div>
                </div>
                <div className="h-2 bg-white/[0.05] relative overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: animated ? `${value}%` : "0%",
                      background: getBarGradient(value),
                      boxShadow: value > 70 ? `0 0 10px ${getBarColor(value)}44` : "none",
                      transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${300 + idx * 100}ms`,
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
