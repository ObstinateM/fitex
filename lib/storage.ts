import type { TexTemplate, LatexCompiler, OpenAIModel, AuxFile, HistoryEntry } from "./types";

const KEYS = {
  apiKey: "openai_api_key",
  template: "tex_template",
  compiler: "latex_compiler",
  model: "openai_model",
  onboarded: "is_onboarded",
  context: "user_context",
  profileImage: "profile_image",
  history: "cv_history",
} as const;

async function get<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

async function set(key: string, value: unknown): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

// API Key
export async function getApiKey(): Promise<string | undefined> {
  return get<string>(KEYS.apiKey);
}

export async function setApiKey(key: string): Promise<void> {
  await set(KEYS.apiKey, key);
}

// Template
export async function getTemplate(): Promise<TexTemplate | undefined> {
  return get<TexTemplate>(KEYS.template);
}

export async function setTemplate(template: TexTemplate): Promise<void> {
  await set(KEYS.template, template);
}

// Compiler
export async function getCompiler(): Promise<LatexCompiler> {
  return (await get<LatexCompiler>(KEYS.compiler)) ?? "pdflatex";
}

export async function setCompiler(compiler: LatexCompiler): Promise<void> {
  await set(KEYS.compiler, compiler);
}

// Model
export async function getModel(): Promise<OpenAIModel> {
  return (await get<OpenAIModel>(KEYS.model)) ?? "gpt-5.2";
}

export async function setModel(model: OpenAIModel): Promise<void> {
  await set(KEYS.model, model);
}

// Onboarded flag
export async function getOnboarded(): Promise<boolean> {
  return (await get<boolean>(KEYS.onboarded)) ?? false;
}

export async function setOnboarded(value: boolean): Promise<void> {
  await set(KEYS.onboarded, value);
}

// User context (persistent info to guide the AI)
export async function getContext(): Promise<string> {
  return (await get<string>(KEYS.context)) ?? "";
}

export async function setContext(context: string): Promise<void> {
  await set(KEYS.context, context);
}

// Profile image
export async function getProfileImage(): Promise<AuxFile | null> {
  return (await get<AuxFile>(KEYS.profileImage)) ?? null;
}

export async function setProfileImage(img: AuxFile): Promise<void> {
  await set(KEYS.profileImage, img);
}

export async function clearProfileImage(): Promise<void> {
  await chrome.storage.local.remove(KEYS.profileImage);
}

// History
export async function getHistory(): Promise<HistoryEntry[]> {
  return (await get<HistoryEntry[]>(KEYS.history)) ?? [];
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const history = await getHistory();
  history.unshift(entry);
  await set(KEYS.history, history);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const history = await getHistory();
  await set(KEYS.history, history.filter((e) => e.id !== id));
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(KEYS.history);
}
