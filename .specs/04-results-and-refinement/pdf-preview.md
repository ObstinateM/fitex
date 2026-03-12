# PDF Preview

## Overview

Renders the compiled PDF in an embedded viewer with download and open-in-tab actions.

## PdfViewer Component

- Renders PDF in an `<iframe>` using a blob URL
- URL: `URL.createObjectURL(blob) + "#toolbar=0"`
- Dimensions: 400px height, full width
- Blob URL revoked on component unmount via useEffect cleanup

### `#toolbar=0` iframe parameter

The `#toolbar=0` fragment is appended to the blob URL before setting it as the iframe `src`. This is a PDF viewer hint (supported by Chrome's built-in PDF viewer and other PDF plugins) that hides the browser's default PDF toolbar (which includes download, print, zoom, and page navigation controls). The toolbar is hidden because:

1. **Redundant controls**: the Results page already provides its own Download PDF and Open in New Tab buttons directly below the preview
2. **Space conservation**: the side panel has limited vertical space (the iframe is only 400px tall); removing the toolbar maximizes the visible PDF area
3. **Cleaner UI**: avoids a second row of action buttons that would duplicate functionality

## Actions

### Download PDF
- Creates a temporary `<a>` element
- Sets `href` to blob URL and `download="tailored-cv.pdf"`
- Triggers click programmatically
- Revokes URL after click

### Open in New Tab
- `window.open(url, "_blank")`
- URL revocation delayed 5 seconds (`setTimeout`) to allow the new tab time to load

## Conditional Display

| Condition | Display |
|-----------|---------|
| `pdfBlob` exists | PDF viewer + action buttons |
| No `pdfBlob` but `modifiedTex` exists | Red error banner: "PDF compilation failed. Check the errors below." |
| Neither | Nothing shown |
