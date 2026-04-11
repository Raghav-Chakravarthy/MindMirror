"use client";

interface Props {
  edges: string[];
}

export default function KnowledgeEdge({ edges }: Props) {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Knowledge Edge
        </h2>
        <p className="text-xs text-[#444] mt-1">
          Unusual knowledge areas that give you a competitive advantage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {edges.map((edge, i) => (
          <div
            key={i}
            className="border border-[#1a1a1a] px-5 py-4 flex items-start gap-4 hover:border-[#333] transition-colors"
          >
            <span className="text-[#333] text-sm mt-0.5">◆</span>
            <p className="text-sm text-[#ccc] leading-relaxed">{edge}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
