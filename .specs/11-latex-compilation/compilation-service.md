# Compilation Service

## Endpoint

```
POST https://latex.ytotech.com/builds/sync
Content-Type: application/json
```

## Request Body

```json
{
  "compiler": "pdflatex",
  "resources": [
    { "main": true, "content": "\\documentclass{article}\\begin{document}...\\end{document}" },
    { "path": "resume.cls", "content": "UTF-8 text content of the file" },
    { "path": "photo.jpg", "file": "base64-encoded-binary-content" }
  ]
}
```

### Resource Types

| Type | Fields | Description |
|------|--------|-------------|
| Main file | `{ main: true, content: string }` | The modified LaTeX source |
| Text aux file | `{ path: string, content: string }` | .cls, .sty, .tex, etc. as UTF-8 |
| Binary aux file | `{ path: string, file: string }` | Images etc. as base64 |

Note: binary files use the `file` key (not `content`) for base64 data.

### Compiler Selection

- Uses the stored compiler from settings (default: `pdflatex`)
- Can be overridden per-call via `CompileOptions.compiler`
- Options: `"pdflatex" | "xelatex" | "lualatex"`

### Profile Image Integration

If a profile image is stored, it's appended to the template's auxFiles before compilation:
```typescript
const templateForCompile = profileImage
  ? { ...template, auxFiles: [...template.auxFiles, profileImage] }
  : template;
```

## Response

### Success
- Content-Type: `application/pdf`
- Body: PDF binary blob
- Returns: `{ pdfBlob: Blob, errors: [] }`

### Failure
- Content-Type: text (LaTeX compilation log)
- Body: raw log text
- Parsed for errors via `parseLatexErrors`
- Returns: `{ pdfBlob: null, errors: string[] }`

## Compilation Function

```typescript
interface CompileOptions {
  template: TexTemplate;
  modifiedMainContent: string;
  compiler?: LatexCompiler;
}

interface CompileResult {
  pdfBlob: Blob | null;
  errors: string[];
}

async function compileLatex(options: CompileOptions): Promise<CompileResult>
```
