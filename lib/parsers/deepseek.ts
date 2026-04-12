import { Conversation } from "../types";

interface DeepSeekEntry {
  role?: string;
  text?: string;
  parts?: Array<{ text?: string }>;
  create_time?: string;
}

interface DeepSeekConversation {
  title?: string;
  create_time?: string;
  entries?: DeepSeekEntry[];
  conversations?: DeepSeekEntry[];
}

function entryText(entry: DeepSeekEntry): string {
  if (entry.text) return entry.text;
  if (entry.parts?.length) return entry.parts.map((p) => p.text ?? "").join(" ");
  return "";
}

export function parseDeepSeekExport(raw: string): Conversation[] {
  const data: DeepSeekConversation | DeepSeekConversation[] = JSON.parse(raw);
  const items = Array.isArray(data) ? data : [data];
  const conversations: Conversation[] = [];

  for (const conv of items) {
    const entries = conv.entries ?? conv.conversations ?? [];
    const userEntries = entries.filter(
      (e) => e.role === "user" || e.role === "human"
    );
    const contentSample = userEntries[0]
      ? entryText(userEntries[0]).slice(0, 500)
      : entryText(entries[0] ?? {}).slice(0, 500);

    conversations.push({
      title: conv.title ?? "Untitled",
      platform: "deepseek",
      messages: entries.length,
      date: conv.create_time ?? new Date().toISOString(),
      content_sample: contentSample,
    });
  }

  return conversations.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
