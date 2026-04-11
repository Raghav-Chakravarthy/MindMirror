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

function detectPlatform(filename: string, content: string): Platform | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".jsonl")) return "claude";
  if (lower.includes("gemini") && lower.endsWith(".json")) return "gemini";
  if (lower.endsWith(".json")) {
    // Try to sniff the content
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed[0]?.mapping) return "openai";
      if (Array.isArray(parsed) && parsed[0]?.chat_messages) return "claude";
      if (parsed?.entries || parsed?.conversations) return "gemini";
      // Newline-delimited JSON (Claude JSONL as .json)
      if (typeof parsed === "object" && parsed.chat_messages) return "claude";
    } catch {
      // JSONL file saved as .json — treat as Claude
      return "claude";
    }
  }
  return null;
}

async function extractFromZip(file: File): Promise<FilePayload[]> {
  const zip = await JSZip.loadAsync(file);
  const payloads: FilePayload[] = [];

  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    const lower = path.toLowerCase();

    // ChatGPT: conversations.json at root or in a folder
    if (lower.endsWith("conversations.json") && !lower.includes("gemini")) {
      const content = await zipEntry.async("string");
      payloads.push({ filename: path, content, platform: "openai" });
      continue;
    }

    // Gemini takeout: Gemini/ directory with JSON files
    if (lower.includes("gemini") && lower.endsWith(".json")) {
      const content = await zipEntry.async("string");
      payloads.push({ filename: path, content, platform: "gemini" });
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
