# API Key Validation

## Overview

The first step of onboarding. The user enters their OpenAI API key, which is validated live against the OpenAI API before being accepted.

## UI

- **Password input** field (`type="password"`) with placeholder `sk-...`
- **"Validate Key" button** - disabled when input is empty or validation is in progress
- **Error text** shown below the input on failure
- **Enter key** triggers validation via `onKeyDown` handler:
  ```typescript
  onKeyDown={(e) => e.key === "Enter" && key.trim() && validate()}
  ```
  The handler checks both that the pressed key is Enter and that the input is non-empty (`key.trim()` is truthy) before calling `validate()`. This allows users to submit the key without clicking the "Validate Key" button, matching standard form submission UX. The same `validate()` function is called by both the Enter key handler and the button's `onClick`, ensuring identical behavior.

## Validation Flow

### 1. Format Check (Client-Side)
```
- Must start with "sk-"
- Must be at least 20 characters long
```
Error: `Invalid format. API keys start with "sk-" and are at least 20 characters.`

### 2. Live API Validation
```
GET https://api.openai.com/v1/models
Headers: { Authorization: "Bearer {key}" }
```

| Response | Action |
|----------|--------|
| HTTP 200 | Key is valid → save to storage, advance to Step 2 |
| HTTP 401 | "Invalid API key." |
| Network error | "Network error. Check your connection." |
| Other HTTP status | "Validation failed (HTTP {status})." |

## Storage

- **Key**: `openai_api_key`
- **Value**: The trimmed API key string
- Stored via `setApiKey(key)` → `chrome.storage.local.set({ openai_api_key: key })`

## Webapp Adaptation Notes

- The format check (`sk-` prefix) may change if supporting other AI providers
- The `/v1/models` endpoint is a lightweight way to validate a key without consuming tokens
- In a webapp, API keys should be stored server-side, not in local storage
