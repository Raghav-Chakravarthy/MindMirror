"use client";

interface Props {
  verdict: string;
}

export default function Verdict({ verdict }: Props) {
  return (
    <section className="space-y-4">
      <div className="border-b border-[#222] pb-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">Verdict</h2>
      </div>
      <p className="text-[#ccc] leading-loose text-sm max-w-2xl">{verdict}</p>
    </section>
  );
}
