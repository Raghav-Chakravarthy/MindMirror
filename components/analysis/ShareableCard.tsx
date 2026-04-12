"use client";

import { useRef, useState } from "react";
import { ShareableCard as CardType } from "@/lib/types";

interface Props {
  card: CardType;
}

export default function ShareableCard({ card }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#ffffff",
      scale: 3,
    });
    const link = document.createElement("a");
    link.download = "mindmirror-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloading(false);
  }

  async function handleCopyImage() {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#ffffff",
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
    <section className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-600" />
          <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
            Shareable Card
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-pink-600/10 to-transparent" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyImage}
            className="text-[10px] px-5 py-2.5 rounded-full border border-gray-100 text-black/40 hover:text-black hover:border-black/20 hover:bg-black/[0.02] transition-all duration-300 tracking-widest font-black uppercase shadow-sm"
          >
            {copied ? "✓ Copied!" : "Copy Image"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-[10px] px-5 py-2.5 rounded-full border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:border-purple-200 transition-all duration-300 tracking-widest font-black uppercase shadow-sm disabled:opacity-50"
          >
            {downloading ? "Exporting..." : "Download PNG"}
          </button>
        </div>
      </div>

      <div className="flex justify-center p-4">
        <div
          ref={cardRef}
          className="bg-white rounded-[2.5rem] p-12 sm:p-16 space-y-10 w-[540px] relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] border border-gray-100"
          style={{
            boxShadow: `0 40px 100px -20px ${card.archetype.color}15, 0 20px 40px -10px rgba(0,0,0,0.05)`,
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.05] blur-[80px] pointer-events-none"
            style={{ background: card.archetype.color }}
          />

          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: card.archetype.color }} />
              <span className="text-sm tracking-[0.4em] text-black font-black uppercase">
                MINDMIRROR
              </span>
            </div>
          </div>

          <p className="text-4xl font-black leading-[1.1] tracking-tight relative text-black">
            {card.headline}
          </p>

          <div
            className="border-l-[3px] pl-6 py-1 relative"
            style={{ borderColor: card.archetype.color }}
          >
            <p className="text-xl font-bold text-black/70 tracking-tight">{card.stat}</p>
          </div>

          <p className="text-lg text-black/40 italic leading-relaxed relative font-medium">
            &ldquo;{card.pull_quote}&rdquo;
          </p>

          <div className="border-t border-gray-100 pt-8 flex items-center justify-between relative">
            <div>
              <span
                className="text-xl font-black tracking-tight"
                style={{ color: card.archetype.color }}
              >
                {card.archetype.name}
              </span>
              <p className="text-[11px] font-bold text-black/30 mt-2 max-w-[300px] uppercase tracking-widest">
                {card.archetype.tagline}
              </p>
            </div>
            <span className="text-[10px] font-black tracking-widest text-black/10 uppercase">mindmirror.dev</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-black/15">
        Share your cognitive profile — #MindMirror
      </p>
    </section>
  );
}
