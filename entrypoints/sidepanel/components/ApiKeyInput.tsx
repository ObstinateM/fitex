import { useState } from "react";

interface ApiKeyInputProps {
  onValidated: (key: string) => void;
}

export default function ApiKeyInput({ onValidated }: ApiKeyInputProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);

  async function validate() {
    setError("");
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-") || trimmed.length < 20) {
      setError("Invalid format. API keys start with \"sk-\" and are at least 20 characters.");
      return;
    }
    setValidating(true);
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key.trim()}` },
      });
      if (res.ok) {
        onValidated(key.trim());
      } else if (res.status === 401) {
        setError("Invalid API key.");
      } else {
        setError(`Validation failed (HTTP ${res.status}).`);
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        OpenAI API Key
      </label>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && key.trim() && validate()}
        placeholder="sk-..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={validate}
        disabled={!key.trim() || validating}
        className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {validating ? "Validating..." : "Validate Key"}
      </button>
    </div>
  );
}
