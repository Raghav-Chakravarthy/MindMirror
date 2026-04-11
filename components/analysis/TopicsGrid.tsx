"use client";

import { Topic, TopicDomain } from "@/lib/types";

const DOMAIN_COLORS: Record<TopicDomain, string> = {
  ai: "#7c3aed",
  frontend: "#0ea5e9",
  backend: "#10b981",
  devops: "#f59e0b",
  design: "#ec4899",
  product: "#6366f1",
  other: "#6b7280",
};

interface Props {
  topics: Topic[];
  onTopicHover: (topic: Topic | null) => void;
}

export default function TopicsGrid({ topics, onTopicHover }: Props) {
  const sorted = [...topics].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count ?? 1;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500/60" />
          <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">Topics</h2>
          <div className="h-px w-16 bg-gradient-to-r from-cyan-500/20 to-transparent" />
        </div>
        <span className="text-xs text-white/35 font-data">{topics.length} identified</span>
      </div>

      <div className="space-y-3">
        {sorted.map((topic, idx) => {
          const domainColor = DOMAIN_COLORS[topic.domain];
          return (
            <div
              key={`${topic.name}-${idx}`}
              className="glass rounded-xl p-5 sm:p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden glow-hover"
              onMouseEnter={() => onTopicHover(topic)}
              onMouseLeave={() => onTopicHover(null)}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${domainColor}0d, transparent 60%)`,
                }}
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold rounded-full"
                      style={{
                        color: domainColor,
                        border: `1px solid ${domainColor}44`,
                        background: `${domainColor}15`,
                      }}
                    >
                      {topic.domain}
                    </span>
                    <span className="text-base font-semibold text-white/85 group-hover:text-white transition-colors duration-300">
                      {topic.name}
                    </span>
                    {topic.is_returning && (
                      <span className="text-xs text-white/35 flex items-center gap-1">
                        <span style={{ color: domainColor }}>&#x21BA;</span> returning
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-bold font-data" style={{ color: domainColor }}>
                      {topic.count}
                    </span>
                    <span className="text-xs text-white/30">&times;</span>
                  </div>
                </div>

                <div className="h-1 bg-white/[0.05] mb-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(topic.count / maxCount) * 100}%`,
                      background: `linear-gradient(to right, ${domainColor}88, ${domainColor})`,
                      boxShadow: `0 0 8px ${domainColor}44`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs text-white/40 w-12 font-semibold">DEPTH</span>
                  <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${topic.depth_score}%`,
                        background: topic.depth_score > 60
                          ? "linear-gradient(to right, #10b981, #34d399)"
                          : topic.depth_score > 30
                          ? "linear-gradient(to right, #3b82f6, #60a5fa)"
                          : "linear-gradient(to right, #ef4444, #f87171)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/40 font-data w-6 text-right">
                    {topic.depth_score}
                  </span>
                </div>

                <p className="text-sm text-white/50 italic leading-relaxed group-hover:text-white/75 transition-colors duration-300">
                  {topic.verdict}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
