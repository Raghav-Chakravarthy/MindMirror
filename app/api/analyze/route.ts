import { NextRequest } from "next/server";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/system-prompt";
import { Conversation } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { conversations } = (await req.json()) as {
      conversations: Conversation[];
    };

    if (!conversations?.length) {
      return new Response(JSON.stringify({ error: "No conversations provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userMessage = buildUserMessage(conversations);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!.replace(/^﻿/, "").trim(),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("[analyze] Anthropic API error:", anthropicRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error ${anthropicRes.status}: ${errText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = anthropicRes.body!.getReader();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);
                if (
                  event.type === "content_block_delta" &&
                  event.delta?.type === "text_delta" &&
                  event.delta.text
                ) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                  );
                }
              } catch {
                // skip unparseable SSE event
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream failed";
          console.error("[analyze] stream error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("[analyze] outer error:", err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
