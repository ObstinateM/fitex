import { useState } from "react";
import type { AnswerItem } from "@/lib/types";

interface AnswerCardProps {
  item: AnswerItem;
}

export default function AnswerCard({ item }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed (e.g., document not focused)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="mb-2 text-xs font-medium text-purple-700">Q: {item.question}</p>
      <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.answer}</p>
      <button
        onClick={copy}
        className="mt-2 cursor-pointer rounded px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
