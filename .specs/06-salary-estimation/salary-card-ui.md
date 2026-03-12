# Salary Card UI

## Component: SalaryCard

Displays the salary estimation results on the Results page.

## Layout

Card with border and padding, containing:

### Header Row
- Title: "Salary Estimate"
- Confidence badge (pill-shaped):

| Confidence | Background | Text Color |
|------------|------------|------------|
| high | Green | Green |
| medium | Yellow | Yellow |
| low | Red | Red |

Format: "{confidence} confidence"

### Market Range
- Label: "Market range:"
- Value: "{formatted low} – {formatted high}" in bold

### Recommended Ask
- Label: "Target:"
- Value: "{formatted amount}" in bold blue

### Justification
- 1-2 sentences explaining the estimate basis
- Gray text

### Footer
- "Estimate based on historical market data." in very small gray text

## Salary Formatting

Uses `Intl.NumberFormat` for locale-aware currency formatting:
```typescript
new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: estimate.currency,
  maximumFractionDigits: 0
}).format(amount)
```

Fallback (if `Intl.NumberFormat` throws for unknown currency):
```
"{currency} {amount.toLocaleString()}"
```

## Visibility

Only rendered when `result.salaryEstimate` exists in the generation result.
