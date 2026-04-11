"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MindMirrorResult, Conversation, Topic } from "@/lib/types";
import ArchetypeHero from "@/components/analysis/ArchetypeHero";
import CognitiveFingerprint from "@/components/analysis/CognitiveFingerprint";
import TopicsGrid from "@/components/analysis/TopicsGrid";
import DependencyAudit from "@/components/analysis/DependencyAudit";
import UncomfortableQuestions from "@/components/analysis/UncomfortableQuestions";
import KnowledgeEdge from "@/components/analysis/KnowledgeEdge";
import Verdict from "@/components/analysis/Verdict";
import ShareableCard from "@/components/analysis/ShareableCard";
import GeminiInsights from "@/components/analysis/GeminiInsights";

const BrainViewer = dynamic(() => import("@/components/analysis/BrainViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl border border-purple-500/10 flex items-center justify-center bg-[#08080f]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
        <p className="text-sm text-white/30">Loading brain viewer...</p>
      </div>
    </div>
  ),
});

export default function AnalysisPage() {
  const router = useRouter();
  const [result, setResult] = useState<MindMirrorResult | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [geminiData, setGeminiData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mindmirror_result");
    const rawConvs = sessionStorage.getItem("mindmirror_conversations");
    const rawGemini = sessionStorage.getItem("mindmirror_gemini");
    if (!raw) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(raw));
    if (rawConvs) setConversations(JSON.parse(rawConvs));
    if (rawGemini) setGeminiData(JSON.parse(rawGemini));
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-4 flex items-center justify-between sticky top-0 bg-[#050508]/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full animate-glow-pulse" style={{ backgroundColor: result.ARCHETYPE.color, boxShadow: `0 0 10px ${result.ARCHETYPE.color}` }} />
          <span className="text-base font-bold tracking-[0.2em] text-white">
            MINDMIRROR
          </span>
          <span className="text-sm text-white/40 ml-2 hidden sm:block">
            / {result.ARCHETYPE.name}
          </span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
          <span>&larr;</span> New Analysis
        </button>
      </header>

      {/* Single column content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-16 space-y-24 stagger-children">
        <ArchetypeHero archetype={result.ARCHETYPE} />

        <Verdict verdict={result.VERDICT} />

        <CognitiveFingerprint fingerprint={result.COGNITIVE_FINGERPRINT} />

        {/* Brain Activation — the hero visualization */}
        <BrainViewer
          activeTopic={activeTopic}
          topics={result.TOPICS}
          onTopicSelect={setActiveTopic}
        />

        <TopicsGrid
          topics={result.TOPICS}
          onTopicHover={setActiveTopic}
        />

        <DependencyAudit items={result.DEPENDENCY_AUDIT} />

        <UncomfortableQuestions questions={result.UNCOMFORTABLE_QUESTIONS} />

        <KnowledgeEdge edges={result.KNOWLEDGE_EDGE} />

        {geminiData && <GeminiInsights data={geminiData as any} />}

        <ShareableCard card={result.SHAREABLE_CARD} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-xs text-white/25">Built at Bitcamp 2026</span>
        <span className="text-xs text-white/25">Claude + Gemini + Three.js + TRIBE v2</span>
      </footer>
    </div>
  );
}
