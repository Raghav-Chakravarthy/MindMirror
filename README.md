# MindMirror

**A brutally honest cognitive analysis of your AI conversation history.**

Upload your conversation exports from Claude, ChatGPT, or Gemini and get an uncomfortably accurate portrait of how you think, what you avoid, and what you're outsourcing to AI.

## What It Does

MindMirror analyzes your AI conversation history and produces:

- **Cognitive Fingerprint** — 6-axis radar chart of how you think (systems thinking, pattern seeking, first principles, execution speed, depth vs breadth, uncertainty tolerance)
- **Topic Analysis** — Every topic you've discussed, how often, how deep, and a brutally honest verdict on each
- **Dependency Audit** — Skills you're outsourcing to AI instead of owning, rated by severity (habit → dependency → atrophy)
- **Uncomfortable Questions** — Questions your history raises that you probably haven't asked yourself
- **Knowledge Edge** — Unusual areas where your curiosity gives you a competitive advantage
- **Archetype** — Your cognitive archetype (e.g. "THE ANXIOUS BUILDER")
- **Shareable Card** — A downloadable PNG card with your most confrontational truth

## Architecture

```
Upload file(s)
  → DropZone detects platform (Claude/ChatGPT/Gemini)
  → POST /api/parse → lib/parsers/{claude,chatgpt,gemini}.ts → Conversation[]
  → POST /api/analyze → Claude API (streaming) → MindMirrorResult JSON
  → sessionStorage → /analysis page renders 8 sections
  → Topic hover → Neural network visualization lights up
  → Download shareable card as PNG
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (custom dark theme)
- **Three.js** (neural network particle visualization)
- **Recharts** (radar chart)
- **Claude API** (streaming analysis via claude-sonnet-4-6)
- **html2canvas** (shareable card export)

## Getting Started

```bash
# Install dependencies
npm install

# Add your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supported Export Formats

| Platform | How to Export | Format |
|----------|-------------|--------|
| **Claude** | Settings → Export Data | `.json` or `.jsonl` |
| **ChatGPT** | Settings → Data Controls → Export | `.zip` containing `conversations.json` |
| **Gemini** | Google Takeout → Gemini | `.zip` with JSON files |

## Project Structure

```
app/
  page.tsx                    # Upload page with streaming progress
  analysis/page.tsx           # Results page with 8 analysis sections
  api/
    parse/route.ts            # File parsing endpoint
    analyze/route.ts          # Claude API streaming endpoint
components/
  upload/DropZone.tsx          # Drag-and-drop file upload with platform detection
  analysis/
    ArchetypeHero.tsx          # Archetype display with glow effects
    Verdict.tsx                # Full analysis verdict
    CognitiveFingerprint.tsx   # Radar chart + animated score bars
    TopicsGrid.tsx             # Topic cards with domain colors
    DependencyAudit.tsx        # Severity-coded dependency items
    UncomfortableQuestions.tsx  # Numbered question list
    KnowledgeEdge.tsx          # Competitive advantage items
    ShareableCard.tsx          # Downloadable PNG card
    BrainSidebar.tsx           # Three.js neural network visualization
lib/
  types.ts                     # All TypeScript types
  system-prompt.ts             # Claude system prompt + message builder
  sample-data.ts               # Demo data for judges
  parsers/
    claude.ts                  # Claude JSONL/JSON parser
    chatgpt.ts                 # ChatGPT conversations.json parser
    gemini.ts                  # Gemini Takeout JSON parser
```

## Hackathon

Built at **Bitcamp 2026** in 36 hours.

## License

MIT
