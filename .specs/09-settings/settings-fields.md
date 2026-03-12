# Settings Fields

## All Configurable Fields

### 1. API Key

- **Type**: Password input
- **Storage key**: `openai_api_key`
- **No live validation** (unlike onboarding - user is trusted to enter a valid key)
- Changed key takes effect on next generation

### 2. Model

- **Type**: Select dropdown
- **Storage key**: `openai_model`
- **Default**: `gpt-5.2`
- **Options**:

| Display Name | Value | Use Case |
|-------------|-------|----------|
| GPT-5.2 | `gpt-5.2` | Best quality (default) |
| GPT-4.1 | `gpt-4.1` | High quality, same price as 5.2 |
| GPT-4.1 Mini | `gpt-4.1-mini` | Good balance of quality/cost |
| GPT-4.1 Nano | `gpt-4.1-nano` | Cheapest, used for pre-scan |
| o4-mini | `o4-mini` | Reasoning model |

Type: `"gpt-5.2" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "o4-mini"`

### 3. LaTeX Compiler

- **Type**: Select dropdown
- **Storage key**: `latex_compiler`
- **Default**: `pdflatex`
- **Options**: `pdflatex`, `xelatex`, `lualatex`
- Type: `"pdflatex" | "xelatex" | "lualatex"`

### 4. Context

- **Type**: Textarea (3 rows)
- **Storage key**: `user_context`
- **Default**: `""` (empty string)
- **Description**: "Persistent info to guide the AI (e.g. skills to highlight, target role, preferences)."
- **Placeholder**: "e.g. I'm targeting senior backend roles. Emphasize my Python and distributed systems experience."
- Injected into CV tailoring prompt as `<candidate_context>` and into question answering prompts

### 5. Template Re-upload

- Same `TemplateUploader` component as onboarding
- **Storage key**: `tex_template`
- Pending template stored in component state until "Save Settings" is clicked
- Only saved if user uploaded a new one during this settings session

### 6. Profile Photo

- Same `ImageUploader` component as onboarding
- **Storage key**: `profile_image`
- Can upload new or remove existing
- On save: calls `setProfileImage(img)` if present, `clearProfileImage()` if null

### 7. Manage Stories (Navigation)

- Button: "Manage Stories" with right chevron
- Navigates to Stories page

### 8. Import Stories (Navigation)

- Button: "Import Stories" (purple themed) with upload icon
- Navigates to Import Stories page

## Save Behavior

All fields saved in parallel via `Promise.all`:
```typescript
const saves = [
  setApiKey(apiKey),
  setCompiler(compiler),
  setModel(model),
  setContext(context),
  profileImage ? setProfileImage(profileImage) : clearProfileImage(),
];
if (pendingTemplate) saves.push(setTemplate(pendingTemplate));
await Promise.all(saves);
```

## Navigation Flow

- Settings remembers the return page (`returnPage` state in App.tsx)
- Valid return pages: `"selector" | "results" | "history"`
- Stories page back → Settings
- Import Stories page back → Settings (or auto-return after successful import)
