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
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">Topics</h2>
        <span className="text-xs text-[#444]">{topics.length} identified</span>
      </div>

      <div className="space-y-2">
        {sorted.map((topic) => (
          <div
            key={topic.name}
            className="border border-[#1a1a1a] hover:border-[#333] p-4 cursor-default transition-colors group"
            onMouseEnter={() => onTopicHover(topic)}
            onMouseLeave={() => onTopicHover(null)}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider"
                  style={{
                    color: DOMAIN_COLORS[topic.domain],
                    border: `1px solid ${DOMAIN_COLORS[topic.domain]}44`,
                    background: `${DOMAIN_COLORS[topic.domain]}11`,
                  }}
                >
                  {topic.domain}
                </span>
                <span className="text-sm font-bold group-hover:text-white transition-colors">
                  {topic.name}
                </span>
                {topic.is_returning && (
                  <span className="text-[10px] text-[#555]">↺ returning</span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs text-[#666]">
                  {topic.count}×
                </span>
              </div>
            </div>

            {/* Count bar */}
            <div className="h-px bg-[#1a1a1a] mb-3">
              <div
                className="h-px transition-all"
                style={{
                  width: `${(topic.count / maxCount) * 100}%`,
                  backgroundColor: DOMAIN_COLORS[topic.domain],
                }}
              />
            </div>

            {/* Depth */}
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] text-[#555]">Depth</span>
              <div className="flex-1 h-px bg-[#1a1a1a]">
                <div
                  className="h-px bg-[#555]"
                  style={{ width: `${topic.depth_score}%` }}
                />
              </div>
              <span className="text-[10px] text-[#444]">{topic.depth_score}</span>
            </div>

            <p className="text-xs text-[#666] italic">{topic.verdict}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
