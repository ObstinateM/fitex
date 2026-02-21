import { useState, useEffect } from "react";
import { getHistory, deleteHistoryEntry, clearHistory } from "@/lib/storage";
import type { HistoryEntry } from "@/lib/types";

interface HistoryProps {
  onView: (entry: HistoryEntry) => void;
  onRerun: (entry: HistoryEntry) => void;
}

export default function History({ onView, onRerun }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getHistory().then((h) => {
      setEntries(h);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    await deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearHistory();
    setEntries([]);
    setConfirmClear(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
        <svg className="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No history yet</p>
        <p className="mt-1 text-xs text-gray-400">Generated CVs will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white p-4 pb-16">
      <div className="mb-3 flex items-center justify-between pr-8">
        <h1 className="text-lg font-bold text-gray-900">History</h1>
        <button
          onClick={handleClearAll}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          {confirmClear ? "Confirm clear all?" : "Clear all"}
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-gray-200 p-3"
          >
            <div className="mb-1 flex items-start justify-between">
              <p className="text-xs text-gray-400">
                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className="flex gap-1">
                {entry.answers.length > 0 && (
                  <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                    {entry.answers.length} answer{entry.answers.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <p className="mb-2 line-clamp-2 text-sm text-gray-700">
              {entry.jobDescription || "No job description"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onView(entry)}
                className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                View
              </button>
              <button
                onClick={() => onRerun(entry)}
                className="flex-1 cursor-pointer rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                Re-run
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                onBlur={() => setDeletingId(null)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  deletingId === entry.id
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {deletingId === entry.id ? "Confirm?" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
