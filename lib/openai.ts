import type { OpenAIModel } from "./types";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function streamChatCompletion(
  apiKey: string,
  model: OpenAIModel,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
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
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body}`);
  }

  const reader = res.body!.getReader();
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
        callbacks.onDone();
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

  callbacks.onDone();
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
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
