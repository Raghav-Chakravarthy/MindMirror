"use client";

interface Props {
  verdict: string;
}

export default function Verdict({ verdict }: Props) {
  const sentences = verdict.split(/(?<=\.)\s+/);

  return (
    <section className="space-y-5">
      <div className="border-b border-[#222] pb-3 flex items-baseline gap-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">Verdict</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
      </div>
      <div className="space-y-3 max-w-2xl">
        {sentences.map((sentence, i) => (
          <p
            key={i}
            className="text-[#ccc] leading-loose text-sm"
            style={{
              opacity: 0.7 + (i === sentences.length - 1 ? 0.3 : 0),
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
