"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DropZone from "@/components/upload/DropZone";
import { Conversation } from "@/lib/types";
import { SAMPLE_RESULT } from "@/lib/sample-data";

type Step = "upload" | "parsing" | "analyzing" | "error";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [streamPreview, setStreamPreview] = useState("");
  const [convCount, setConvCount] = useState(0);
  const accumulatedRef = useRef("");

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

      // Fire Gemini topic extraction in parallel (non-blocking)
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

      // Collect Gemini results (already running in parallel)
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
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[#222] px-8 py-5 flex items-center justify-between">
        <div>
          <span className="text-xs text-[#555] tracking-[0.3em] uppercase">
            ░░
          </span>
          <span className="text-sm font-bold tracking-[0.2em] ml-2">
            MINDMIRROR
          </span>
        </div>
        <span className="text-xs text-[#555]">
          Cognitive analysis from AI conversation history
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        {step === "upload" && (
          <div className="w-full max-w-2xl space-y-10">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">
                What does your AI history say about you?
              </h1>
              <p className="text-[#888] leading-relaxed">
                Upload your conversation exports from Claude, ChatGPT, or Gemini.
                We&apos;ll analyze them and give you an uncomfortable but accurate
                portrait of how you think.
              </p>
            </div>
            <DropZone onReady={handleFiles} />

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#222]" />
              <span className="text-[10px] text-[#444] tracking-widest uppercase">or</span>
              <div className="h-px flex-1 bg-[#222]" />
            </div>

            <button
              onClick={() => {
                sessionStorage.setItem("mindmirror_result", JSON.stringify(SAMPLE_RESULT));
                sessionStorage.setItem("mindmirror_conversations", "[]");
                router.push("/analysis");
              }}
              className="w-full border border-[#333] hover:border-[#555] px-6 py-4 text-sm text-[#888] hover:text-white transition-all group"
            >
              <span className="group-hover:tracking-wider transition-all">
                Try with sample data
              </span>
              <span className="block text-[10px] text-[#444] mt-1">
                See what MindMirror looks like with a pre-analyzed developer profile
              </span>
            </button>

            <div className="text-xs text-[#555] space-y-1">
              <p>Claude: Settings &rarr; Export Data &rarr; conversations.json or .jsonl</p>
              <p>ChatGPT: Settings &rarr; Data Controls &rarr; Export &rarr; conversations.json inside ZIP</p>
              <p>Gemini: Google Takeout &rarr; Gemini &rarr; JSON files inside ZIP</p>
            </div>
          </div>
        )}

        {(step === "parsing" || step === "analyzing") && (
          <div className="w-full max-w-lg space-y-8 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse [animation-delay:400ms]" />
              </div>
              <p className="text-[#888] text-sm">{statusMsg}</p>
              {convCount > 0 && step === "analyzing" && (
                <p className="text-[10px] text-[#444] tracking-widest uppercase">
                  {convCount} conversations &middot; building your cognitive profile
                </p>
              )}
            </div>

            {streamPreview && (
              <div className="text-left border border-[#1a1a1a] bg-[#0d0d0d] p-4 overflow-hidden">
                <p className="text-[10px] text-[#333] uppercase tracking-widest mb-3">
                  Live Analysis
                </p>
                <p className="text-xs text-[#555] font-mono leading-relaxed break-all whitespace-pre-wrap">
                  {streamPreview}
                  <span className="inline-block w-1.5 h-3 bg-white/60 ml-0.5 animate-pulse" />
                </p>
              </div>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="max-w-md space-y-6 text-center">
            <p className="text-sm text-[#ff4444] border border-[#ff2222] bg-[#1a0000] px-6 py-4">
              {error}
            </p>
            <button
              onClick={() => { setStep("upload"); setError(null); }}
              className="text-xs text-[#888] underline hover:text-white"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
