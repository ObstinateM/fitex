# Stories

## Purpose

Professional stories are structured records of the candidate's experiences, achievements, and projects. They serve as rich context for AI-driven CV tailoring and question answering - providing details beyond what's in the CV template.

## Data Model

```typescript
interface Story {
  id: string;          // crypto.randomUUID()
  title: string;       // Concise title (5-10 words)
  description: string; // Detailed narrative in first person
  tags: string[];      // 2-6 tags (technologies, skills, domains)
  createdAt: number;   // Date.now() timestamp
  updatedAt: number;   // Date.now() timestamp
}
```

## Storage

- **Key**: `user_stories` in `chrome.storage.local`
- **Value**: `Story[]` array
- No limit on story count

## How Stories Are Used

1. **Before generation**: AI filters relevant stories → user confirms selection
2. **During CV tailoring**: Selected stories injected as `<candidate_stories>` XML in the prompt
3. **During question answering**: Selected stories injected for context
4. Stories are NOT sent in their entirety for filtering - only titles and tags (cost optimization)

## Sub-features

- [Story Management](./story-management.md) - CRUD operations
- [Story Enhancement](./story-enhancement.md) - AI polishing
- [Bulk Import](./bulk-import.md) - AI-powered bulk import from text
- [Duplicate Detection](./duplicate-detection.md) - Similarity checking during import
- [Story Relevance Filter](./story-relevance-filter.md) - Pre-generation AI filtering
- [Story Confirmation UI](./story-confirmation-ui.md) - User confirmation before generation
