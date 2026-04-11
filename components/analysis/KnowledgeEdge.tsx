"use client";

interface Props {
  edges: string[];
}

export default function KnowledgeEdge({ edges }: Props) {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline gap-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Knowledge Edge
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
      </div>
      <p className="text-xs text-[#444]">
        Unusual knowledge areas that give you a competitive advantage.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {edges.map((edge, i) => (
          <div
            key={i}
            className="border border-[#1a1a1a] px-6 py-5 flex items-start gap-4 hover:border-[#10b981] transition-all duration-300 group relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(135deg, #10b98108, transparent 60%)" }}
            />
            <span className="text-[#10b981] text-sm mt-0.5 relative">&#x25C6;</span>
            <p className="text-sm text-[#ccc] leading-relaxed relative group-hover:text-white transition-colors">
              {edge}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
