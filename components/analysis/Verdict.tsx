"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  verdict: string;
}

export default function Verdict({ verdict }: Props) {
  const sentences = verdict.split(/(?<=\.)\s+/);
  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= sentences.length) clearInterval(interval);
          }, 400);
          observer.unobserve(el);
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentences.length]);

  return (
    <section ref={sectionRef} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">Verdict</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
      </div>
      <div className="glass rounded-2xl p-8 sm:p-10 space-y-5 max-w-4xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent" />
        {sentences.map((sentence, i) => (
          <p
            key={i}
            className="leading-[1.85] text-base transition-all duration-700"
            style={{
              color: i === sentences.length - 1 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)',
              fontWeight: i === sentences.length - 1 ? 600 : 400,
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            {sentence}
          </p>
        ))}
      </div>
    </section>
  );
}
