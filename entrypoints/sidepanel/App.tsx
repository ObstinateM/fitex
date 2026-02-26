import { useState, useEffect, Component, type ReactNode } from "react";
import { getOnboarded, addHistoryEntry } from "@/lib/storage";
import Onboarding from "./pages/Onboarding";
import Selector from "./pages/Selector";
import Results from "./pages/Results";
import History from "./pages/History";
import SettingsModal from "./components/SettingsModal";
import type { GenerationResult, SelectedElement, HistoryEntry } from "@/lib/types";

// Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <p className="mb-2 text-sm font-medium text-red-600">Something went wrong</p>
          <p className="mb-4 text-xs text-gray-500">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type Page = "onboarding" | "selector" | "results" | "settings" | "history";

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  }
  return btoa(chunks.join(""));
}

function base64ToBlob(base64: string, type = "application/pdf"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

function AppInner() {
  const [page, setPage] = useState<Page>("onboarding");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [previousElements, setPreviousElements] = useState<SelectedElement[]>([]);
  const [previousGuidance, setPreviousGuidance] = useState("");
  const [loading, setLoading] = useState(true);
  const [returnPage, setReturnPage] = useState<"selector" | "results" | "history">("selector");
  const [fromHistory, setFromHistory] = useState(false);

  useEffect(() => {
    getOnboarded().then((onboarded) => {
      if (onboarded) setPage("selector");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  function openSettings() {
    if (page === "selector" || page === "results" || page === "history") setReturnPage(page);
    setPage("settings");
  }

  async function handleGenerated(res: GenerationResult, elements: SelectedElement[], guidance: string) {
    setResult(res);
    setPreviousElements(elements);
    setPreviousGuidance(guidance);
    setFromHistory(false);
    setPage("results");

    // Auto-save to history
    if (res.pdfBlob || res.modifiedTex) {
      try {
        const pdfBase64 = res.pdfBlob ? await blobToBase64(res.pdfBlob) : "";
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          jobDescription: res.jobDescription.slice(0, 200),
          pdfBase64,
          modifiedTex: res.modifiedTex,
          answers: res.answers,
          latexErrors: res.latexErrors,
          elements,
          guidance,
          keywordScanBefore: res.keywordScanBefore,
          keywordScanAfter: res.keywordScanAfter,
        };
        await addHistoryEntry(entry);
      } catch {
        // Storage quota exceeded or other error — silently skip history save
      }
    }
  }

  function handleRerunFromHistory(entry: HistoryEntry) {
    if (entry.elements && entry.elements.length > 0) {
      setPreviousElements(entry.elements);
      setPreviousGuidance(entry.guidance ?? "");
    } else {
      // Backward compat: synthesise an element from the stored job description snippet
      setPreviousElements([{
        id: crypto.randomUUID(),
        text: entry.jobDescription,
        tag: "job-description",
      }]);
      setPreviousGuidance("");
    }
    setPage("selector");
  }

  function handleViewHistory(entry: HistoryEntry) {
    const pdfBlob = entry.pdfBase64 ? base64ToBlob(entry.pdfBase64) : null;
    setResult({
      pdfBlob,
      modifiedTex: entry.modifiedTex,
      answers: entry.answers,
      latexErrors: entry.latexErrors,
      jobDescription: entry.jobDescription,
      keywordScanBefore: entry.keywordScanBefore,
      keywordScanAfter: entry.keywordScanAfter,
    });
    setFromHistory(true);
    setPage("results");
  }

  const showSettings = page !== "onboarding" && page !== "settings";
  const showTabBar = page === "selector" || page === "history";
  const activeTab = page === "history" ? "history" : "generate";

  return (
    <>
      {showSettings && (
        <div className="fixed top-3 right-3 z-40">
          <button
            onClick={openSettings}
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}
      {page === "settings" && <SettingsModal onClose={() => setPage(returnPage)} />}

      {page === "onboarding" && (
        <Onboarding onComplete={() => setPage("selector")} />
      )}
      {page === "selector" && (
        <Selector
          previousElements={previousElements}
          previousGuidance={previousGuidance}
          onGenerated={handleGenerated}
        />
      )}
      {page === "history" && (
        <History onView={handleViewHistory} onRerun={handleRerunFromHistory} />
      )}
      {page === "results" && result && (
        <Results
          result={result}
          backLabel={fromHistory ? "Back to History" : undefined}
          onBack={() => {
            if (fromHistory) {
              setFromHistory(false);
              setPage("history");
            } else {
              setPage("selector");
            }
          }}
        />
      )}

      {/* Bottom tab bar */}
      {showTabBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white">
          <button
            onClick={() => setPage("selector")}
            className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              activeTab === "generate" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Generate
          </button>
          <button
            onClick={() => setPage("history")}
            className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              activeTab === "history" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
