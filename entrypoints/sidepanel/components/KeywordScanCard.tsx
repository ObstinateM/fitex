import { useState } from "react";
import type { KeywordScanResult } from "@/lib/types";

interface KeywordScanCardProps {
  before: KeywordScanResult;
  after: KeywordScanResult;
}

export default function KeywordScanCard({ before, after }: KeywordScanCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Build a merged view using the "after" keywords as the source of truth
  const afterMap = new Map(after.keywords.map((k) => [k.keyword.toLowerCase(), k]));
  const beforeMap = new Map(before.keywords.map((k) => [k.keyword.toLowerCase(), k]));

  const keywords = after.keywords.map((k) => {
    const beforeItem = beforeMap.get(k.keyword.toLowerCase());
    const wasPresentBefore = beforeItem?.present ?? false;
    return {
      keyword: k.keyword,
      category: k.category,
      presentAfter: k.present,
      presentBefore: wasPresentBefore,
      isNewMatch: k.present && !wasPresentBefore,
    };
  });

  const totalCount = keywords.length;
  const beforeCount = keywords.filter((k) => k.presentBefore).length;
  const afterCount = keywords.filter((k) => k.presentAfter).length;
  const improved = afterCount - beforeCount;

  const beforePct = totalCount > 0 ? (beforeCount / totalCount) * 100 : 0;
  const afterPct = totalCount > 0 ? (afterCount / totalCount) * 100 : 0;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <span className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}>&#9654;</span>
        ATS Keyword Scan
      </button>
      {expanded && (
        <div className="mt-2 rounded-lg border border-gray-200 p-3">
          {/* Summary */}
          <p className="mb-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-800">{afterCount}/{totalCount}</span> matched
            {improved > 0 && (
              <span className="ml-1 text-green-600 font-medium">(+{improved} improved)</span>
            )}
          </p>

          {/* Progress bar */}
          <div className="relative mb-3 h-2 rounded-full bg-gray-100">
            {/* Before (gray) */}
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-gray-300 transition-all"
              style={{ width: `${beforePct}%` }}
            />
            {/* After (colored overlay) */}
            <div
              className={`absolute left-0 top-0 h-2 rounded-full transition-all ${
                afterPct >= 70 ? "bg-green-500" : afterPct >= 45 ? "bg-yellow-400" : "bg-red-400"
              }`}
              style={{ width: `${afterPct}%` }}
            />
          </div>

          {/* Keyword pills */}
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <span
                key={k.keyword}
                title={k.category}
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  k.isNewMatch
                    ? "bg-emerald-100 text-emerald-800"
                    : k.presentAfter
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {k.isNewMatch ? (
                  <span title="Newly matched after tailoring">&#10024;</span>
                ) : k.presentAfter ? (
                  <span>&#10003;</span>
                ) : (
                  <span>&#10005;</span>
                )}
                {k.keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
