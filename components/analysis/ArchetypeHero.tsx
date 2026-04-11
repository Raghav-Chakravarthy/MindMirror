"use client";

import { useEffect, useState } from "react";
import { Archetype } from "@/lib/types";

interface Props {
  archetype: Archetype;
}

export default function ArchetypeHero({ archetype }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute -inset-20 blur-[80px] transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${archetype.color}, transparent 70%)`,
          opacity: mounted ? 0.12 : 0,
        }}
      />

      <div
        className="relative border rounded-2xl p-10 sm:p-14 space-y-6"
        style={{
          borderColor: `${archetype.color}33`,
          background: `linear-gradient(135deg, ${archetype.color}0a, transparent 60%)`,
        }}
      >
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(to right, ${archetype.color}33, transparent)` }} />

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-700"
              style={{
                color: archetype.color,
                border: `1px solid ${archetype.color}33`,
                background: `${archetype.color}0d`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: archetype.color }} />
              Your Archetype
            </div>
            <h1
              className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[0.95] transition-all duration-1000"
              style={{
                color: archetype.color,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transitionDelay: "100ms",
              }}
            >
              {archetype.name}
            </h1>
          </div>
          <div className="flex flex-col items-center gap-3 mt-2">
            <div
              className="w-5 h-5 rounded-full animate-glow-pulse"
              style={{ backgroundColor: archetype.color, boxShadow: `0 0 24px ${archetype.color}88, 0 0 60px ${archetype.color}33` }}
            />
            <div
              className="w-px transition-all duration-1000"
              style={{
                background: `linear-gradient(to bottom, ${archetype.color}66, transparent)`,
                height: mounted ? "64px" : "0px",
                transitionDelay: "300ms",
              }}
            />
          </div>
        </div>
        <p
          className="text-white/75 text-xl leading-relaxed max-w-2xl transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "200ms",
          }}
        >
          {archetype.tagline}
        </p>

        <div className="pt-4 flex gap-[2px] overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: archetype.color,
                opacity: mounted ? 0.08 + (i / 40) * 0.5 : 0,
                transitionDelay: `${300 + i * 20}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
