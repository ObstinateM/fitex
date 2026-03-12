# Keyword Scan Card UI

## Component: KeywordScanCard

Displays the before/after keyword comparison on the Results page.

## Visibility

Only rendered when both `keywordScanBefore` and `keywordScanAfter` exist in the result.

## Layout

Expandable card (expanded by default).

### Toggle Button
- "ATS Keyword Scan" with triangle expand indicator
- Gray text, hover to darker

### Card Content

#### Merged View Construction

Uses "after" keywords as the source of truth:
```typescript
const keywords = after.keywords.map(k => {
  const beforeItem = beforeMap.get(k.keyword.toLowerCase());
  return {
    keyword: k.keyword,
    category: k.category,
    presentAfter: k.present,
    presentBefore: beforeItem?.present ?? false,
    isNewMatch: k.present && !(beforeItem?.present ?? false),
  };
});
```

#### Summary Line
- Format: `"{afterCount}/{totalCount} matched"`
- If improvement: `"(+{improved} improved)"` in green

#### ATS Pass Rate Badges
- **Before rate**: shown with strikethrough text (gray)
- **After rate**: colored badge
  - Green: ≥70%
  - Yellow: ≥45%
  - Red: <45%
- **Delta**: `"+{difference}"` in green (only when after > before)

#### Progress Bar
Two overlapping horizontal bars:
1. **Gray bar** (behind): before percentage width
2. **Colored bar** (front): after percentage width
   - Green: ≥70%
   - Yellow: ≥45%
   - Red: <45%

#### Keyword Pills
Three visual states:

| State | Condition | Style | Icon |
|-------|-----------|-------|------|
| New match | `isNewMatch` (present after but not before) | Emerald background | ✨ (star) |
| Present | `presentAfter && !isNewMatch` | Green background | ✓ (checkmark) |
| Missing | `!presentAfter` | Red background | ✗ (X mark) |

- Each pill has a `title` attribute showing the keyword category
- Rounded-full pills with 11px font

## History Page Integration

History entries show an ATS pass rate badge on each card:
- Shows `keywordScanAfter.atsPassRate` if available
- Color thresholds: green ≥75%, yellow ≥50%, red <50%
- Format: "ATS {rate}%"
