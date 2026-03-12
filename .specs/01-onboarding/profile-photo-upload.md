# Profile Photo Upload

## Overview

Optional profile photo upload. The image is stored as a base64-encoded `AuxFile` and injected into the LaTeX template's auxiliary files at compile time, so the template can reference it via `\includegraphics{filename}`.

## UI

### Empty State (no photo)
- Drag-and-drop zone or click-to-browse
- Image icon + "Drop an image here, or click to browse"
- Accepted formats shown: "JPG, PNG, GIF, WebP"

### With Photo
- 64x64 thumbnail preview (rounded, object-cover)
- Filename displayed
- Hint text: `Reference in your template as \includegraphics{filename}`
- "Remove" button (red text)

## Accepted Formats

`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## Processing

1. `FileReader.readAsDataURL(file)` reads the file
2. The `data:mime;base64,` prefix is stripped — only the base64 payload is kept
3. Stored as an `AuxFile`:

```typescript
{
  path: file.name,          // e.g., "photo.jpg"
  content: base64String,    // Raw base64 without data URL prefix
  encoding: "base64"
}
```

## MIME Reconstruction (for preview)

When displaying the thumbnail, the MIME type is reconstructed from the file extension:

| Extension | MIME |
|-----------|------|
| jpg, jpeg | image/jpeg |
| png | image/png |
| gif | image/gif |
| webp | image/webp |
| (default) | image/png |

Preview URL: `data:{mime};base64,{content}`

## Integration with Compilation

During LaTeX compilation, if a profile image is stored:
```typescript
const templateForCompile = profileImage
  ? { ...template, auxFiles: [...template.auxFiles, profileImage] }
  : template;
```

The image is appended to the template's `auxFiles` array so the compilation service receives it as a resource. The LaTeX template can then reference it by filename (e.g., `\includegraphics{photo.jpg}`).

## Storage

- **Key**: `profile_image`
- **Value**: `AuxFile` object or `null`
- **Clear**: `chrome.storage.local.remove("profile_image")`

## Component Behavior

- Controlled component: `value` (AuxFile | null) and `onChange` props
- File input reset after selection (`e.target.value = ""`) to allow re-selecting the same file
- Used in both Onboarding (Step 2) and Settings page
