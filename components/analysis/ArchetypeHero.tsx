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
        className="relative border rounded-3xl p-10 sm:p-14 space-y-8 shadow-sm transition-shadow duration-500 hover:shadow-md"
        style={{
          borderColor: `${archetype.color}22`,
          background: `rgba(255, 255, 255, 0.5)`,
        }}
      >
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(to right, ${archetype.color}44, transparent)` }} />

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-700"
              style={{
                color: archetype.color,
                border: `1.5px solid ${archetype.color}22`,
                background: `${archetype.color}08`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: archetype.color }} />
              Your Archetype
            </div>
            <h1
              className="text-6xl sm:text-8xl font-black tracking-tight leading-[0.9] transition-all duration-1000"
              style={{
                color: '#000',
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transitionDelay: "100ms",
              }}
            >
              {archetype.name}
            </h1>
          </div>
          <div className="flex flex-col items-center gap-4 mt-2">
            <div
              className="w-5 h-5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.05)]"
              style={{ backgroundColor: archetype.color, border: '4px solid white' }}
            />
            <div
              className="w-px transition-all duration-1000"
              style={{
                background: `linear-gradient(to bottom, ${archetype.color}44, transparent)`,
                height: mounted ? "80px" : "0px",
                transitionDelay: "300ms",
              }}
            />
          </div>
        </div>
        <p
          className="text-black/60 text-2xl font-medium leading-relaxed max-w-2xl transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "200ms",
          }}
        >
          {archetype.tagline}
        </p>

        <div className="pt-6 flex gap-[3px] overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: archetype.color,
                opacity: mounted ? 0.05 + (i / 40) * 0.3 : 0,
                transitionDelay: `${300 + i * 15}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
