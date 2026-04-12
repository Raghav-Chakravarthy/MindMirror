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
    <section ref={sectionRef} className="space-y-10 flex flex-col items-center">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">The Verdict</h2>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
        </div>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
      
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl p-10 sm:p-14 space-y-8 max-w-4xl text-center shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent" />
        {sentences.map((sentence, i) => (
          <p
            key={i}
            className="leading-[1.9] text-xl transition-all duration-700"
            style={{
              color: i === sentences.length - 1 ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)',
              fontWeight: i === sentences.length - 1 ? 700 : 450,
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${i * 120}ms`,
            }}
          >
            {sentence}
          </p>
        ))}
      </div>
    </section>
  );
}
