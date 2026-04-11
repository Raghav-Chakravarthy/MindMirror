"use client";

import { useCallback, useState } from "react";
import JSZip from "jszip";

type Platform = "claude" | "openai" | "gemini";

interface FilePayload {
  filename: string;
  content: string;
  platform: Platform;
}

interface Props {
  onReady: (files: FilePayload[]) => void;
}

function looksLikeChatGPTItem(item: Record<string, unknown>): boolean {
  if (item.mapping && typeof item.mapping === "object") return true;
  if (item.conversation_id && typeof item.title === "string") return true;
  if (typeof item.title === "string" && typeof item.create_time === "number" && item.mapping !== undefined) return true;
  return false;
}

function detectPlatform(filename: string, content: string): Platform | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".jsonl")) return "claude";
  if (lower.includes("gemini") && lower.endsWith(".json")) return "gemini";
  if (lower.endsWith(".json")) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sample = parsed.slice(0, Math.min(5, parsed.length));
        if (sample.some((item: Record<string, unknown>) => looksLikeChatGPTItem(item))) return "openai";
        if (sample.some((item: Record<string, unknown>) => item?.chat_messages)) return "claude";
        if (sample.some((item: Record<string, unknown>) => item?.entries || item?.conversations)) return "gemini";
      }
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        if (looksLikeChatGPTItem(parsed)) return "openai";
        if (parsed.chat_messages) return "claude";
        if (parsed.entries || parsed.conversations) return "gemini";
      }
    } catch {
      return "claude";
    }
  }
  return null;
}

function isConversationFile(filename: string, content: string): Platform | null {
  const lower = filename.toLowerCase();
  const basename = lower.split("/").pop() ?? "";
  if (basename.startsWith(".") || !basename.endsWith(".json")) return null;

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0) {
        const sample = parsed.slice(0, Math.min(5, parsed.length));
        if (sample.some((item: Record<string, unknown>) => looksLikeChatGPTItem(item))) return "openai";
        if (sample.some((item: Record<string, unknown>) => item?.chat_messages)) return "claude";
        if (sample.some((item: Record<string, unknown>) => item?.entries || item?.conversations)) return "gemini";
      }
    } else if (typeof parsed === "object") {
      if (looksLikeChatGPTItem(parsed)) return "openai";
      if (parsed.chat_messages) return "claude";
      if (parsed.entries || parsed.conversations) return "gemini";
    }
  } catch {
    // not valid JSON
  }
  return null;
}

async function extractFromZip(file: File): Promise<FilePayload[]> {
  const zip = await JSZip.loadAsync(file);
  const payloads: FilePayload[] = [];

  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    const lower = path.toLowerCase();
    if (!lower.endsWith(".json") && !lower.endsWith(".jsonl")) continue;

    const content = await zipEntry.async("string");

    if (lower.endsWith(".jsonl")) {
      payloads.push({ filename: path, content, platform: "claude" });
      continue;
    }

    const platform = isConversationFile(path, content);
    if (platform) {
      payloads.push({ filename: path, content, platform });
    }
  }

  return payloads;
}

export default function DropZone({ onReady }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<string[]>([]);

  const processFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      const payloads: FilePayload[] = [];
      const names: string[] = [];

      for (const file of files) {
        if (file.name.endsWith(".zip")) {
          const extracted = await extractFromZip(file);
          if (extracted.length === 0) {
            setError(`No recognizable conversations found in ${file.name}.`);
            return;
          }
          payloads.push(...extracted);
          const platforms = [...new Set(extracted.map((e) => e.platform))];
          names.push(`${file.name} → ${platforms.join(", ")}`);
        } else {
          const content = await file.text();
          const platform = detectPlatform(file.name, content);
          if (!platform) {
            setError(`Cannot detect platform for ${file.name}. Expected .json, .jsonl, or .zip`);
            return;
          }
          payloads.push({ filename: file.name, content, platform });
          names.push(`${file.name} → ${platform}`);
        }
      }

      setDetected(names);
      onReady(payloads);
    },
    [onReady]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) processFiles(files);
    },
    [processFiles]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) processFiles(files);
    },
    [processFiles]
  );

  return (
    <div className="space-y-4">
      <label
        className={`block border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
          dragging
            ? "border-purple-500/50 bg-purple-500/5"
            : "border-white/[0.08] hover:border-purple-500/30 hover:bg-purple-500/[0.02]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          className="sr-only"
          accept=".json,.jsonl,.zip"
          multiple
          onChange={onInputChange}
        />
        <div className="px-8 py-16 text-center space-y-4">
          <div className="flex justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              dragging ? 'bg-purple-500/20 scale-110' : 'bg-white/[0.04]'
            }`}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className={`transition-transform duration-300 ${dragging ? '-translate-y-1' : ''}`}>
                <path d="M10 14V3M10 3L6 7M10 3L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40" />
                <path d="M3 14V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/25" />
              </svg>
            </div>
          </div>
          <p className="text-base text-white/50">
            Drop your export files here, or <span className="text-purple-400/80 hover:text-purple-400 transition-colors font-medium">browse</span>
          </p>
          <p className="text-xs text-white/30 font-data">
            .json &middot; .jsonl &middot; .zip — Claude, ChatGPT, Gemini
          </p>
        </div>
      </label>

      {error && (
        <div className="glass rounded-xl border-red-500/20 px-5 py-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {detected.length > 0 && (
        <ul className="text-sm text-white/40 space-y-1.5">
          {detected.map((d, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-emerald-400/70">&#x2713;</span> {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
