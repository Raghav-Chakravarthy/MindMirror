"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  edges: string[];
}

export default function KnowledgeEdge({ edges }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          edges.forEach((_, i) => {
            setTimeout(() => {
              setRevealed((prev) => new Set(prev).add(i));
            }, i * 150);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [edges]);

  return (
    <section ref={sectionRef} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Knowledge Edge
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
      </div>
      <p className="text-sm text-white/45">
        Unusual knowledge areas that give you a competitive advantage.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {edges.map((edge, i) => (
          <div
            key={i}
            className="glass rounded-xl px-6 py-5 flex items-start gap-4 transition-all duration-500 group glow-hover relative overflow-hidden press-effect"
            style={{
              opacity: revealed.has(i) ? 1 : 0,
              transform: revealed.has(i) ? "translateX(0) scale(1)" : "translateX(-12px) scale(0.98)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06), transparent 60%)" }}
            />
            <div className="relative mt-1 flex-shrink-0">
              <span className="text-emerald-400 text-sm group-hover:text-emerald-300 transition-colors">◆</span>
              <div className="absolute inset-0 bg-emerald-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <p className="text-base text-white/65 leading-relaxed relative group-hover:text-white/90 transition-colors duration-300">
              {edge}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
