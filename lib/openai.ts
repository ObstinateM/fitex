import type { OpenAIModel } from "./types";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone?: () => void;
}

function friendlyApiError(status: number): string {
  switch (status) {
    case 401: return "Invalid or expired API key. Please check your key in settings.";
    case 429: return "Rate limit exceeded. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503: return "OpenAI service is temporarily unavailable. Please try again later.";
    default: return `OpenAI request failed (HTTP ${status}). Please try again.`;
  }
}

export async function streamChatCompletion(
  apiKey: string,
  model: OpenAIModel,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(friendlyApiError(res.status));
  }

  if (!res.body) throw new Error("Response body is null");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") {
        callbacks.onDone?.();
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) callbacks.onChunk(content);
      } catch {
        // skip malformed lines
      }
    }
  }

  callbacks.onDone?.();
}

export async function chatCompletion(
  apiKey: string,
  model: OpenAIModel,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    throw new Error(friendlyApiError(res.status));
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
