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
    <section className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
          Gemini Signal Extraction
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-blue-600/10 to-transparent" />
        <span className="text-[10px] font-black tracking-widest text-blue-600/40 uppercase">
          Gemini 2.0 Flash
        </span>
      </div>

      {data.primary_domain && (
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Primary Domain</span>
            <span
              className="px-3 py-1 font-black uppercase tracking-widest text-[10px] rounded-lg shadow-sm"
              style={{
                color: CATEGORY_COLORS[data.primary_domain] ?? "#6b7280",
                border: `1.5px solid ${(CATEGORY_COLORS[data.primary_domain] ?? "#6b7280")}22`,
                background: `${(CATEGORY_COLORS[data.primary_domain] ?? "#6b7280")}0d`,
              }}
            >
              {data.primary_domain}
            </span>
          </div>
          {data.curiosity_breadth && (
            <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Breadth</span>
              <span className="text-sm font-bold text-black/60">{data.curiosity_breadth}</span>
            </div>
          )}
        </div>
      )}

      {data.topics && data.topics.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.topics.slice(0, 15).map((topic, i) => {
            const color = CATEGORY_COLORS[topic.category] ?? "#6b7280";
            return (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 group cursor-default"
                style={{
                  borderColor: `${color}15`,
                }}
              >
                <span className="text-sm font-bold text-black/70 group-hover:text-black transition-colors">
                  {topic.name}
                </span>
                <span className="text-[10px] text-black/20 ml-2 font-black tracking-tighter">
                  {topic.count}&times;
                </span>
              </div>
            );
          })}
        </div>
      )}

      {data.patterns && data.patterns.length > 0 && (
        <div className="bg-white/40 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 space-y-5">
          <p className="text-[10px] text-black/30 uppercase tracking-[0.2em] font-black">Synthesized Patterns</p>
          <div className="grid grid-cols-1 gap-4">
            {data.patterns.map((pattern, i) => (
              <div
                key={i}
                className="flex items-start gap-4 text-base text-black/60 font-medium leading-relaxed"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30 mt-2 flex-shrink-0" />
                <span>{pattern}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
