import { useState, useEffect } from "react";
import {
  getApiKey, setApiKey,
  getCompiler, setCompiler,
  getModel, setModel,
  getContext, setContext,
  setTemplate,
  getProfileImage, setProfileImage, clearProfileImage,
} from "@/lib/storage";
import type { LatexCompiler, OpenAIModel, TexTemplate, AuxFile } from "@/lib/types";
import TemplateUploader from "./TemplateUploader";
import ImageUploader from "./ImageUploader";

interface SettingsProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsProps) {
  const [apiKey, setApiKeyState] = useState("");
  const [compiler, setCompilerState] = useState<LatexCompiler>("pdflatex");
  const [model, setModelState] = useState<OpenAIModel>("gpt-5.2");
  const [context, setContextState] = useState("");
  const [profileImage, setProfileImageState] = useState<AuxFile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getApiKey(), getCompiler(), getModel(), getContext(), getProfileImage()]).then(
      ([key, comp, mod, ctx, img]) => {
        if (key) setApiKeyState(key);
        setCompilerState(comp);
        setModelState(mod);
        setContextState(ctx);
        setProfileImageState(img);
      },
    );
  }, []);

  async function save() {
    await Promise.all([
      setApiKey(apiKey),
      setCompiler(compiler),
      setModel(model),
      setContext(context),
      profileImage ? setProfileImage(profileImage) : clearProfileImage(),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTemplateUploaded(tmpl: TexTemplate) {
    await setTemplate(tmpl);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-900">Settings</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* API Key */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Model */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Model</label>
          <select
            value={model}
            onChange={(e) => setModelState(e.target.value as OpenAIModel)}
            className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="gpt-5.2">GPT-5.2</option>
            <option value="gpt-4.1">GPT-4.1</option>
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
            <option value="gpt-4.1-nano">GPT-4.1 Nano</option>
            <option value="o4-mini">o4-mini</option>
          </select>
        </div>

        {/* Compiler */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">LaTeX Compiler</label>
          <select
            value={compiler}
            onChange={(e) => setCompilerState(e.target.value as LatexCompiler)}
            className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="pdflatex">pdflatex</option>
            <option value="xelatex">xelatex</option>
            <option value="lualatex">lualatex</option>
          </select>
        </div>

        {/* Context */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Context</label>
          <p className="mb-1.5 text-xs text-gray-400">
            Persistent info to guide the AI (e.g. skills to highlight, target role, preferences).
          </p>
          <textarea
            value={context}
            onChange={(e) => setContextState(e.target.value)}
            rows={3}
            placeholder="e.g. I'm targeting senior backend roles. Emphasize my Python and distributed systems experience."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Template re-upload */}
        <TemplateUploader onUploaded={handleTemplateUploaded} />

        {/* Profile image */}
        <ImageUploader value={profileImage} onChange={setProfileImageState} />

        {/* Save */}
        <button
          onClick={save}
          className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
