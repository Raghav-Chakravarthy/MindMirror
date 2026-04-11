"use client";

interface Props {
  edges: string[];
}

export default function KnowledgeEdge({ edges }: Props) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Knowledge Edge
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
      </div>
      <p className="text-sm text-white/45">
        Unusual knowledge areas that give you a competitive advantage.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {edges.map((edge, i) => (
          <div
            key={i}
            className="glass rounded-xl px-6 py-5 flex items-start gap-4 transition-all duration-300 group glow-hover relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06), transparent 60%)" }}
            />
            <span className="text-emerald-400 text-base mt-0.5 relative group-hover:text-emerald-300 transition-colors">&#x25C6;</span>
            <p className="text-base text-white/65 leading-relaxed relative group-hover:text-white/90 transition-colors duration-300">
              {edge}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
