"use client";

interface Props {
  questions: string[];
}

export default function UncomfortableQuestions({ questions }: Props) {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3 flex items-baseline gap-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Uncomfortable Questions
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
      </div>
      <p className="text-xs text-[#444]">
        Questions your history raises that you probably haven&apos;t asked yourself.
      </p>

      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li
            key={i}
            className="flex gap-5 group border-l-2 border-[#1a1a1a] hover:border-[#ef4444] pl-5 py-2 transition-all duration-300"
          >
            <span className="text-xs text-[#333] pt-0.5 w-5 flex-shrink-0 font-mono group-hover:text-[#ef4444] transition-colors">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-[#999] leading-relaxed group-hover:text-white transition-colors duration-300">
              {q}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
