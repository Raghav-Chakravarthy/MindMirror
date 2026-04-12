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
    <section ref={sectionRef} className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
          Knowledge Edge
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-600/10 to-transparent" />
      </div>
      <p className="text-sm font-medium text-black/40 tracking-wide">
        Specific informational clusters that provide unique leverage.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {edges.map((edge, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm rounded-2xl px-6 py-6 flex items-start gap-5 transition-all duration-500 group hover:shadow-md relative overflow-hidden press-effect"
            style={{
              opacity: revealed.has(i) ? 1 : 0,
              transform: revealed.has(i) ? "translateX(0) scale(1)" : "translateX(-12px) scale(0.98)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.04), transparent 60%)" }}
            />
            <div className="relative mt-1 flex-shrink-0">
              <span className="text-emerald-600 text-lg group-hover:scale-110 transition-transform inline-block">◆</span>
            </div>
            <p className="text-lg font-bold text-black/60 leading-relaxed relative group-hover:text-black/80 transition-colors duration-300">
              {edge}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
