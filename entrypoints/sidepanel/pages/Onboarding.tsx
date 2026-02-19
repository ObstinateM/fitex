import { useState } from "react";
import ApiKeyInput from "../components/ApiKeyInput";
import TemplateUploader from "../components/TemplateUploader";
import ImageUploader from "../components/ImageUploader";
import { setApiKey, setTemplate, setOnboarded, setProfileImage, clearProfileImage } from "@/lib/storage";
import type { TexTemplate, AuxFile } from "@/lib/types";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [savedKey, setSavedKey] = useState("");
  const [template, setTemplateState] = useState<TexTemplate | null>(null);
  const [profileImageState, setProfileImageState] = useState<AuxFile | null>(null);

  async function handleKeyValidated(key: string) {
    await setApiKey(key);
    setSavedKey(key);
    setStep(2);
  }

  async function handleTemplateUploaded(tmpl: TexTemplate) {
    setTemplateState(tmpl);
  }

  async function handleComplete() {
    if (!template) return;
    await setTemplate(template);
    if (profileImageState) {
      await setProfileImage(profileImageState);
    } else {
      await clearProfileImage();
    }
    await setOnboarded(true);
    onComplete();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">CV Assistant</h1>
        <p className="mt-1 text-sm text-gray-500">
          Step {step} of 2 &mdash;{" "}
          {step === 1 ? "Connect OpenAI" : "Upload your CV template"}
        </p>
        <div className="mt-3 flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        </div>
      </div>

      {step === 1 && <ApiKeyInput onValidated={handleKeyValidated} />}

      {step === 2 && (
        <div className="space-y-4">
          <TemplateUploader onUploaded={handleTemplateUploaded} />
          <ImageUploader value={profileImageState} onChange={setProfileImageState} />
          <button
            onClick={handleComplete}
            disabled={!template}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
}
