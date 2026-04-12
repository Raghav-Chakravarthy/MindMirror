"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function AnalysisPage() {
  const router = useRouter();
  const [result, setResult] = useState<MindMirrorResult | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [geminiData, setGeminiData] = useState<Record<string, unknown> | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("mindmirror_result");
    const rawConvs = sessionStorage.getItem("mindmirror_conversations");
    const rawGemini = sessionStorage.getItem("mindmirror_gemini");
    if (!raw) {
      router.replace("/");
      return;
    }
    const parsed: MindMirrorResult = JSON.parse(raw);
    setResult(parsed);
    if (rawConvs) setConversations(JSON.parse(rawConvs));
    if (rawGemini) setGeminiData(JSON.parse(rawGemini));

    if (parsed.TOPICS?.length) {
      const topicNames = parsed.TOPICS.map((t) => t.name);
      fetch("/api/brain/warmup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: topicNames }),
      }).catch(() => { });
    }
  }, [router]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-4 rounded-full bg-purple-500/20 animate-pulse" />
          <div className="absolute inset-[38%] rounded-full bg-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen noise-bg">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${scrollProgress * 100}%`,
            background: `linear-gradient(to right, ${result.ARCHETYPE.color}, #ec4899)`,
            boxShadow: `0 0 10px ${result.ARCHETYPE.color}66`,
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-4 flex items-center justify-between sticky top-0 bg-[#050508]/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full animate-glow-pulse" style={{ backgroundColor: result.ARCHETYPE.color, boxShadow: `0 0 10px ${result.ARCHETYPE.color}` }} />
          <span className="text-base font-bold tracking-[0.2em] text-white">
            MINDMIRROR
          </span>
          <span className="text-sm text-white/55 ml-2 hidden sm:block">
            / {result.ARCHETYPE.name}
          </span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-white/55 hover:text-white transition-all duration-300 flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300">&larr;</span>
          <span>New Analysis</span>
        </button>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-10 py-16 space-y-28">
        <RevealSection>
          <ArchetypeHero archetype={result.ARCHETYPE} />
        </RevealSection>

        <RevealSection delay={100}>
          <Verdict verdict={result.VERDICT} />
        </RevealSection>

        <RevealSection delay={100}>
          <CognitiveFingerprint fingerprint={result.COGNITIVE_FINGERPRINT} />
        </RevealSection>

        <RevealSection>
          <BrainViewer
            activeTopic={activeTopic}
            topics={result.TOPICS}
            onTopicSelect={setActiveTopic}
          />
        </RevealSection>

        <RevealSection>
          <TopicsGrid
            topics={result.TOPICS}
            activeTopic={activeTopic}
            onTopicSelect={setActiveTopic}
          />
        </RevealSection>

        <RevealSection>
          <DependencyAudit items={result.DEPENDENCY_AUDIT} />
        </RevealSection>

        <RevealSection>
          <UncomfortableQuestions questions={result.UNCOMFORTABLE_QUESTIONS} />
        </RevealSection>

        <RevealSection>
          <KnowledgeEdge edges={result.KNOWLEDGE_EDGE} />
        </RevealSection>

        {geminiData && (
          <RevealSection>
            <GeminiInsights data={geminiData as any} />
          </RevealSection>
        )}

        <RevealSection>
          <ShareableCard card={result.SHAREABLE_CARD} />
        </RevealSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xs text-white/40">Built at Bitcamp 2026</span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40">Claude + Gemini + Three.js + TRIBE v2</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span className="text-xs text-white/30 font-data">{conversations.length} conversations analyzed</span>
        </div>
      </footer>
    </div>
  );
}
