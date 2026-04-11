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
      <div className="border-b border-[#222] pb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">Topics</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent w-20" />
        </div>
        <span className="text-xs text-[#444]">{topics.length} identified</span>
      </div>

      <div className="space-y-2 stagger-children">
        {sorted.map((topic, idx) => {
          const domainColor = DOMAIN_COLORS[topic.domain];
          return (
            <div
              key={`${topic.name}-${idx}`}
              className="border border-[#1a1a1a] hover:border-[#333] p-5 cursor-default transition-all duration-300 group relative overflow-hidden"
              onMouseEnter={() => onTopicHover(topic)}
              onMouseLeave={() => onTopicHover(null)}
              style={{
                animationDelay: `${idx * 60}ms`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${domainColor}08, transparent 60%)`,
                }}
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold"
                      style={{
                        color: domainColor,
                        border: `1px solid ${domainColor}44`,
                        background: `${domainColor}11`,
                      }}
                    >
                      {topic.domain}
                    </span>
                    <span className="text-sm font-bold group-hover:text-white transition-colors">
                      {topic.name}
                    </span>
                    {topic.is_returning && (
                      <span className="text-[10px] text-[#555] flex items-center gap-1">
                        <span style={{ color: domainColor }}>&#x21BA;</span> returning
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color: domainColor }}>
                      {topic.count}
                    </span>
                    <span className="text-xs text-[#444]">&times;</span>
                  </div>
                </div>

                {/* Count bar */}
                <div className="h-0.5 bg-[#111] mb-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(topic.count / maxCount) * 100}%`,
                      background: `linear-gradient(to right, ${domainColor}88, ${domainColor})`,
                    }}
                  />
                </div>

                {/* Depth */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] text-[#555] w-10">Depth</span>
                  <div className="flex-1 h-0.5 bg-[#111] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${topic.depth_score}%`,
                        background: topic.depth_score > 60
                          ? "linear-gradient(to right, #10b981, #34d399)"
                          : topic.depth_score > 30
                          ? "linear-gradient(to right, #555, #777)"
                          : "linear-gradient(to right, #ef4444, #f87171)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#444] tabular-nums w-6 text-right">
                    {topic.depth_score}
                  </span>
                </div>

                <p className="text-xs text-[#666] italic leading-relaxed group-hover:text-[#888] transition-colors">
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
