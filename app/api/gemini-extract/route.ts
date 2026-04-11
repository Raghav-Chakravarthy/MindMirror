import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Conversation } from "@/lib/types";

const GEMINI_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ topics: null, note: "Gemini API key not configured" });
  }

  try {
    const { conversations } = (await req.json()) as { conversations: Conversation[] };

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const titles = conversations.slice(0, 60).map((c) => c.title).join("\n");
    const samples = conversations
      .slice(0, 20)
      .map((c) => c.content_sample.slice(0, 200))
      .join("\n---\n");

    const prompt = `Analyze these AI conversation titles and content samples. Extract the key topics and patterns.

CONVERSATION TITLES:
${titles}

CONTENT SAMPLES:
${samples}

Return a JSON object with:
{
  "topics": [
    { "name": "topic name (2-4 words)", "count": estimated_frequency, "category": "one of: ai, frontend, backend, devops, design, product, other" }
  ],
  "patterns": [
    "pattern 1 observed in the data",
    "pattern 2 observed in the data"
  ],
  "primary_domain": "the user's main area of focus",
  "curiosity_breadth": "narrow" | "moderate" | "broad"
}

Return ONLY valid JSON. No markdown fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const extracted = JSON.parse(text);
    return NextResponse.json(extracted);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini extraction failed";
    return NextResponse.json({ topics: null, error: message });
  }
}
