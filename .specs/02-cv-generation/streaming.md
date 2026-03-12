# SSE Streaming

## Overview

CV tailoring uses Server-Sent Events (SSE) streaming to provide real-time output as the AI generates the modified LaTeX. This allows the UI to show progress during generation.

## Streaming Implementation (`streamChatCompletion`)

### Request

```
POST https://api.openai.com/v1/chat/completions
Headers:
  Content-Type: application/json
  Authorization: Bearer {apiKey}
Body:
  { "model": "{model}", "messages": [{role, content}], "stream": true }
```

### Response Parsing

1. Read response body as a `ReadableStream` via `res.body.getReader()`
2. Decode chunks with `TextDecoder` (streaming mode)
3. Buffer incomplete lines - split by `\n`, keep last (potentially incomplete) line in buffer
4. For each complete line:
   - Skip empty lines or lines not starting with `data: `
   - Strip `data: ` prefix (6 characters)
   - If data is `[DONE]` → call `onDone()`, return
   - Parse JSON → extract `choices[0].delta.content`
   - If content exists → call `onChunk(content)`
5. On stream end → call `onDone()`

### Callbacks

```typescript
interface StreamCallbacks {
  onChunk: (text: string) => void;  // Called for each content delta
  onDone?: () => void;               // Called when stream completes
}
```

### Abort Support

Accepts an optional `AbortSignal` parameter passed to `fetch()`. Allows cancellation of in-progress generation.

## Non-Streaming Implementation (`chatCompletion`)

Used for: keyword scans, question answering, salary estimation, story filtering, story enhancement, story import.

```
POST https://api.openai.com/v1/chat/completions
Body: { "model": "{model}", "messages": [{role, content}] }
```

Returns `choices[0].message.content` as a string.

## Error Handling

HTTP status codes mapped to user-friendly messages:

| Status | Message |
|--------|---------|
| 401 | "Invalid or expired API key. Please check your key in settings." |
| 429 | "Rate limit exceeded. Please wait a moment and try again." |
| 500, 502, 503 | "OpenAI service is temporarily unavailable. Please try again later." |
| Other | "OpenAI request failed (HTTP {status}). Please try again." |

Malformed SSE lines (JSON parse failures) are silently skipped.

## Webapp Adaptation Notes

- The SSE parsing logic is reusable as-is for any OpenAI streaming integration
- In a webapp with a backend proxy, the streaming can be relayed via the backend to avoid exposing API keys
- Consider using the OpenAI SDK's built-in streaming support instead of raw fetch
