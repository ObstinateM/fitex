# Pricing Model

## Per-Model Pricing

Prices in USD per 1 million tokens:

| Model | Input ($/1M) | Output ($/1M) |
|-------|-------------|---------------|
| `gpt-5.2` | $2.00 | $8.00 |
| `gpt-4.1` | $2.00 | $8.00 |
| `gpt-4.1-mini` | $0.40 | $1.60 |
| `gpt-4.1-nano` | $0.10 | $0.40 |
| `o4-mini` | $1.10 | $4.40 |

```typescript
const MODEL_PRICING: Record<OpenAIModel, { input: number; output: number }> = {
  "gpt-5.2":      { input: 2.0,  output: 8.0 },
  "gpt-4.1":      { input: 2.0,  output: 8.0 },
  "gpt-4.1-mini": { input: 0.4,  output: 1.6 },
  "gpt-4.1-nano": { input: 0.1,  output: 0.4 },
  "o4-mini":      { input: 1.1,  output: 4.4 },
};
```

## Cost Formula

The total cost is split into two parts because the pre-scan always uses `gpt-4.1-nano`:

### Main Cost (selected model)
```
totalInput = filterInput + cvTailoringInput + questionInputs + salaryInput + (kwScanInput × 2)
totalOutput = filterOutput + cvTailoringOutput + questionOutputs + salaryOutput + (kwScanOutput × 2)

mainCost = (totalInput / 1,000,000) × pricing.input
         + (totalOutput / 1,000,000) × pricing.output
```

### Pre-Scan Cost (always gpt-4.1-nano)
```
preScanCost = (preScanInput / 1,000,000) × nanoPricing.input
            + (preScanOutput / 1,000,000) × nanoPricing.output
```

**Design rationale for hardcoding `gpt-4.1-nano`**: The pre-generation scan fires automatically and repeatedly — debounced on every job description element change. Because it runs in the background without explicit user intent, using the user's selected model (which may be `gpt-5.2` or `gpt-4.1`) would silently rack up costs. `gpt-4.1-nano` is the cheapest available model and is fully capable of keyword extraction, so it is hardcoded for this non-critical background task. The user's model choice only affects the main generation calls (CV tailoring, question answering, salary, keyword scans post-generation).

### Total
```
totalCost = mainCost + preScanCost
totalTokens = totalInput + totalOutput + preScanInput + preScanOutput
```

## Display Formatting

- **Tokens**: comma-separated via `toLocaleString()` (e.g., "12,450")
- **Cost**:
  - If < $0.005 → `"<$0.01"`
  - Otherwise → `"$" + cost.toFixed(2)` (e.g., "$0.03")
- Full format: `~12,450 tokens · ~$0.03`

## Cost Examples

Rough estimates for a typical generation (1500-char template, 2000-char job description, 2 questions, 5 stories):

| Model | Estimated Cost |
|-------|---------------|
| gpt-5.2 | ~$0.04 |
| gpt-4.1 | ~$0.04 |
| gpt-4.1-mini | ~$0.01 |
| gpt-4.1-nano | <$0.01 |
| o4-mini | ~$0.02 |
