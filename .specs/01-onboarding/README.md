# Onboarding

## Purpose

First-run setup wizard that collects the minimum required configuration before the user can start generating tailored CVs. Shown only once - after completion, the user goes directly to the Selector page on future launches.

## Flow

**2-step wizard** with a visual progress bar (two colored segments).

### Step 1 - Connect OpenAI
- Collects and validates the user's OpenAI API key
- On success: saves key to storage, advances to Step 2
- See [api-key-validation.md](./api-key-validation.md)

### Step 2 - Upload CV Template
- Upload a `.tex` or `.zip` LaTeX template (required)
- Optionally upload a profile photo
- "Complete Setup" button (disabled until template is uploaded)
- On completion:
  1. Saves template to storage
  2. Saves or clears profile image
  3. Sets `is_onboarded = true`
  4. Navigates to the Selector page

## Storage Keys Written

| Key | Value |
|-----|-------|
| `openai_api_key` | The validated API key string |
| `tex_template` | `TexTemplate` object (main content + aux files) |
| `profile_image` | `AuxFile` or cleared if no photo |
| `is_onboarded` | `true` |

## Page Type

`"onboarding"` in App.tsx. The app checks `is_onboarded` on launch - if `true`, skips directly to `"selector"`.

## Sub-features

- [API Key Validation](./api-key-validation.md)
- [Template Upload](./template-upload.md)
- [Profile Photo Upload](./profile-photo-upload.md)
