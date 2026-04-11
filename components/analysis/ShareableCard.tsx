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
      backgroundColor: "#050508",
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
      backgroundColor: "#050508",
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-pink-500/60" />
          <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
            Shareable Card
          </h2>
          <div className="h-px w-16 bg-gradient-to-r from-pink-500/20 to-transparent" />
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCopyImage}
            className="text-xs text-white/40 hover:text-white transition-colors tracking-wider font-bold uppercase"
          >
            {copied ? "Copied!" : "Copy Image"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs text-white/40 hover:text-white transition-colors tracking-wider font-bold uppercase"
          >
            Download PNG
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="rounded-2xl p-10 sm:p-12 space-y-8 w-[480px] relative overflow-hidden"
          style={{
            boxShadow: `0 0 80px ${card.archetype.color}18, 0 0 30px ${card.archetype.color}0c`,
            border: `1px solid ${card.archetype.color}33`,
            background: `linear-gradient(135deg, #050508, ${card.archetype.color}0c)`,
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-60 h-60 opacity-[0.08] blur-[60px] pointer-events-none"
            style={{ background: card.archetype.color }}
          />

          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500/70" />
              <span className="text-xs tracking-[0.2em] text-white/40 uppercase font-bold">
                MINDMIRROR
              </span>
            </div>
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                backgroundColor: card.archetype.color,
                boxShadow: `0 0 14px ${card.archetype.color}88`,
              }}
            />
          </div>

          <p className="text-2xl font-bold leading-snug tracking-tight relative text-white/95">
            {card.headline}
          </p>

          <div
            className="border-l-2 pl-5 py-1 relative"
            style={{ borderColor: card.archetype.color }}
          >
            <p className="text-base text-white/60">{card.stat}</p>
          </div>

          <p className="text-sm text-white/45 italic leading-relaxed relative">
            &ldquo;{card.pull_quote}&rdquo;
          </p>

          <div className="border-t border-white/[0.08] pt-5 flex items-center justify-between relative">
            <div>
              <span
                className="text-base font-bold tracking-wide"
                style={{ color: card.archetype.color }}
              >
                {card.archetype.name}
              </span>
              <p className="text-xs text-white/35 mt-1 max-w-[260px]">
                {card.archetype.tagline}
              </p>
            </div>
            <span className="text-xs text-white/20">mindmirror.dev</span>
          </div>

          <div className="absolute top-3 left-3 w-4 h-4 border-l border-t pointer-events-none rounded-tl" style={{ borderColor: `${card.archetype.color}33` }} />
          <div className="absolute top-3 right-3 w-4 h-4 border-r border-t pointer-events-none rounded-tr" style={{ borderColor: `${card.archetype.color}33` }} />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b pointer-events-none rounded-bl" style={{ borderColor: `${card.archetype.color}33` }} />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b pointer-events-none rounded-br" style={{ borderColor: `${card.archetype.color}33` }} />
        </div>
      </div>

      <p className="text-center text-xs text-white/25">
        Share your cognitive profile — #MindMirror
      </p>
    </section>
  );
}
