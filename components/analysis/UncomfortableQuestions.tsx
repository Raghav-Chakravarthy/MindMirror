"use client";

interface Props {
  questions: string[];
}

export default function UncomfortableQuestions({ questions }: Props) {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#222] pb-3">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#555]">
          Uncomfortable Questions
        </h2>
        <p className="text-xs text-[#444] mt-1">
          Questions your history raises that you probably haven't asked yourself.
        </p>
      </div>

      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-5 group">
            <span className="text-xs text-[#333] pt-0.5 w-5 flex-shrink-0 font-mono">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-[#aaa] leading-relaxed group-hover:text-white transition-colors">
              {q}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
