import { Conversation } from "../types";

interface ChatGPTMessageContent {
  parts?: string[];
  text?: string;
}

interface ChatGPTMessage {
  id: string;
  author?: { role: string };
  content?: ChatGPTMessageContent;
  create_time?: number;
}

interface ChatGPTNode {
  message?: ChatGPTMessage;
  children?: string[];
}

interface ChatGPTConversation {
  title?: string;
  create_time?: number;
  mapping?: Record<string, ChatGPTNode>;
}

function getMessageText(msg: ChatGPTMessage): string {
  if (!msg.content) return "";
  if (msg.content.parts?.length) return msg.content.parts.join(" ");
  return msg.content.text ?? "";
}

export function parseChatGPTExport(raw: string): Conversation[] {
  const data: ChatGPTConversation[] = JSON.parse(raw);
  const conversations: Conversation[] = [];

  for (const conv of data) {
    const mapping = conv.mapping ?? {};
    const nodes = Object.values(mapping);

    // Collect all messages sorted by create_time
    const messages: ChatGPTMessage[] = nodes
      .map((n) => n.message)
      .filter((m): m is ChatGPTMessage => !!m && !!m.author)
      .sort((a, b) => (a.create_time ?? 0) - (b.create_time ?? 0));

    const userMessages = messages.filter((m) => m.author?.role === "user");
    const contentSample = userMessages[0]
      ? getMessageText(userMessages[0]).slice(0, 500)
      : "";

    const createTime = conv.create_time
      ? new Date(conv.create_time * 1000).toISOString()
      : new Date().toISOString();

    conversations.push({
      title: conv.title ?? "Untitled",
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
