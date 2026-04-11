"use client";

interface GeminiTopic {
  name: string;
  count: number;
  category: string;
}

interface GeminiData {
  topics?: GeminiTopic[];
  patterns?: string[];
  primary_domain?: string;
  curiosity_breadth?: string;
}

interface Props {
  data: GeminiData;
}

const CATEGORY_COLORS: Record<string, string> = {
  ai: "#7c3aed",
  frontend: "#0ea5e9",
  backend: "#10b981",
  devops: "#f59e0b",
  design: "#ec4899",
  product: "#6366f1",
  other: "#6b7280",
};

export default function GeminiInsights({ data }: Props) {
  if (!data.topics?.length && !data.patterns?.length) return null;

  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline gap-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Gemini Topic Extraction
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
        <span className="text-[10px] text-[#333] tracking-wider">
          powered by Gemini 2.0 Flash
        </span>
      </div>

      {data.primary_domain && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#555]">Primary Domain:</span>
          <span
            className="px-2 py-0.5 font-bold uppercase tracking-wider text-[10px]"
            style={{
              color: CATEGORY_COLORS[data.primary_domain] ?? "#6b7280",
              border: `1px solid ${CATEGORY_COLORS[data.primary_domain] ?? "#6b7280"}44`,
              background: `${CATEGORY_COLORS[data.primary_domain] ?? "#6b7280"}11`,
            }}
          >
            {data.primary_domain}
          </span>
          {data.curiosity_breadth && (
            <>
              <span className="text-[#333]">|</span>
              <span className="text-[#555]">Breadth:</span>
              <span className="text-[#888]">{data.curiosity_breadth}</span>
            </>
          )}
        </div>
      )}

      {data.topics && data.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.topics.slice(0, 15).map((topic, i) => {
            const color = CATEGORY_COLORS[topic.category] ?? "#6b7280";
            return (
              <div
                key={i}
                className="border px-3 py-2 group hover:translate-y-[-1px] transition-all duration-200"
                style={{
                  borderColor: `${color}33`,
                  background: `${color}08`,
                }}
              >
                <span className="text-xs font-bold text-[#ccc] group-hover:text-white transition-colors">
                  {topic.name}
                </span>
                <span className="text-[10px] text-[#555] ml-2">
                  ~{topic.count}&#xd7;
                </span>
              </div>
            );
          })}
        </div>
      )}

      {data.patterns && data.patterns.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-[#444] uppercase tracking-widest">Patterns Detected</p>
          {data.patterns.map((pattern, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-xs text-[#777] leading-relaxed"
            >
              <span className="text-[#333] mt-0.5">&#x25B8;</span>
              <span>{pattern}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
