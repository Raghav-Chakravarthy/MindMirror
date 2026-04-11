"use client";

interface Props {
  verdict: string;
}

export default function Verdict({ verdict }: Props) {
  const sentences = verdict.split(/(?<=\.)\s+/);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">Verdict</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
      </div>
      <div className="glass rounded-2xl p-8 sm:p-10 space-y-5 max-w-4xl">
        {sentences.map((sentence, i) => (
          <p
            key={i}
            className="leading-[1.85] text-base"
            style={{
              color: i === sentences.length - 1 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)',
              fontWeight: i === sentences.length - 1 ? 600 : 400,
            }}
          >
            {sentence}
          </p>
        ))}
      </div>
    </section>
  );
}
