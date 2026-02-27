import type { SalaryEstimate } from "@/lib/types";

interface SalaryCardProps {
  estimate: SalaryEstimate;
}

const confidenceColors = {
  high: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  medium: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
  low: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-700" },
};

function formatSalary(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function SalaryCard({ estimate }: SalaryCardProps) {
  const colors = confidenceColors[estimate.confidence];

  return (
    <div className="mb-4 rounded-lg border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Salary Estimate</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}>
          {estimate.confidence} confidence
        </span>
      </div>

      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="text-xs text-gray-500">Market range:</span>
        <span className="text-sm font-semibold text-gray-900">
          {formatSalary(estimate.marketLow, estimate.currency)} &ndash; {formatSalary(estimate.marketHigh, estimate.currency)}
        </span>
      </div>

      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="text-xs text-gray-500">Target:</span>
        <span className="text-sm font-bold text-blue-600">
          {formatSalary(estimate.recommendedAsk, estimate.currency)}
        </span>
      </div>

      <p className="text-xs text-gray-500">{estimate.justification}</p>
      <p className="mt-1 text-[10px] text-gray-400">Estimate based on historical market data.</p>
    </div>
  );
}
