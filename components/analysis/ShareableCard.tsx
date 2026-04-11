"use client";

import { useRef, useState } from "react";
import { ShareableCard as CardType } from "@/lib/types";

interface Props {
  card: CardType;
}

export default function ShareableCard({ card }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 3,
    });
    const link = document.createElement("a");
    link.download = "mindmirror-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleCopyImage() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 3,
    });
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        handleDownload();
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
            Shareable Card
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent w-20" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyImage}
            className="text-xs text-[#555] hover:text-white transition-colors"
          >
            {copied ? "Copied!" : "Copy image"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs text-[#555] hover:text-white transition-colors"
          >
            &#x2193; Download PNG
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="border p-10 space-y-8 w-[440px] relative overflow-hidden"
          style={{
            boxShadow: `0 0 100px ${card.archetype.color}12, 0 0 40px ${card.archetype.color}08`,
            borderColor: `${card.archetype.color}33`,
            background: "#0a0a0a",
          }}
        >
          {/* Background gradient */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 opacity-[0.06] blur-3xl pointer-events-none"
            style={{ background: card.archetype.color }}
          />

          {/* Header */}
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.3em] text-[#444] uppercase">
                &#x2591;&#x2591; MINDMIRROR
              </span>
            </div>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: card.archetype.color,
                boxShadow: `0 0 8px ${card.archetype.color}`,
              }}
            />
          </div>

          {/* Headline */}
          <p className="text-2xl font-bold leading-snug tracking-tight relative">
            {card.headline}
          </p>

          {/* Stat */}
          <div
            className="border-l-2 pl-5 py-1 relative"
            style={{ borderColor: card.archetype.color }}
          >
            <p className="text-sm text-[#888]">{card.stat}</p>
          </div>

          {/* Pull quote */}
          <p className="text-xs text-[#666] italic leading-relaxed relative">
            &ldquo;{card.pull_quote}&rdquo;
          </p>

          {/* Archetype footer */}
          <div className="border-t border-[#1a1a1a] pt-5 flex items-center justify-between relative">
            <div>
              <span
                className="text-sm font-bold tracking-wide"
                style={{ color: card.archetype.color }}
              >
                {card.archetype.name}
              </span>
              <p className="text-[10px] text-[#444] mt-0.5 max-w-[250px]">
                {card.archetype.tagline}
              </p>
            </div>
            <span className="text-[10px] text-[#333]">mindmirror.dev</span>
          </div>

          {/* Decorative corner marks */}
          <div className="absolute top-3 left-3 w-3 h-3 border-l border-t pointer-events-none" style={{ borderColor: `${card.archetype.color}33` }} />
          <div className="absolute top-3 right-3 w-3 h-3 border-r border-t pointer-events-none" style={{ borderColor: `${card.archetype.color}33` }} />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b pointer-events-none" style={{ borderColor: `${card.archetype.color}33` }} />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b pointer-events-none" style={{ borderColor: `${card.archetype.color}33` }} />
        </div>
      </div>

      <p className="text-center text-[10px] text-[#333]">
        Share your cognitive profile &#x2014; tag #MindMirror
      </p>
    </section>
  );
}
