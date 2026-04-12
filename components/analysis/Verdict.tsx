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
    <section ref={sectionRef} className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
        <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
          The Verdict
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-600/10 to-transparent" />
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm rounded-3xl p-10 sm:p-14 space-y-10 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10" />
        
        <div className="relative z-10 space-y-6">
          {sentences.map((sentence, i) => {
            const isHighlight = sentence.toLowerCase().includes("see what you actually know");
            const isLast = i === sentences.length - 1;
            
            return (
              <p
                key={i}
                className={`text-lg sm:text-xl leading-relaxed transition-all duration-700 ${
                  isHighlight ? "text-center text-purple-600 font-bold" : "text-left"
                }`}
                style={{
                  opacity: i < visibleCount ? 1 : 0,
                  transform: i < visibleCount ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: `${i * 100}ms`,
                  color: isHighlight ? undefined : isLast ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
                  fontWeight: isHighlight ? 700 : isLast ? 700 : 450,
                }}
              >
                {sentence}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
