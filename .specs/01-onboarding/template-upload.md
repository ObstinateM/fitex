# LaTeX Template Upload

## Overview

Users upload their LaTeX CV template as either a single `.tex` file or a `.zip` archive containing the `.tex` file plus supporting files (classes, styles, images, etc.).

## UI

- **Drag-and-drop zone** or click-to-browse (hidden file input triggered on click)
- Accepts: `.tex`, `.zip`
- Shows filename after selection
- Shows first 300 characters of main `.tex` content as preview
- Error messages displayed below the drop zone

## Processing: Single `.tex` File

1. Read file as text
2. Validate: must contain `\documentclass`
   - Error if not: `"File doesn't appear to be a valid LaTeX document."`
3. Store as `TexTemplate` with empty `auxFiles`

## Processing: `.zip` File

### Safety Limits

| Limit | Value |
|-------|-------|
| Max compressed size | 10 MB |
| Max extracted size | 50 MB (zip bomb protection) |
| Max file count | 100 |

### Filtering

Skipped entries:
- Paths starting with `__MACOSX/` (macOS resource forks)
- Paths starting with `.` (dotfiles)
- Paths ending with `/` (directory entries)

### Security

- **Path traversal protection**: Rejects paths containing `..` or starting with `/`
  - Error: `"Rejected unsafe path in ZIP: {path}"`

### Binary Detection

These extensions are treated as binary and stored as base64:
`.jpg`, `.jpeg`, `.png`, `.gif`, `.pdf`, `.eps`, `.bmp`, `.tiff`, `.webp`

### Main File Detection

- Scans all `.tex` files for `\documentclass`
- **First** `.tex` with `\documentclass` becomes `mainContent`
- Additional `.tex` files with `\documentclass` are added to `auxFiles` with a warning:
  `"Found {count} .tex files with \documentclass — using the first one."`
- `.tex` files without `\documentclass` → `auxFiles`

### File Storage

- **Text files** (`.tex`, `.cls`, `.sty`, etc.): stored as UTF-8 strings via `strFromU8(data)`
- **Binary files**: converted to base64 via chunked `String.fromCharCode` (8192-byte chunks) + `btoa`

## Data Model

```typescript
interface TexTemplate {
  mainContent: string;       // The main .tex file content
  auxFiles: AuxFile[];       // All other files
}

interface AuxFile {
  path: string;              // Relative path within the ZIP (e.g., "resume.cls")
  content: string;           // UTF-8 text for text files, base64 for binary
  encoding?: "base64";       // Present only for binary files
}
```

## Dependencies

- `fflate` library: `unzipSync` for ZIP extraction, `strFromU8` for byte-to-string conversion

## Storage

- **Key**: `tex_template`
- **Value**: JSON-serialized `TexTemplate` object

## Webapp Adaptation Notes

- ZIP processing logic is entirely client-side and can be reused as-is
- Consider server-side validation of the template for additional security
- The `fflate` library is lightweight and works in both browser and Node.js
- Profile photo is stored separately (see [profile-photo-upload.md](./profile-photo-upload.md)) and merged with auxFiles at compile time
