"use client";

import { useEffect, useState, useRef } from "react";
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
  activeTopic: Topic | null;
  onTopicSelect: (topic: Topic | null) => void;
}

export default function TopicsGrid({ topics, activeTopic, onTopicSelect }: Props) {
  const sorted = [...topics].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count ?? 1;
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 200);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
          <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">Key Topics</h2>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-600/10 to-transparent" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-black/20 uppercase">{topics.length} topics identified</span>
      </div>

      <div className="space-y-4">
        {sorted.map((topic, idx) => {
          const domainColor = DOMAIN_COLORS[topic.domain];
          const isActive = activeTopic?.name === topic.name;
          return (
            <div
              key={`${topic.name}-${idx}`}
              className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 sm:p-8 cursor-pointer shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden press-effect"
              onClick={() => onTopicSelect(isActive ? null : topic)}
              style={{
                borderColor: isActive ? `${domainColor}44` : undefined,
                opacity: animated ? 1 : 0,
                transform: animated ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 60}ms`,
              }}
            >
              <div
                className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${domainColor}08, transparent 60%)`,
                  opacity: isActive ? 1 : 0,
                }}
              />
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-full" style={{ backgroundColor: domainColor }} />
              )}

              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span
                      className="text-[10px] px-2.5 py-1 uppercase tracking-[0.2em] font-black rounded-lg transition-all duration-300 group-hover:scale-105"
                      style={{
                        color: domainColor,
                        border: `1.5px solid ${domainColor}22`,
                        background: `${domainColor}0d`,
                      }}
                    >
                      {topic.domain}
                    </span>
                    <span className="text-xl font-bold text-black group-hover:text-purple-700 transition-colors duration-300">
                      {topic.name}
                    </span>
                    {topic.is_returning && (
                      <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span style={{ color: domainColor }}>&#x21BA;</span> returning theme
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-black font-data" style={{ color: domainColor }}>
                      {topic.count}
                    </span>
                    <span className="text-xs text-black/20 font-bold ml-1">&times;</span>
                  </div>
                </div>

                <div className="h-2 bg-black/[0.03] mb-5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: animated ? `${(topic.count / maxCount) * 100}%` : "0%",
                      background: `linear-gradient(to right, ${domainColor}66, ${domainColor})`,
                      boxShadow: `0 0 12px ${domainColor}22`,
                      transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${300 + idx * 60}ms`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-6 mb-5">
                  <span className="text-[10px] font-black tracking-widest text-black/40 w-16">DEPTH Map</span>
                  <div className="flex-1 h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: animated ? `${topic.depth_score}%` : "0%",
                        background: topic.depth_score > 60
                          ? "linear-gradient(to right, #059669, #10b981)"
                          : topic.depth_score > 30
                          ? "linear-gradient(to right, #2563eb, #3b82f6)"
                          : "linear-gradient(to right, #dc2626, #ef4444)",
                        transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${500 + idx * 60}ms`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-black font-data font-black text-right min-w-[32px]">
                    {topic.depth_score}%
                  </span>
                </div>

                <p className="text-base text-black/60 italic leading-relaxed font-medium group-hover:text-black/80 transition-colors duration-300">
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
