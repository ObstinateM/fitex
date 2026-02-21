import { useState } from "react";
import type { GenerationResult } from "@/lib/types";
import PdfViewer from "../components/PdfViewer";
import AnswerCard from "../components/AnswerCard";
import StatusBar from "../components/StatusBar";
import { getApiKey, getTemplate, getModel, getProfileImage } from "@/lib/storage";
import { streamChatCompletion, chatCompletion } from "@/lib/openai";
import { buildReduceToOnePagePrompt, buildMatchScorePrompt } from "@/lib/prompts";
import { compileLatex, countPdfPages } from "@/lib/latex";

interface ResultsProps {
  result: GenerationResult;
  onBack: () => void;
  backLabel?: string;
}

export default function Results({ result: initialResult, onBack, backLabel }: ResultsProps) {
  const [result, setResult] = useState(initialResult);
  const [showTex, setShowTex] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [reducing, setReducing] = useState(false);
  const [reduceCooldown, setReduceCooldown] = useState(false);
  const [reduceStatus, setReduceStatus] = useState("");
  const [matchScore, setMatchScore] = useState<{ score: number; strengths: string[]; gaps: string[] } | null>(null);
  const [scoringMatch, setScoringMatch] = useState(false);
  const [showMatch, setShowMatch] = useState(false);

  function downloadPdf() {
    if (!result.pdfBlob) return;
    const url = URL.createObjectURL(result.pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-cv.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  function openInNewTab() {
    if (!result.pdfBlob) return;
    const url = URL.createObjectURL(result.pdfBlob);
    window.open(url, "_blank");
    // Delay revocation so the new tab has time to load the blob
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function analyzeMatch() {
    if (scoringMatch || !result.modifiedTex || !result.jobDescription) return;
    setScoringMatch(true);
    setShowMatch(true);
    setMatchScore(null);
    try {
      const [apiKey, model] = await Promise.all([getApiKey(), getModel()]);
      if (!apiKey) return;
      const raw = await chatCompletion(apiKey, model, [
        { role: "user", content: buildMatchScorePrompt(result.modifiedTex, result.jobDescription) },
      ]);
      const parsed = JSON.parse(raw.trim());
      setMatchScore(parsed);
    } catch {
      setMatchScore(null);
      setShowMatch(false);
    } finally {
      setScoringMatch(false);
    }
  }

  async function reduceCv() {
    if (reducing || reduceCooldown || !result.pdfBlob || !result.modifiedTex) return;
    setReducing(true);

    try {
      const [apiKey, template, model, profileImage] = await Promise.all([
        getApiKey(),
        getTemplate(),
        getModel(),
        getProfileImage(),
      ]);

      if (!apiKey || !template) {
        setReduceStatus("Missing API key or template.");
        return;
      }

      const pages = await countPdfPages(result.pdfBlob);
      if (pages <= 1) {
        setReduceStatus("Already 1 page!");
        setTimeout(() => setReduceStatus(""), 2000);
        return;
      }

      setReduceStatus(`PDF is ${pages} pages — reducing...`);
      let reducedTex = "";
      await streamChatCompletion(
        apiKey,
        model,
        [{ role: "user", content: buildReduceToOnePagePrompt(result.modifiedTex, pages, result.jobDescription) }],
        {
          onChunk: (chunk) => { reducedTex += chunk; },
        },
      );
      reducedTex = reducedTex.replace(/^```(?:latex|tex)?\n?/, "").replace(/\n?```\s*$/, "").trim();

      setReduceStatus("Recompiling PDF...");
      const templateForCompile = profileImage
        ? { ...template, auxFiles: [...template.auxFiles, profileImage] }
        : template;
      const compileResult = await compileLatex({
        template: templateForCompile,
        modifiedMainContent: reducedTex,
      });

      if (compileResult.pdfBlob) {
        setResult((prev) => ({
          ...prev,
          pdfBlob: compileResult.pdfBlob,
          modifiedTex: reducedTex,
          latexErrors: compileResult.errors,
        }));
        setReduceStatus("");
      } else {
        setReduceStatus("Recompilation failed — kept previous version.");
        setTimeout(() => setReduceStatus(""), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Reduction failed";
      setReduceStatus(`Error: ${message}`);
      setTimeout(() => setReduceStatus(""), 5000);
    } finally {
      setReducing(false);
      setReduceCooldown(true);
      setTimeout(() => setReduceCooldown(false), 2000);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Results</h1>
      </div>

      {/* PDF Preview */}
      {result.pdfBlob ? (
        <div className="mb-4">
          <PdfViewer blob={result.pdfBlob} />
          <div className="mt-2 flex gap-2">
            <button
              onClick={downloadPdf}
              className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={openInNewTab}
              className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title="Open in new tab"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
          {/* Reduce button */}
          <button
            onClick={reduceCv}
            disabled={reducing || reduceCooldown}
            className="mt-2 w-full cursor-pointer rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reducing ? "Reducing..." : "Reduce to 1 page"}
          </button>
          {reducing && <div className="mt-2"><StatusBar message={reduceStatus} /></div>}
          {!reducing && reduceStatus && (
            <p className="mt-2 text-sm text-orange-600">{reduceStatus}</p>
          )}
        </div>
      ) : result.modifiedTex ? (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          PDF compilation failed. Check the errors below.
        </div>
      ) : null}

      {/* Match Score */}
      {result.modifiedTex && result.jobDescription && (
        <div className="mb-4">
          <button
            onClick={analyzeMatch}
            disabled={scoringMatch}
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <span className={`inline-block transition-transform ${showMatch ? "rotate-90" : ""}`}>&#9654;</span>
            {scoringMatch ? "Analyzing match..." : "CV–Job Match Score"}
          </button>
          {showMatch && (
            <div className="mt-2 rounded-lg border border-gray-200 p-3">
              {scoringMatch && !matchScore && (
                <div className="flex justify-center py-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
              {matchScore && (
                <>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-2 flex-1 rounded-full bg-gray-100">
                      <div
                        className={`absolute left-0 top-0 h-2 rounded-full ${
                          matchScore.score >= 70 ? "bg-green-500" : matchScore.score >= 45 ? "bg-yellow-400" : "bg-red-400"
                        }`}
                        style={{ width: `${matchScore.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${
                      matchScore.score >= 70 ? "text-green-600" : matchScore.score >= 45 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {matchScore.score}/100
                    </span>
                  </div>
                  {matchScore.strengths.length > 0 && (
                    <div className="mb-2">
                      <p className="mb-1 text-xs font-medium text-green-700">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {matchScore.strengths.map((s, i) => (
                          <span key={i} className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchScore.gaps.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-red-700">Gaps</p>
                      <div className="flex flex-wrap gap-1">
                        {matchScore.gaps.map((g, i) => (
                          <span key={i} className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* LaTeX Errors */}
      {result.latexErrors.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <span className={`inline-block transition-transform ${showErrors ? "rotate-90" : ""}`}>&#9654;</span>
            LaTeX Errors ({result.latexErrors.length})
          </button>
          {showErrors && (
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-red-50 p-3 text-xs text-red-800">
              {result.latexErrors.join("\n\n")}
            </pre>
          )}
        </div>
      )}

      {/* Answers */}
      {result.answers.length > 0 && (
        <div className="mb-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Answers</h2>
          {result.answers.map((item, i) => (
            <AnswerCard key={i} item={item} />
          ))}
        </div>
      )}

      {/* Modified TeX source */}
      {result.modifiedTex && (
        <div className="mb-4">
          <button
            onClick={() => setShowTex(!showTex)}
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <span className={`inline-block transition-transform ${showTex ? "rotate-90" : ""}`}>&#9654;</span>
            Modified LaTeX Source
          </button>
          {showTex && (
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              {result.modifiedTex}
            </pre>
          )}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        &larr; {backLabel ?? "Adjust & Regenerate"}
      </button>
    </div>
  );
}
