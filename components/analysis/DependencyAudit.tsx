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
    <section ref={sectionRef} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Dependency Audit
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent" />
      </div>
      <p className="text-sm text-white/45">
        Skills you may be outsourcing to AI instead of owning.
      </p>

      <div className="space-y-3">
        {items.map((item, i) => {
          const style = SEVERITY_STYLES[item.severity];
          return (
            <div
              key={i}
              className="glass rounded-xl p-6 sm:p-7 space-y-4 relative overflow-hidden group transition-all duration-500 glow-hover press-effect"
              style={{
                borderColor: `${style.color}20`,
                opacity: revealed.has(i) ? 1 : 0,
                transform: revealed.has(i) ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full transition-all duration-500"
                style={{
                  backgroundColor: style.color,
                  boxShadow: revealed.has(i) ? `0 0 8px ${style.color}44` : "none",
                }}
              />

              <div className="flex items-center justify-between pl-3">
                <span className="text-base font-semibold text-white/90">{item.topic}</span>
                <span
                  className="text-[10px] px-3 py-1 font-bold tracking-widest flex items-center gap-1.5 rounded-full transition-all duration-300 group-hover:scale-105"
                  style={{ color: style.color, border: `1px solid ${style.color}44`, background: `${style.color}15` }}
                >
                  <span>{style.icon}</span>
                  {style.label}
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed pl-3">{item.evidence}</p>
              <div className="border-t pt-4 pl-3" style={{ borderColor: `${style.color}15` }}>
                <p className="text-sm text-white/50 italic leading-relaxed">
                  <span className="text-white/35 not-italic mr-1 font-semibold">Ask yourself:</span>
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
