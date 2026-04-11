"use client";

import { useRef } from "react";
import { ShareableCard as CardType } from "@/lib/types";

interface Props {
  card: CardType;
}

export default function ShareableCard({ card }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    // Dynamically import html2canvas to keep initial bundle light
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "mindmirror-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline justify-between">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Shareable Card
        </h2>
        <button
          onClick={handleDownload}
          className="text-xs text-[#555] hover:text-white transition-colors"
        >
          ↓ Download PNG
        </button>
      </div>

      {/* The card itself */}
      <div
        ref={cardRef}
        className="border border-[#222] p-8 space-y-6 max-w-md"
        style={{
          boxShadow: `0 0 60px ${card.archetype.color}15`,
          borderColor: `${card.archetype.color}44`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] text-[#444] uppercase">
            ░░ MINDMIRROR
          </span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: card.archetype.color }}
          />
        </div>

        {/* Headline */}
        <p className="text-xl font-bold leading-snug">{card.headline}</p>

        {/* Stat */}
        <div className="border-l-2 pl-4" style={{ borderColor: card.archetype.color }}>
          <p className="text-sm text-[#888]">{card.stat}</p>
        </div>

        {/* Pull quote */}
        <p className="text-xs text-[#666] italic leading-relaxed">
          "{card.pull_quote}"
        </p>

        {/* Archetype */}
        <div className="border-t border-[#1a1a1a] pt-4 flex items-center justify-between">
          <span
            className="text-sm font-bold tracking-wide"
            style={{ color: card.archetype.color }}
          >
            {card.archetype.name}
          </span>
          <span className="text-[10px] text-[#444]">mindmirror.ai</span>
        </div>
      </div>
    </section>
  );
}
