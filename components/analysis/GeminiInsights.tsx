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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-blue-500/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Gemini Topic Extraction
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
        <span className="text-xs text-white/30 font-data">
          Gemini 2.0 Flash
        </span>
      </div>

      {data.primary_domain && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/45">Primary Domain:</span>
          <span
            className="px-3 py-1 font-bold uppercase tracking-wider text-xs rounded-full"
            style={{
              color: CATEGORY_COLORS[data.primary_domain] ?? "#6b7280",
              border: `1px solid ${(CATEGORY_COLORS[data.primary_domain] ?? "#6b7280")}44`,
              background: `${(CATEGORY_COLORS[data.primary_domain] ?? "#6b7280")}15`,
            }}
          >
            {data.primary_domain}
          </span>
          {data.curiosity_breadth && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-white/45">Breadth:</span>
              <span className="text-white/65">{data.curiosity_breadth}</span>
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
                className="glass rounded-lg px-3.5 py-2 group hover:translate-y-[-1px] transition-all duration-200"
                style={{
                  borderColor: `${color}33`,
                  background: `${color}0d`,
                }}
              >
                <span className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                  {topic.name}
                </span>
                <span className="text-xs text-white/30 ml-2 font-data">
                  ~{topic.count}&times;
                </span>
              </div>
            );
          })}
        </div>
      )}

      {data.patterns && data.patterns.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-white/35 uppercase tracking-[0.2em] font-bold">Patterns Detected</p>
          {data.patterns.map((pattern, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm text-white/55 leading-relaxed"
            >
              <span className="text-blue-400/50 mt-0.5">&#x25B8;</span>
              <span>{pattern}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
