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
      console.log(`[isConversationFile] "${filename}" is array with ${parsed.length} items. First item keys:`, parsed.length > 0 ? Object.keys(parsed[0]) : "empty");
      if (parsed.length > 0) {
        const sample = parsed.slice(0, Math.min(5, parsed.length));
        if (sample.some((item: Record<string, unknown>) => looksLikeChatGPTItem(item))) return "openai";
        if (sample.some((item: Record<string, unknown>) => item?.chat_messages)) return "claude";
        if (sample.some((item: Record<string, unknown>) => item?.entries || item?.conversations)) return "gemini";
      }
    } else if (typeof parsed === "object") {
      console.log(`[isConversationFile] "${filename}" is object with keys:`, Object.keys(parsed));
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

  const allPaths = Object.keys(zip.files).filter(p => !zip.files[p].dir);
  console.log("[extractFromZip] files in ZIP:", allPaths);

  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    const lower = path.toLowerCase();
    if (!lower.endsWith(".json") && !lower.endsWith(".jsonl")) continue;

    const content = await zipEntry.async("string");
    console.log(`[extractFromZip] checking "${path}" (${content.length} chars)`);

    if (lower.endsWith(".jsonl")) {
      payloads.push({ filename: path, content, platform: "claude" });
      continue;
    }

    const platform = isConversationFile(path, content);
    console.log(`[extractFromZip] "${path}" → detected platform: ${platform}`);
    if (platform) {
      payloads.push({ filename: path, content, platform });
    }
  }

  console.log(`[extractFromZip] total payloads: ${payloads.length}`, payloads.map(p => `${p.filename} (${p.platform})`));
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
        className={`block border-2 border-dashed transition-colors cursor-pointer ${
          dragging
            ? "border-white bg-[#1a1a1a]"
            : "border-[#333] hover:border-[#555]"
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
        <div className="px-8 py-12 text-center space-y-3">
          <p className="text-2xl">↑</p>
          <p className="text-sm text-[#888]">
            Drop your export files here, or click to select
          </p>
          <p className="text-xs text-[#555]">
            .json · .jsonl · .zip — Claude, ChatGPT, Gemini
          </p>
        </div>
      </label>

      {error && (
        <p className="text-xs text-[#ff4444] border border-[#ff2222] bg-[#1a0000] px-4 py-3">
          {error}
        </p>
      )}

      {detected.length > 0 && (
        <ul className="text-xs text-[#666] space-y-1">
          {detected.map((d, i) => (
            <li key={i}>✓ {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
