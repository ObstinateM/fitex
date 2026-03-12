# Cost Estimation

## Purpose

Real-time estimation of token usage and dollar cost for the upcoming generation. Shown on the Selector page before the user clicks "Generate".

## Display

- Format: `~{tokens} tokens · ~${cost}`
- If cost < $0.005: shows `<$0.01`
- Hidden during generation
- Updates reactively when elements or guidance change

## Accounts For

All API calls in the generation pipeline:
1. Story relevance filter call
2. CV tailoring (streaming)
3. Question answering (per question)
4. Salary estimation
5. Pre-generation keyword scan (gpt-4.1-nano)
6. Before/after keyword scans (2x, selected model)

## Sub-features

- [Token Estimation](./token-estimation.md) - How tokens are estimated per component
- [Pricing Model](./pricing-model.md) - Per-model pricing and cost formula
