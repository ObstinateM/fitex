import { useState } from "react";
import type { AnswerItem } from "@/lib/types";

interface AnswerCardProps {
  item: AnswerItem;
  onFill?: (elementId: string, answer: string) => Promise<boolean>;
}

export default function AnswerCard({ item, onFill }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);
  const [fillStatus, setFillStatus] = useState<"idle" | "filling" | "success" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed (e.g., document not focused)
    }
  }

  async function fill() {
    if (!item.elementId || !onFill || fillStatus === "filling") return;
    setFillStatus("filling");
    const ok = await onFill(item.elementId, item.answer);
    setFillStatus(ok ? "success" : "error");
    setTimeout(() => setFillStatus("idle"), 2000);
  }

  const fillLabel = {
    idle: "Fill",
    filling: "Filling...",
    success: "Filled!",
    error: "Failed",
  }[fillStatus];

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="mb-2 text-xs font-medium text-purple-700">Q: {item.question}</p>
      <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.answer}</p>
      <div className="mt-2 flex gap-1">
        <button
          onClick={copy}
          className="cursor-pointer rounded px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        {item.elementId && onFill && (
          <button
            onClick={fill}
            disabled={fillStatus === "filling"}
            className={`cursor-pointer rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              fillStatus === "success"
                ? "text-green-600"
                : fillStatus === "error"
                  ? "text-red-600"
                  : "text-purple-600 hover:bg-purple-50"
            }`}
          >
            {fillLabel}
          </button>
        )}
      </div>
    </div>
  );
}
