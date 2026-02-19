import type { SelectedElement, ElementTag } from "@/lib/types";
import { truncate } from "@/utils/text";

interface ElementItemProps {
  element: SelectedElement;
  onTagChange: (id: string, tag: ElementTag) => void;
  onRemove: (id: string) => void;
  onGuidanceChange: (id: string, guidance: string) => void;
}

export default function ElementItem({ element, onTagChange, onRemove, onGuidanceChange }: ElementItemProps) {
  const tagColors: Record<ElementTag, string> = {
    "job-description": "bg-blue-100 text-blue-700",
    question: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="rounded-lg border border-gray-200 p-2.5 space-y-2">
      <div className="flex items-start gap-2">
        <select
          value={element.tag}
          onChange={(e) => onTagChange(element.id, e.target.value as ElementTag)}
          className={`shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium ${tagColors[element.tag]}`}
        >
          <option value="job-description">Job Description</option>
          <option value="question">Question</option>
        </select>
        <p className="min-w-0 flex-1 text-xs text-gray-600 leading-relaxed">
          {truncate(element.text, 120)}
        </p>
        <button
          onClick={() => onRemove(element.id)}
          className="shrink-0 cursor-pointer text-gray-400 hover:text-red-500"
          title="Remove"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {element.tag === "question" && (
        <textarea
          value={element.guidance ?? ""}
          onChange={(e) => onGuidanceChange(element.id, e.target.value)}
          placeholder="How should this question be answered? (optional)"
          rows={2}
          className="w-full resize-none rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-purple-400 focus:outline-none"
        />
      )}
    </div>
  );
}
