import { NextRequest, NextResponse } from "next/server";
import { parseClaudeExport } from "@/lib/parsers/claude";
import { parseChatGPTExport } from "@/lib/parsers/chatgpt";
import { parseGeminiExport } from "@/lib/parsers/gemini";
import { Conversation } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, content, platform } = body as {
      filename: string;
      content: string;
      platform: "claude" | "openai" | "gemini";
    };

    console.log(`[parse] file="${filename}" platform="${platform}" contentLength=${content.length}`);

    let conversations: Conversation[] = [];

    if (platform === "claude") {
      conversations = parseClaudeExport(content);
    } else if (platform === "openai") {
      conversations = parseChatGPTExport(content);
    } else if (platform === "gemini") {
      conversations = parseGeminiExport(content);
    } else {
      return NextResponse.json(
        { error: `Unknown platform: ${platform}` },
        { status: 400 }
      );
    }

    console.log(`[parse] result: ${conversations.length} conversations, messages: [${conversations.slice(0, 5).map(c => c.messages).join(",")}${conversations.length > 5 ? "..." : ""}]`);

    if (conversations.length === 0) {
      return NextResponse.json(
        { error: "No conversations found in the uploaded file." },
        { status: 422 }
      );
    }

    return NextResponse.json({ conversations, count: conversations.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed";
    console.error(`[parse] error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
