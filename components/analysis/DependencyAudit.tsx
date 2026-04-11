"use client";

import { DependencyItem, DependencySeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<
  DependencySeverity,
  { label: string; color: string; bg: string; icon: string }
> = {
  habit: {
    label: "HABIT",
    color: "#f59e0b",
    bg: "#1a1200",
    icon: "~",
  },
  dependency: {
    label: "DEPENDENCY",
    color: "#ef4444",
    bg: "#1a0000",
    icon: "!",
  },
  atrophy: {
    label: "ATROPHY",
    color: "#dc2626",
    bg: "#200000",
    icon: "!!",
  },
};

interface Props {
  items: DependencyItem[];
}

export default function DependencyAudit({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline gap-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Dependency Audit
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
      </div>
      <p className="text-xs text-[#444]">
        Skills you may be outsourcing to AI instead of owning.
      </p>

      <div className="space-y-3">
        {items.map((item, i) => {
          const style = SEVERITY_STYLES[item.severity];
          return (
            <div
              key={i}
              className="border p-6 space-y-4 relative overflow-hidden group transition-all duration-300 hover:translate-x-1"
              style={{ borderColor: `${style.color}33`, background: style.bg }}
            >
              {/* Severity accent line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: style.color }}
              />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{item.topic}</span>
                <span
                  className="text-[10px] px-2 py-0.5 font-bold tracking-widest flex items-center gap-1.5"
                  style={{ color: style.color, border: `1px solid ${style.color}` }}
                >
                  <span className="text-[8px]">{style.icon}</span>
                  {style.label}
                </span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">{item.evidence}</p>
              <div className="border-t pt-4" style={{ borderColor: `${style.color}22` }}>
                <p className="text-xs text-[#666] italic leading-relaxed">
                  <span className="text-[#555] not-italic mr-1">Ask yourself:</span>
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
