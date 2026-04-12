"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DropZone from "@/components/upload/DropZone";
import { Conversation } from "@/lib/types";
import { SAMPLE_RESULT } from "@/lib/sample-data";
import HeroBrain from "@/components/landing/HeroBrain";
import TypingSlogan from "@/components/landing/TypingSlogan";

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
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white text-black selection:bg-purple-100 selection:text-purple-900 transition-colors duration-1000">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroBrain />
        
        <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.3)]" />
            <span className="text-sm font-bold tracking-[0.3em] text-black">
              MINDMIRROR
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-black/40 tracking-[0.2em] uppercase font-bold hidden sm:block">
              Cognitive Analysis Engine
            </span>
          </div>
        </header>

        <div className="relative z-10 text-center space-y-8 px-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-sm font-bold tracking-[0.4em] uppercase text-purple-600/60 animate-fade-in">
              The AI Self-Reflection Tool
            </h1>
            <TypingSlogan />
          </div>

          <div className="pt-8">
            <button
              onClick={scrollToUpload}
              className="group flex flex-col items-center gap-4 mx-auto animate-bounce transition-opacity hover:opacity-100 opacity-60"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40 group-hover:text-purple-600 transition-colors">
                Scroll to Begin
              </span>
              <div className="w-px h-12 bg-gradient-to-b from-purple-600/40 to-transparent" />
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section 
        ref={uploadSectionRef}
        className="relative z-10 min-h-screen bg-white px-8 py-24 flex flex-col items-center"
      >
        {step === "upload" && (
          <div className="w-full max-w-4xl space-y-20">
            {/* Intro Text */}
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black flex flex-col gap-2">
                <span>Who are you</span>
                <span className="text-purple-600">when nobody is watching?</span>
              </h2>
              <p className="text-black/60 text-lg leading-relaxed">
                Upload your conversation exports from Claude, ChatGPT, or Gemini. 
                Our engine extracts your latent thinking patterns, biases, and skills 
                to build a high-resolution cognitive profile.
              </p>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="px-5 py-2.5 rounded-full bg-gray-50 border border-gray-100 text-sm font-semibold text-black/70 hover:border-purple-200 hover:bg-purple-50/50 hover:text-purple-700 transition-all duration-300"
                >
                  <span className="text-purple-400 mr-2">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white border border-gray-100 rounded-2xl p-8 h-full shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    Upload Conversations
                  </h3>
                  <DropZone onReady={handleFiles} />
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      { name: "Claude", color: "#d97706" },
                      { name: "ChatGPT", color: "#10b981" },
                      { name: "Gemini", color: "#3b82f6" },
                    ].map((p) => (
                      <div key={p.name} className="text-center p-2 rounded-lg bg-gray-50/50">
                        <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: p.color }}>{p.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample Card */}
              <button
                onClick={() => {
                  sessionStorage.setItem("mindmirror_result", JSON.stringify(SAMPLE_RESULT));
                  sessionStorage.setItem("mindmirror_conversations", "[]");
                  router.push("/analysis");
                }}
                className="group relative text-left"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white border border-gray-100 rounded-2xl p-8 h-full shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      View Sample Data
                    </h3>
                    <p className="text-black/50 text-sm leading-relaxed">
                      Don&apos;t have your data ready? See exactly what we can uncover 
                      using a pre-analyzed developer profile.
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white font-bold text-sm tracking-wide">
                      Try Demo Analysis
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {(step === "parsing" || step === "analyzing") && (
          <div className="w-full max-w-2xl py-20 space-y-12 animate-fade-in">
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border border-purple-100 animate-ping" />
                <div className="absolute inset-4 rounded-full border-2 border-purple-500/20 border-t-purple-600 animate-spin" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] font-bold tracking-widest text-purple-600">
                  {step === "parsing" ? "PARSING" : "ANALYZING"}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-black">{statusMsg}</p>
                {convCount > 0 && (
                  <p className="text-sm text-black/40 font-medium">
                    {convCount} distinct conversation threads identified
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-black/40">
                  Neural Stream Insight
                </span>
              </div>
              <div className="h-40 overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col-reverse">
                  <p className="text-sm text-black/60 font-data leading-relaxed break-all whitespace-pre-wrap">
                    {streamPreview || "Awaiting signal..."}
                    <span className="inline-block w-1.5 h-3 bg-purple-500 ml-1 animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="w-full max-w-lg py-20 text-center space-y-8 animate-scale-in">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <p className="text-red-900 font-bold">{error}</p>
            </div>
            <button
              onClick={() => { setStep("upload"); setError(null); }}
              className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-24 w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-50 pt-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-black/30 uppercase">
            Built at Bitcamp 2026
          </span>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold tracking-[0.2em] text-black/30 uppercase">
              TRIBE v2 · fsaverage5
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}
