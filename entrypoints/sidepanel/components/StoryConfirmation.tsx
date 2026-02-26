import { useState } from "react";
import type { Story, StorySelection } from "@/lib/types";

interface StoryConfirmationProps {
  stories: Story[];
  selections: StorySelection[];
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
}

export default function StoryConfirmation({
  stories,
  selections,
  onConfirm,
  onCancel,
}: StoryConfirmationProps) {
  const selectedIdSet = new Set(selections.map((s) => s.id));
  const reasonMap = new Map(selections.map((s) => [s.id, s.reason]));

  const [checked, setChecked] = useState<Set<string>>(selectedIdSet);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const picked = stories.filter((s) => selectedIdSet.has(s.id));
  const rest = stories.filter((s) => !selectedIdSet.has(s.id));

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <h3 className="mb-2 text-sm font-semibold text-blue-800">
        Stories selected for this job ({checked.size})
      </h3>

      {picked.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {picked.map((s) => (
            <li key={s.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={checked.has(s.id)}
                onChange={() => toggle(s.id)}
                className="mt-0.5 accent-blue-600"
              />
              <div className="min-w-0">
                <span className="text-sm font-medium text-gray-900">{s.title}</span>
                {reasonMap.has(s.id) && (
                  <p className="text-xs text-gray-500">{reasonMap.get(s.id)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <>
          <p className="mb-1 text-xs font-medium text-gray-500">Other stories</p>
          <ul className="mb-2 space-y-1.5">
            {rest.map((s) => (
              <li key={s.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{s.title}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(Array.from(checked))}
          className="flex-1 cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Confirm & Generate
        </button>
        <button
          onClick={onCancel}
          className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
