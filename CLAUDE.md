# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

MindMirror is a full-stack web application that analyzes a user's AI conversation history (Claude, ChatGPT, Gemini exports) and produces a brutally honest cognitive profile. A 3D neural network visualization sidebar powered by Three.js shows activation patterns when the user hovers over their most common topics. Gemini API provides parallel topic extraction.

## Running the App

```bash
# Install dependencies (first time)
npm install

# Run the dev server
npm run dev
```

Add your API keys to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...          # Optional — enables Gemini topic extraction section
```

## Architecture

```
User uploads file(s)
 → DropZone detects platform
 → POST /api/parse → lib/parsers/{claude,chatgpt,gemini}.ts → Conversation[]
 → POST /api/analyze → Claude API (streaming, claude-sonnet-4-6) → MindMirrorResult JSON
 → POST /api/gemini-extract → Gemini 2.0 Flash (parallel) → topic extraction
 → sessionStorage → /analysis page renders 9 sections
 → Topic hover → Three.js neural network visualization activates
```

## Key Files

| File | Purpose |
|---|---|
| `lib/types.ts` | All shared TypeScript types (Conversation, MindMirrorResult, etc.) |
| `lib/system-prompt.ts` | MindMirror system prompt + `buildUserMessage()` |
| `lib/sample-data.ts` | Pre-built demo data for judges |
| `lib/parsers/claude.ts` | Parses Claude JSONL export |
| `lib/parsers/chatgpt.ts` | Parses ChatGPT ZIP → conversations.json |
| `lib/parsers/gemini.ts` | Parses Gemini Takeout ZIP JSON files |
| `app/api/analyze/route.ts` | Streaming Claude API call |
| `app/api/gemini-extract/route.ts` | Gemini 2.0 Flash topic extraction |
| `app/api/brain/route.ts` | Legacy TRIBE v2 proxy (unused) |
| `components/analysis/BrainSidebar.tsx` | Three.js neural network particle visualization |
| `components/analysis/GeminiInsights.tsx` | Gemini-extracted topic display |

## MindMirrorResult Schema (8 fields)

`COGNITIVE_FINGERPRINT` · `TOPICS` · `DEPENDENCY_AUDIT` · `UNCOMFORTABLE_QUESTIONS` · `KNOWLEDGE_EDGE` · `ARCHETYPE` · `VERDICT` · `SHAREABLE_CARD`

Full type definitions in `lib/types.ts`.

## Export Format Notes

- **Claude**: `conversations.jsonl` (JSONL) or `.json` — each line is `{ name, chat_messages: [{sender, text}], created_at }`
- **ChatGPT**: ZIP containing `conversations.json` — top-level array, each item has `{ title, create_time, mapping: { [id]: { message: { author, content } } } }`
- **Gemini**: Google Takeout ZIP — `Takeout/Gemini/` folder with JSON files `{ title, create_time, entries: [{role, text}] }`
