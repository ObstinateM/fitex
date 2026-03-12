# DOM Element Selection

## Purpose

The primary input mechanism. Users click on elements in any webpage to select text content for CV tailoring. A content script is injected on-demand to handle visual feedback and element tracking.

## Key Characteristics

- Content script injected **on-demand** (not at page load) - only when user activates selection
- Visual feedback: blue outline on hover, green outline + background on selection
- Smart targeting: clicks on inline elements (span, a, strong, etc.) bubble up to the nearest block-level parent
- Multi-element selection with toggle (click to select, click again to deselect)
- Selected elements sent to side panel and tagged as "job-description" or "question"
- Each element can have optional per-element guidance text

## Sub-features

- [Content Script Injection](./content-script-injection.md) - How/when the script is injected
- [Selection Mode](./selection-mode.md) - Visual selection behavior
- [Element Tagging](./element-tagging.md) - Tagging elements and per-element guidance
- [Messaging Protocol](./messaging-protocol.md) - Full message contract

## Webapp Adaptation Notes

In a webapp version, this feature would need to be reimagined:
- Could use a browser extension companion for DOM selection
- Or provide a text paste area as the primary input
- Or integrate with job board APIs to extract job descriptions automatically
