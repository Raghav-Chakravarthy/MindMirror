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

// Three.js brain viewer — browser only, no SSR
const BrainSidebar = dynamic(() => import("@/components/analysis/BrainSidebar"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-[#444] text-xs">
      Loading brain viewer...
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
        <div className="text-[#555] text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-5 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <div>
          <span className="text-xs text-[#555] tracking-[0.3em]">░░</span>
          <span className="text-sm font-bold tracking-[0.2em] ml-2">MINDMIRROR</span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-[#555] hover:text-white transition-colors"
        >
          ← New Analysis
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-12 space-y-16 stagger-children">
            <ArchetypeHero archetype={result.ARCHETYPE} />
            <Verdict verdict={result.VERDICT} />
            <CognitiveFingerprint fingerprint={result.COGNITIVE_FINGERPRINT} />
            <TopicsGrid
              topics={result.TOPICS}
              onTopicHover={setActiveTopic}
            />
            <DependencyAudit items={result.DEPENDENCY_AUDIT} />
            <UncomfortableQuestions questions={result.UNCOMFORTABLE_QUESTIONS} />
            <KnowledgeEdge edges={result.KNOWLEDGE_EDGE} />
            {geminiData && <GeminiInsights data={geminiData as any} />}
            <ShareableCard card={result.SHAREABLE_CARD} />
          </div>
        </main>

        {/* Brain sidebar */}
        <aside className="w-80 border-l border-[#222] flex flex-col sticky top-[57px] h-[calc(100vh-57px)]">
          <div className="px-4 py-3 border-b border-[#222]">
            <p className="text-xs text-[#555] uppercase tracking-widest">
              Brain Activation
            </p>
            {activeTopic && (
              <p className="text-xs text-[#888] mt-1 truncate">
                {activeTopic.name}
              </p>
            )}
          </div>
          <div className="flex-1">
            <BrainSidebar activeTopic={activeTopic} />
          </div>
          <div className="px-4 py-3 border-t border-[#222]">
            <p className="text-[10px] text-[#444] leading-relaxed">
              Neural activation via Meta TRIBE v2 when available. Hover a topic to see which brain regions activate.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
