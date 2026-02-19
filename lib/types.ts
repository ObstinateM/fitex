export type ElementTag = "job-description" | "question";

export interface SelectedElement {
  id: string;
  text: string;
  tag: ElementTag;
  guidance?: string;
}

export interface TexTemplate {
  mainContent: string;
  auxFiles: AuxFile[];
  compiler: LatexCompiler;
}

export interface AuxFile {
  path: string;
  content: string;       // UTF-8 text for .cls/.sty/.tex; base64 for binary
  encoding?: "base64";   // present only for binary files
}

export type LatexCompiler = "pdflatex" | "xelatex" | "lualatex";

export interface AnswerItem {
  question: string;
  answer: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  jobDescription: string;
  pdfBase64: string;
  modifiedTex: string;
  answers: AnswerItem[];
  latexErrors: string[];
}

export interface GenerationResult {
  pdfBlob: Blob | null;
  modifiedTex: string;
  answers: AnswerItem[];
  latexErrors: string[];
  jobDescription: string;
}

export type OpenAIModel = "gpt-5.2" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "o4-mini";

// Message types for content script <-> side panel communication
export type Message =
  | { type: "START_SELECTION" }
  | { type: "STOP_SELECTION" }
  | { type: "CLEAR_SELECTIONS" }
  | { type: "PING" }
  | { type: "PONG" }
  | { type: "ELEMENT_SELECTED"; payload: { id: string; text: string } }
  | { type: "ELEMENT_DESELECTED"; payload: { id: string } };
