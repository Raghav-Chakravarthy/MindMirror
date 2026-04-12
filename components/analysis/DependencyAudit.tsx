"use client";

import { useEffect, useState, useRef } from "react";
import { DependencyItem, DependencySeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<
  DependencySeverity,
  { label: string; color: string; icon: string }
> = {
  habit: { label: "HABIT", color: "#f59e0b", icon: "~" },
  dependency: { label: "DEPENDENCY", color: "#ef4444", icon: "!" },
  atrophy: { label: "ATROPHY", color: "#dc2626", icon: "!!" },
};

interface Props {
  items: DependencyItem[];
}

export default function DependencyAudit({ items }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((_, i) => {
            setTimeout(() => {
              setRevealed((prev) => new Set(prev).add(i));
            }, i * 150);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <section ref={sectionRef} className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
        <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
          Dependency Audit
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-600/10 to-transparent" />
      </div>
      <p className="text-sm font-medium text-black/40 tracking-wide">
        Specific cognitive skills you may be outsourcing to AI models.
      </p>

      <div className="space-y-4">
        {items.map((item, i) => {
          const style = SEVERITY_STYLES[item.severity];
          return (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-7 sm:p-9 space-y-5 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden press-effect"
              style={{
                borderColor: `${style.color}15`,
                opacity: revealed.has(i) ? 1 : 0,
                transform: revealed.has(i) ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[4px] rounded-full transition-all duration-500"
                style={{
                  backgroundColor: style.color,
                  boxShadow: revealed.has(i) ? `0 0 12px ${style.color}22` : "none",
                }}
              />

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-black">{item.topic}</span>
                <span
                  className="text-[10px] px-3 py-1 font-black tracking-widest flex items-center gap-2 rounded-lg transition-all duration-300 group-hover:scale-105 shadow-sm"
                  style={{ color: style.color, border: `1.5px solid ${style.color}22`, background: `${style.color}0d` }}
                >
                  <span>{style.icon}</span>
                  {style.label}
                </span>
              </div>
              <p className="text-base text-black/60 font-medium leading-relaxed">{item.evidence}</p>
              <div className="border-t pt-5 mt-2" style={{ borderColor: `${style.color}0d` }}>
                <p className="text-base text-black/50 italic leading-relaxed">
                  <span className="text-black/30 not-italic mr-2 font-black uppercase text-[10px] tracking-widest">Self-Audit</span>
                  {item.reclaim_prompt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
