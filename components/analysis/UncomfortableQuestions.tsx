"use client";

interface Props {
  questions: string[];
}

export default function UncomfortableQuestions({ questions }: Props) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-red-400/60" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 font-bold">
          Uncomfortable Questions
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-400/20 to-transparent" />
      </div>
      <p className="text-sm text-white/45">
        Questions your history raises that you probably haven&apos;t asked yourself.
      </p>

      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li
            key={i}
            className="glass rounded-xl flex gap-5 group pl-0 pr-6 py-5 transition-all duration-300 glow-hover overflow-hidden"
          >
            <div className="w-14 flex-shrink-0 flex items-center justify-center border-r border-white/[0.06]">
              <span className="text-sm text-white/25 font-data font-bold group-hover:text-red-400/80 transition-colors duration-300">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-base text-white/65 leading-relaxed group-hover:text-white/90 transition-colors duration-300 py-0.5">
              {q}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
