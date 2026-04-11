import { Conversation } from "../types";

interface ClaudeMessage {
  sender: "human" | "assistant";
  text: string;
}

interface ClaudeConversation {
  name?: string;
  chat_messages?: ClaudeMessage[];
  created_at?: string;
  updated_at?: string;
}

function extractContentSample(messages: ClaudeMessage[]): string {
  const firstHuman = messages.find((m) => m.sender === "human");
  return (firstHuman?.text ?? messages[0]?.text ?? "").slice(0, 500);
}

export function parseClaudeExport(raw: string): Conversation[] {
  const conversations: Conversation[] = [];

  // Claude exports as JSONL (one JSON object per line) or a single JSON array
  const lines = raw.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const obj: ClaudeConversation = JSON.parse(line);
      const messages = obj.chat_messages ?? [];
      conversations.push({
        title: obj.name ?? "Untitled",
        platform: "claude",
        messages: messages.length,
        date: obj.created_at ?? obj.updated_at ?? new Date().toISOString(),
        content_sample: extractContentSample(messages),
      });
    } catch {
      // skip malformed lines
    }
  }

  // Fallback: maybe it's a JSON array
  if (conversations.length === 0) {
    try {
      const arr: ClaudeConversation[] = JSON.parse(raw);
      for (const obj of arr) {
        const messages = obj.chat_messages ?? [];
        conversations.push({
          title: obj.name ?? "Untitled",
          platform: "claude",
          messages: messages.length,
          date: obj.created_at ?? obj.updated_at ?? new Date().toISOString(),
          content_sample: extractContentSample(messages),
        });
      }
    } catch {
      // not an array either
    }
  }

  return conversations.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
