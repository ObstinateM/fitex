interface GuidanceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function GuidanceEditor({ value, onChange }: GuidanceEditorProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        Guidance <span className="font-normal text-gray-400">(optional)</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="e.g. Emphasize Python & system design. Mention leadership experience."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
      />
    </div>
  );
}
