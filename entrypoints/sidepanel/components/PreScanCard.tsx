import type { KeywordScanResult } from "@/lib/types";

interface PreScanCardProps {
  result: KeywordScanResult | null;
  loading: boolean;
}

export default function PreScanCard({ result, loading }: PreScanCardProps) {
  if (loading) {
    return (
      <div className="mb-3 rounded-lg border border-gray-200 p-3 animate-pulse">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-5 w-12 rounded-full bg-gray-200" />
        </div>
        <div className="mb-2 h-1.5 rounded-full bg-gray-100" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 w-16 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { keywords, atsPassRate } = result;
  const matched = keywords.filter((k) => k.present).length;
  const total = keywords.length;
  const pct = total > 0 ? (matched / total) * 100 : 0;

  return (
    <div className="mb-3 rounded-lg border border-gray-200 p-3">
      {/* Header: summary + ATS badge */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-gray-800">{matched}/{total}</span> ATS keywords matched
        </p>
        {atsPassRate != null && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              atsPassRate >= 70
                ? "bg-green-100 text-green-700"
                : atsPassRate >= 45
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {atsPassRate}% ATS
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-1.5 rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all ${
            pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-yellow-400" : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Keyword pills */}
      <div className="flex flex-wrap gap-1">
        {keywords.map((k) => (
          <span
            key={k.keyword}
            title={k.category}
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              k.present
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {k.present ? "\u2713" : "\u2717"}
            {k.keyword}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-gray-400">Estimated based on keyword analysis</p>
    </div>
  );
}
