"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DropZone from "@/components/upload/DropZone";
import { Conversation } from "@/lib/types";

type Step = "upload" | "parsing" | "analyzing" | "error";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

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

      setStep("analyzing");
      setStatusMsg(
        `Analyzing ${allConversations.length} conversations. This may take 20–30 seconds...`
      );

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversations: allConversations }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.setItem("mindmirror_result", JSON.stringify(data.result));
      sessionStorage.setItem(
        "mindmirror_conversations",
        JSON.stringify(allConversations)
      );

      router.push("/analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
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
                We'll analyze them and give you an uncomfortable but accurate
                portrait of how you think.
              </p>
            </div>
            <DropZone onReady={handleFiles} />
            <div className="text-xs text-[#555] space-y-1">
              <p>Claude: Settings → Export Data → conversations.json or .jsonl</p>
              <p>ChatGPT: Settings → Data Controls → Export → conversations.json inside ZIP</p>
              <p>Gemini: Google Takeout → Gemini → JSON files inside ZIP</p>
            </div>
          </div>
        )}

        {(step === "parsing" || step === "analyzing") && (
          <div className="space-y-6 text-center max-w-md">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:200ms]" />
              <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:400ms]" />
            </div>
            <p className="text-[#888] text-sm">{statusMsg}</p>
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
