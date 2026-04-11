"use client";

import { Archetype } from "@/lib/types";

interface Props {
  archetype: Archetype;
}

export default function ArchetypeHero({ archetype }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute -inset-10 opacity-[0.07] blur-3xl"
        style={{ background: `radial-gradient(ellipse at center, ${archetype.color}, transparent 70%)` }}
      />

      <div
        className="relative border p-10 space-y-5"
        style={{
          borderColor: `${archetype.color}44`,
          boxShadow: `0 0 80px ${archetype.color}15, inset 0 1px 0 ${archetype.color}22`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#555] tracking-[0.4em] uppercase mb-3">
              Your Archetype
            </p>
            <h1
              className="text-5xl font-bold tracking-tight leading-none"
              style={{ color: archetype.color }}
            >
              {archetype.name}
            </h1>
          </div>
          <div className="flex flex-col items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded-full animate-glow-pulse"
              style={{ backgroundColor: archetype.color, boxShadow: `0 0 12px ${archetype.color}` }}
            />
            <div
              className="w-px h-8"
              style={{ background: `linear-gradient(to bottom, ${archetype.color}44, transparent)` }}
            />
          </div>
        </div>
        <p className="text-[#999] text-lg leading-relaxed max-w-2xl">
          {archetype.tagline}
        </p>

        {/* Decorative bottom bar */}
        <div className="pt-4 flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-px flex-1"
              style={{
                backgroundColor: archetype.color,
                opacity: 0.1 + (i / 20) * 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
