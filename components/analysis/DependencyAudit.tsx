"use client";

import { DependencyItem, DependencySeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<
  DependencySeverity,
  { label: string; color: string; bg: string }
> = {
  habit: {
    label: "HABIT",
    color: "#f59e0b",
    bg: "#1a1200",
  },
  dependency: {
    label: "DEPENDENCY",
    color: "#ef4444",
    bg: "#1a0000",
  },
  atrophy: {
    label: "ATROPHY",
    color: "#dc2626",
    bg: "#200000",
  },
};

interface Props {
  items: DependencyItem[];
}

export default function DependencyAudit({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Dependency Audit
        </h2>
        <p className="text-xs text-[#444] mt-1">
          Skills you may be outsourcing to AI instead of owning.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const style = SEVERITY_STYLES[item.severity];
          return (
            <div
              key={i}
              className="border p-5 space-y-3"
              style={{ borderColor: `${style.color}33`, background: style.bg }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{item.topic}</span>
                <span
                  className="text-[10px] px-2 py-0.5 font-bold tracking-widest"
                  style={{ color: style.color, border: `1px solid ${style.color}` }}
                >
                  {style.label}
                </span>
              </div>
              <p className="text-xs text-[#888]">{item.evidence}</p>
              <div className="border-t pt-3" style={{ borderColor: `${style.color}22` }}>
                <p className="text-xs text-[#666] italic">
                  Ask yourself: {item.reclaim_prompt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
