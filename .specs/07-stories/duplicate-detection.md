# Duplicate Detection

## Overview

During bulk import, parsed stories are compared against existing stories to warn about potential duplicates. Warnings are displayed but don't prevent import — the user decides.

## Algorithm (`findSimilarStories`)

For each parsed story, checks against every existing story using two methods in sequence. Either method triggering is enough to flag a warning. The function returns a `Map<number, SimilarityWarning>` keyed by parsed story index.

### Method 1 -- Title Substring Match (50% threshold)

```typescript
const shorter = pTitle.length < exTitle.length ? pTitle : exTitle;
const longer = pTitle.length < exTitle.length ? exTitle : pTitle;
const titleMatch = shorter.length > 0 && longer.includes(shorter)
  ? shorter.length / longer.length
  : 0;
if (titleMatch > 0.5) { /* flag as duplicate */ }
```

Steps:
1. Lowercase both titles
2. Identify the shorter and longer title by character length
3. Check if the shorter title is a substring of the longer title using `String.includes()`
4. If yes, calculate the ratio: `shorter.length / longer.length`
5. **Threshold**: ratio must be strictly greater than **0.5 (50%)**
6. If the shorter title is empty (`shorter.length === 0`), `titleMatch` is 0 (no match)

Example: "API Gateway Migration" (20 chars) vs "Led API Gateway Migration Project" (36 chars). The shorter string is contained in the longer. Ratio = 20/36 = 55.6% > 50% -- match.

Counter-example: "API" (3 chars) vs "Led API Gateway Migration Project" (36 chars). Ratio = 3/36 = 8.3% -- no match (too short relative to the full title).

### Method 2 -- Tag Jaccard Similarity (60% threshold)

Only evaluated if Method 1 did not trigger, and both stories have at least one tag.

```typescript
const exTags = new Set(ex.tags.map((t) => t.toLowerCase()));
let intersection = 0;
for (const t of pTags) {
  if (exTags.has(t)) intersection++;
}
const union = new Set([...pTags, ...exTags]).size;
if (union > 0 && intersection / union > 0.6) { /* flag as duplicate */ }
```

Steps:
1. Lowercase all tags in both the parsed and existing story
2. Count the intersection: iterate over parsed tags, check membership in existing tag set
3. Compute the union: merge both sets, take the `.size`
4. **Threshold**: Jaccard coefficient must be strictly greater than **0.6 (60%)**
5. Guard: only computed when both stories have tags (`pTags.size > 0 && ex.tags.length > 0`) and union > 0

Example: Tags `["python", "aws", "microservices"]` vs `["python", "aws", "docker"]` -- intersection = 2 (python, aws), union = 4. Jaccard = 2/4 = 50% -- no match (below 60%).

Example: Tags `["python", "aws", "docker"]` vs `["python", "aws", "docker", "k8s"]` -- intersection = 3, union = 4. Jaccard = 3/4 = 75% > 60% -- match.

### First-match-per-story flagging

Once a match is found for a given parsed story (via either method), the inner loop over existing stories `break`s immediately. This means:
- Each parsed story gets at most **one** warning
- The warning references the **first** matching existing story found
- Subsequent existing stories are not checked for that parsed story

## Return Value

```typescript
Map<number, SimilarityWarning>
// key: index of the parsed story
// value: { existingTitle: string }
```

## UI Display

- Amber-colored warning text with triangle icon
- Format: "Similar to: {existingTitle}"
- Shown below the tags input for the flagged story
- User can still import the story (checkbox remains checked)

## Types

```typescript
interface SimilarityWarning {
  existingTitle: string;
}
```
