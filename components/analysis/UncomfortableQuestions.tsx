"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  questions: string[];
}

export default function UncomfortableQuestions({ questions }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          questions.forEach((_, i) => {
            setTimeout(() => {
              setRevealed((prev) => new Set(prev).add(i));
            }, i * 200);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [questions]);

  return (
    <section ref={sectionRef} className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
        <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
          Uncomfortable Questions
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-600/10 to-transparent" />
      </div>
      <p className="text-sm font-medium text-black/40 tracking-wide">
        Provocations derived from your interaction history.
      </p>

      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm rounded-2xl flex gap-6 group pl-0 pr-8 py-6 transition-all duration-500 hover:shadow-md overflow-hidden press-effect"
            style={{
              opacity: revealed.has(i) ? 1 : 0,
              transform: revealed.has(i) ? "translateX(0)" : "translateX(-16px)",
              transitionDelay: `${i * 50}ms`,
            }}
          >
            <div className="w-16 flex-shrink-0 flex items-center justify-center border-r border-gray-100/50">
              <span className="text-base text-black/20 font-black font-data group-hover:text-red-500 transition-colors duration-300">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-lg font-bold text-black/60 leading-relaxed group-hover:text-black/80 transition-colors duration-300 py-1">
              {q}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
