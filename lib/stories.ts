import type { Story, StorySelection, OpenAIModel } from "./types";
import { buildStoryRelevancePrompt } from "./prompts";
import { chatCompletion } from "./openai";

/**
 * Filters stories by relevance to a job description using a single API call.
 * Only sends story titles and tags (not full descriptions) to keep the call cheap.
 * Returns an array of selected story IDs with short relevance reasons.
 */
export async function filterRelevantStories(
  stories: Story[],
  jobDescription: string,
  apiKey: string,
  model: OpenAIModel,
): Promise<StorySelection[]> {
  if (stories.length === 0) return [];

  const summaries = stories.map((s) => ({
    id: s.id,
    title: s.title,
    tags: s.tags,
  }));

  const prompt = buildStoryRelevancePrompt(summaries, jobDescription);
  const raw = await chatCompletion(apiKey, model, [
    { role: "user", content: prompt },
  ]);

  const parsed: StorySelection[] = JSON.parse(raw);

  // Validate: only keep selections whose IDs exist in the input stories
  const validIds = new Set(stories.map((s) => s.id));
  return parsed.filter((s) => validIds.has(s.id));
}
