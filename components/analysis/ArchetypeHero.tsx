"use client";

import { Archetype } from "@/lib/types";

interface Props {
  archetype: Archetype;
}

export default function ArchetypeHero({ archetype }: Props) {
  return (
    <div
      className="border p-8 space-y-4"
      style={{ borderColor: archetype.color, boxShadow: `0 0 40px ${archetype.color}22` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#666] tracking-widest uppercase mb-2">
            Your Archetype
          </p>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: archetype.color }}
          >
            {archetype.name}
          </h1>
        </div>
        <div
          className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: archetype.color }}
        />
      </div>
      <p className="text-[#aaa] text-lg leading-relaxed max-w-2xl">
        {archetype.tagline}
      </p>
    </div>
  );
}
