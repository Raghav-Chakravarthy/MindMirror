"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DropZone from "@/components/upload/DropZone";
import { Conversation } from "@/lib/types";
import { SAMPLE_RESULT } from "@/lib/sample-data";

type Step = "upload" | "parsing" | "analyzing" | "error";

const FEATURES = [
  { label: "Cognitive Fingerprint", desc: "6-axis personality radar", icon: "◈" },
  { label: "Brain Activation", desc: "TRIBE v2 fMRI predictions", icon: "◉" },
  { label: "Dependency Audit", desc: "Skills you're outsourcing", icon: "⚡" },
  { label: "Knowledge Edge", desc: "Your unique advantages", icon: "◆" },
];

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [streamPreview, setStreamPreview] = useState("");
  const [convCount, setConvCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const accumulatedRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleFiles(
    files: Array<{ filename: string; content: string; platform: "claude" | "openai" | "gemini" }>
  ) {
    try {
      setStep("parsing");
      setStatusMsg("Parsing conversation exports...");

      const allConversations: Conversation[] = [];
      for (const file of files) {
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(file),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        allConversations.push(...data.conversations);
      }

      if (allConversations.length === 0) {
        throw new Error("No conversations found in the uploaded files.");
      }

      setConvCount(allConversations.length);
      setStep("analyzing");
      setStatusMsg(`Analyzing ${allConversations.length} conversations...`);
      accumulatedRef.current = "";
      setStreamPreview("");

      const geminiPromise = fetch("/api/gemini-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversations: allConversations }),
      }).then((r) => r.json()).catch(() => null);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversations: allConversations }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              accumulatedRef.current += parsed.text;
              const preview = accumulatedRef.current.slice(-200);
              setStreamPreview(preview);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== payload) throw e;
          }
        }
      }

      const fullText = accumulatedRef.current
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let result;
      try {
        result = JSON.parse(fullText);
      } catch {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse analysis response. Please try again.");
        }
      }

      const requiredKeys = [
        "COGNITIVE_FINGERPRINT", "TOPICS", "DEPENDENCY_AUDIT",
        "UNCOMFORTABLE_QUESTIONS", "KNOWLEDGE_EDGE", "ARCHETYPE",
        "VERDICT", "SHAREABLE_CARD",
      ];
      const missing = requiredKeys.filter((k) => !(k in result));
      if (missing.length > 0) {
        throw new Error(`Incomplete analysis — missing: ${missing.join(", ")}. Please try again.`);
      }

      const geminiData = await geminiPromise;

      sessionStorage.setItem("mindmirror_result", JSON.stringify(result));
      sessionStorage.setItem(
        "mindmirror_conversations",
        JSON.stringify(allConversations)
      );
      if (geminiData?.topics) {
        sessionStorage.setItem("mindmirror_gemini", JSON.stringify(geminiData));
      }

      router.push("/analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden noise-bg">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/[0.03] blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-glow-pulse" style={{ boxShadow: '0 0 10px #7c3aed' }} />
          <span className="text-base font-bold tracking-[0.2em] text-white">
            MINDMIRROR
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-white/45 tracking-widest uppercase hidden sm:block">
            Cognitive Analysis Engine
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 relative z-10">
        {step === "upload" && (
          <div
            className="w-full max-w-3xl space-y-12"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Hero */}
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/25 bg-purple-500/8 text-sm text-purple-300 tracking-widest uppercase animate-slide-up">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                AI Conversation Analysis
              </div>
              <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight leading-[1.08]">
                <span className="gradient-text">What does your</span>
                <br />
                <span className="text-white">AI history say</span>
                <br />
                <span className="gradient-text">about you?</span>
              </h1>
              <p className="text-white/70 leading-relaxed max-w-xl mx-auto text-lg">
                Upload your conversation exports from Claude, ChatGPT, or Gemini.
                Get an uncomfortably accurate portrait of how you think, what you
                avoid, and what you&apos;re outsourcing to AI.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-white/55 hover:text-white/80 hover:border-white/[0.18] transition-all duration-300"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(10px)",
                    transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * 80}ms`,
                  }}
                >
                  <span className="text-purple-400/80">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Upload area */}
            <div className="glass rounded-2xl p-1 gradient-border">
              <DropZone onReady={handleFiles} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <span className="text-sm text-white/45 tracking-widest uppercase">or</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>

            {/* Demo button */}
            <button
              onClick={() => {
                sessionStorage.setItem("mindmirror_result", JSON.stringify(SAMPLE_RESULT));
                sessionStorage.setItem("mindmirror_conversations", "[]");
                router.push("/analysis");
              }}
              className="w-full glass rounded-2xl px-8 py-7 text-lg text-white/65 hover:text-white transition-all duration-500 group glow-hover press-effect"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center group-hover:border-purple-500/60 group-hover:bg-purple-500/10 transition-all duration-300">
                  <div className="w-0 h-0 border-l-[7px] border-l-purple-400/60 border-y-[5px] border-y-transparent ml-0.5 group-hover:border-l-purple-400 transition-colors" />
                </div>
                <span className="font-semibold group-hover:tracking-wider transition-all duration-300">
                  Try with sample data
                </span>
              </div>
              <span className="block text-sm text-white/50 mt-2">
                See a pre-analyzed developer profile — no upload needed
              </span>
            </button>

            {/* Export instructions */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { name: "Claude", steps: "Settings → Export Data", color: "#d97706" },
                { name: "ChatGPT", steps: "Data Controls → Export", color: "#10b981" },
                { name: "Gemini", steps: "Google Takeout → Gemini", color: "#3b82f6" },
              ].map((p) => (
                <div key={p.name} className="border border-white/[0.08] rounded-xl px-5 py-5 hover:border-white/[0.18] transition-all duration-300 group cursor-default">
                  <p className="text-sm font-bold tracking-wider mb-1 group-hover:tracking-widest transition-all duration-300" style={{ color: p.color }}>
                    {p.name}
                  </p>
                  <p className="text-sm text-white/55 leading-relaxed">{p.steps}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(step === "parsing" || step === "analyzing") && (
          <div className="w-full max-w-lg space-y-10 text-center animate-fade-in">
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 rounded-full bg-purple-500/15 animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 animate-pulse" />
                <div className="absolute inset-[38%] rounded-full bg-white/80" />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-white/80 text-base font-medium">{statusMsg}</p>
              {convCount > 0 && step === "analyzing" && (
                <p className="text-xs text-white/35 tracking-[0.2em] uppercase animate-slide-up">
                  {convCount} conversations · building cognitive profile
                </p>
              )}
            </div>

            {/* Progress stages */}
            <div className="flex items-center justify-center gap-2">
              {["Parse", "Analyze", "Profile"].map((stage, i) => {
                const isActive = (step === "parsing" && i === 0) || (step === "analyzing" && i <= 1);
                const isDone = (step === "analyzing" && i === 0);
                return (
                  <div key={stage} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                      isDone ? "bg-purple-500/30 text-purple-300" :
                      isActive ? "bg-purple-500/20 text-purple-400 animate-pulse" :
                      "bg-white/5 text-white/20"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] tracking-wider uppercase transition-colors duration-300 ${isActive ? "text-white/50" : "text-white/20"}`}>
                      {stage}
                    </span>
                    {i < 2 && <div className={`w-8 h-px transition-colors duration-500 ${isActive ? "bg-purple-500/30" : "bg-white/5"}`} />}
                  </div>
                );
              })}
            </div>

            <div className="text-left glass rounded-2xl p-6 h-48 flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <p className="text-xs text-purple-400/70 uppercase tracking-[0.15em] font-semibold">
                  Live Analysis
                </p>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto flex flex-col-reverse">
                  <p className="text-sm text-white/50 font-data leading-relaxed break-all whitespace-pre-wrap">
                    {streamPreview || <span className="text-white/20">Waiting for data...</span>}
                    <span className="inline-block w-[2px] h-4 bg-purple-400/80 ml-0.5 animate-pulse" />
                  </p>
                </div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[rgba(14,14,22,0.95)] to-transparent pointer-events-none z-10" />
              </div>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="max-w-md space-y-6 text-center animate-scale-in">
            <div className="glass rounded-2xl p-8 border-red-500/20 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <p className="text-base text-red-400">{error}</p>
            </div>
            <button
              onClick={() => { setStep("upload"); setError(null); }}
              className="text-sm text-white/40 hover:text-white transition-all duration-300 group flex items-center gap-2 mx-auto"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">&larr;</span>
              <span>Try again</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <span className="text-xs text-white/40">
          Built at Bitcamp 2026
        </span>
        <span className="text-xs text-white/40">
          Claude + Gemini + Three.js + TRIBE v2
        </span>
      </footer>
    </main>
  );
}
