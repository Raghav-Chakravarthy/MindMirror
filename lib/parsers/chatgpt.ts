import { Conversation } from "../types";

interface ChatGPTMessageContent {
  content_type?: string;
  parts?: (string | null | Record<string, unknown>)[];
  text?: string;
}

interface ChatGPTMessage {
  id?: string;
  author?: { role: string };
  content?: ChatGPTMessageContent;
  create_time?: number;
  metadata?: Record<string, unknown>;
}

interface ChatGPTNode {
  id?: string;
  message?: ChatGPTMessage | null;
  parent?: string | null;
  children?: string[];
}

interface ChatGPTConversation {
  title?: string;
  name?: string;
  create_time?: number;
  update_time?: number;
  mapping?: Record<string, ChatGPTNode>;
  conversation_id?: string;
}

function getMessageText(msg: ChatGPTMessage): string {
  if (!msg.content) return "";
  if (msg.content.parts?.length) {
    return msg.content.parts
      .filter((p): p is string => typeof p === "string")
      .join(" ");
  }
  return msg.content.text ?? "";
}

function extractMessagesFromMapping(
  mapping: Record<string, ChatGPTNode>
): ChatGPTMessage[] {
  return Object.values(mapping)
    .map((n) => n.message)
    .filter((m): m is ChatGPTMessage => {
      if (!m || !m.author) return false;
      const role = m.author.role;
      if (role === "system") return false;
      const text = getMessageText(m).trim();
      return text.length > 0;
    })
    .sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));
}

export function parseChatGPTExport(raw: string): Conversation[] {
  const data = JSON.parse(raw);
  const items: ChatGPTConversation[] = Array.isArray(data) ? data : [data];
  const conversations: Conversation[] = [];

  for (const conv of items) {
    const mapping = conv.mapping ?? {};
    const messages = extractMessagesFromMapping(mapping);
    const userMessages = messages.filter((m) => m.author?.role === "user");
    const firstMeaningful = userMessages[0] ?? messages[0];
    const contentSample = firstMeaningful
      ? getMessageText(firstMeaningful).slice(0, 500)
      : "";

    const timestamp = conv.create_time ?? conv.update_time;
    const createTime = timestamp
      ? new Date(timestamp * 1000).toISOString()
      : new Date().toISOString();

    conversations.push({
      title: conv.title ?? conv.name ?? "Untitled",
      platform: "openai",
      messages: messages.length,
      date: createTime,
      content_sample: contentSample,
    });
  }

  return conversations.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
