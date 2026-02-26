import { useState, useEffect } from "react";
import { getStories, addStory, updateStory, deleteStory, getApiKey, getModel } from "@/lib/storage";
import { chatCompletion } from "@/lib/openai";
import { buildStoryEnhancePrompt } from "@/lib/prompts";
import type { Story } from "@/lib/types";

interface StoriesProps {
  onBack: () => void;
}

export default function Stories({ onBack }: StoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [enhancingNew, setEnhancingNew] = useState(false);

  async function handleEnhance(
    notes: string,
    title: string,
    onResult: (description: string, tags: string[]) => void,
    setLoading: (v: boolean) => void,
  ) {
    if (!notes.trim()) return;
    setLoading(true);
    try {
      const [apiKey, model] = await Promise.all([getApiKey(), getModel()]);
      if (!apiKey) throw new Error("No API key configured");
      const prompt = buildStoryEnhancePrompt(notes, title);
      const raw = await chatCompletion(apiKey, model, [{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw) as { description: string; tags: string[] };
      onResult(parsed.description, parsed.tags);
    } catch (e) {
      console.error("Enhance failed:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getStories().then(setStories);
  }, []);

  async function handleAdd() {
    if (!newTitle.trim()) return;
    const story: Story = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      tags: parseTags(newTags),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addStory(story);
    setStories((prev) => [story, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewTags("");
    setShowAddForm(false);
  }

  function startEditing(story: Story) {
    setEditingId(story.id);
    setEditTitle(story.title);
    setEditDescription(story.description);
    setEditTags(story.tags.join(", "));
    setExpandedId(story.id);
  }

  async function handleSaveEdit(id: string) {
    if (!editTitle.trim()) return;
    const updates = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags: parseTags(editTags),
      updatedAt: Date.now(),
    };
    await updateStory(id, updates);
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    await deleteStory(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  }

  function parseTags(input: string): string[] {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={onBack}
          className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="flex-1 text-base font-bold text-gray-900">Stories</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Add form */}
        {showAddForm && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-2.5">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Story title"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe what you did, how you did it, and why it mattered..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
            />
            <input
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Tags (comma-separated, e.g. Python, Leadership, AWS)"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Story
              </button>
              <button
                onClick={() =>
                  handleEnhance(
                    newDescription,
                    newTitle,
                    (desc, tags) => {
                      setNewDescription(desc);
                      setNewTags(tags.join(", "));
                    },
                    setEnhancingNew,
                  )
                }
                disabled={!newDescription.trim() || enhancingNew}
                className="cursor-pointer rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enhancingNew ? "Enhancing..." : "Enhance"}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {stories.length === 0 && !showAddForm && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No stories yet</p>
            <p className="mt-1 text-xs text-gray-400">Add your professional stories to help the AI tailor your CV.</p>
          </div>
        )}

        {/* Story list */}
        {stories.map((story) => {
          const isExpanded = expandedId === story.id;
          const isEditing = editingId === story.id;
          const isDeleting = deletingId === story.id;

          return (
            <div key={story.id} className="rounded-lg border border-gray-200 p-3">
              {/* Header row */}
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : story.id)}
                  className="mt-0.5 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{story.title}</p>
                  {story.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {story.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                      />
                      <input
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags (comma-separated)"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(story.id)}
                          disabled={!editTitle.trim()}
                          className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() =>
                            handleEnhance(
                              editDescription,
                              editTitle,
                              (desc, tags) => {
                                setEditDescription(desc);
                                setEditTags(tags.join(", "));
                              },
                              (v) => setEnhancingId(v ? story.id : null),
                            )
                          }
                          disabled={!editDescription.trim() || enhancingId === story.id}
                          className="cursor-pointer rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {enhancingId === story.id ? "Enhancing..." : "Enhance"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {story.description ? (
                        <p className="whitespace-pre-wrap text-sm text-gray-600">{story.description}</p>
                      ) : (
                        <p className="text-sm italic text-gray-400">No description</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => startEditing(story)}
                          className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        {isDeleting ? (
                          <button
                            onClick={() => handleDelete(story.id)}
                            className="flex-1 cursor-pointer rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Confirm Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeletingId(story.id)}
                            className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {stories.length > 0 && (
          <p className="pt-1 text-center text-xs text-gray-400">
            {stories.length} {stories.length === 1 ? "story" : "stories"}
          </p>
        )}
      </div>
    </div>
  );
}
