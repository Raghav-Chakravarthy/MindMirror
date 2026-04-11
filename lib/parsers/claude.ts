import { Conversation } from "../types";

interface ClaudeMessage {
  sender: "human" | "assistant";
  text: string;
  content?: string;
}

interface ClaudeConversation {
  name?: string;
  uuid?: string;
  summary?: string;
  chat_messages?: ClaudeMessage[];
  created_at?: string;
  updated_at?: string;
}

function getMessageText(msg: ClaudeMessage): string {
  return msg.text ?? msg.content ?? "";
}

function extractContentSample(messages: ClaudeMessage[]): string {
  const firstHuman = messages.find((m) => m.sender === "human");
  return (getMessageText(firstHuman ?? messages[0] ?? { sender: "human", text: "" })).slice(0, 500);
}

function convertConversation(obj: ClaudeConversation): Conversation {
  const messages = obj.chat_messages ?? [];
  return {
    title: obj.name ?? "Untitled",
    platform: "claude",
    messages: messages.length,
    date: obj.created_at ?? obj.updated_at ?? new Date().toISOString(),
    content_sample: extractContentSample(messages),
  };
}

export function parseClaudeExport(raw: string): Conversation[] {
  // Try JSON array first (newer Claude exports)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.chat_messages !== undefined) {
      return (parsed as ClaudeConversation[])
        .map(convertConversation)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    if (typeof parsed === "object" && !Array.isArray(parsed) && parsed.chat_messages !== undefined) {
      return [convertConversation(parsed as ClaudeConversation)];
    }
  } catch {
    // not a single JSON value — try JSONL below
  }

  // JSONL: one JSON object per line
  const conversations: Conversation[] = [];
  const lines = raw.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const obj: ClaudeConversation = JSON.parse(line);
      if (obj.chat_messages !== undefined) {
        conversations.push(convertConversation(obj));
      }
    } catch {
      // skip malformed lines
    }
  }

  return conversations.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
