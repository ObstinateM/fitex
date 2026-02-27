import { useState, useEffect, useRef } from "react";
import type { GenerationResult, SelectedElement, ElementTag, OpenAIModel, Story, StorySelection } from "@/lib/types";
import { sendToContentScript, getActiveTabId, onMessage } from "@/lib/messaging";
import { getApiKey, getTemplate, getModel, getContext, getProfileImage, getStories } from "@/lib/storage";
import { streamChatCompletion, chatCompletion } from "@/lib/openai";
import { buildCvTailoringPrompt, buildQuestionAnswerPrompt, buildKeywordScanPrompt, buildSalaryEstimatePrompt } from "@/lib/prompts";
import { compileLatex } from "@/lib/latex";
import { filterRelevantStories } from "@/lib/stories";
import ElementList from "../components/ElementList";
import GuidanceEditor from "../components/GuidanceEditor";
import StatusBar from "../components/StatusBar";
import StoryConfirmation from "../components/StoryConfirmation";

const MODEL_PRICING: Record<OpenAIModel, { input: number; output: number }> = {
  "gpt-5.2":      { input: 2.0,  output: 8.0 },
  "gpt-4.1":      { input: 2.0,  output: 8.0 },
  "gpt-4.1-mini": { input: 0.4,  output: 1.6 },
  "gpt-4.1-nano": { input: 0.1,  output: 0.4 },
  "o4-mini":      { input: 1.1,  output: 4.4 },
};

interface SelectorProps {
  previousElements: SelectedElement[];
  previousGuidance: string;
  onGenerated: (result: GenerationResult, elements: SelectedElement[], guidance: string) => void;
}

export default function Selector({ previousElements, previousGuidance, onGenerated }: SelectorProps) {
  const [selecting, setSelecting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [elements, setElements] = useState<SelectedElement[]>(previousElements);
  const [guidance, setGuidance] = useState(previousGuidance);
  const [status, setStatus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [costEstimate, setCostEstimate] = useState<{ tokens: number; cost: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Story confirmation state
  const [storyConfirmation, setStoryConfirmation] = useState<{
    stories: Story[];
    selections: StorySelection[];
    resolve: (selectedIds: string[] | null) => void;
  } | null>(null);

  useEffect(() => {
    if (elements.length === 0) {
      setCostEstimate(null);
      return;
    }
    let cancelled = false;
    async function estimate() {
      const [template, model, stories] = await Promise.all([getTemplate(), getModel(), getStories()]);
      if (cancelled) return;
      const templateTokens = template ? Math.ceil(template.mainContent.length / 4) : 0;
      const jobDescTokens = elements
        .filter((el) => el.tag === "job-description")
        .reduce((sum, el) => sum + Math.ceil((el.text.length + (el.guidance?.length ?? 0)) / 4), 0);
      const guidanceTokens = Math.ceil(guidance.length / 4);
      const systemOverhead = 500;

      // Relevance filter call: sends story titles + tags + job description
      const storySummaryTokens = stories.reduce(
        (sum, s) => sum + Math.ceil((s.title.length + s.tags.join(", ").length) / 4), 0,
      );
      const filterInput = stories.length > 0 ? storySummaryTokens + jobDescTokens + 300 : 0;
      const filterOutput = stories.length > 0 ? Math.min(stories.length * 30, 500) : 0;

      // Estimate tokens from selected stories injected into prompts (~half of stories selected on average)
      const avgSelectedCount = Math.ceil(stories.length * 0.5);
      const storyContentTokens = stories
        .slice(0, avgSelectedCount)
        .reduce((sum, s) => sum + Math.ceil((s.title.length + s.description.length + s.tags.join(", ").length) / 4), 0);

      const inputTokens = templateTokens + jobDescTokens + guidanceTokens + storyContentTokens + systemOverhead;
      const outputTokens = templateTokens;
      const questionCount = elements.filter((el) => el.tag === "question").length;
      const qInput = questionCount * (templateTokens + jobDescTokens + storyContentTokens + 300);
      const qOutput = questionCount * 500;
      // Salary estimation: sends job description + CV template
      const salaryInput = jobDescTokens + templateTokens + 400;
      const salaryOutput = 200;
      const totalInput = filterInput + inputTokens + qInput + salaryInput;
      const totalOutput = filterOutput + outputTokens + qOutput + salaryOutput;
      const pricing = MODEL_PRICING[model];
      const cost = (totalInput / 1_000_000) * pricing.input + (totalOutput / 1_000_000) * pricing.output;
      setCostEstimate({ tokens: totalInput + totalOutput, cost });
    }
    estimate();
    return () => { cancelled = true; };
  }, [elements, guidance]);

  // Listen for messages from content script
  useEffect(() => {
    const unlisten = onMessage((msg) => {
      if (msg.type === "ELEMENT_SELECTED") {
        setElements((prev) => [
          ...prev,
          { id: msg.payload.id, text: msg.payload.text, tag: "job-description" },
        ]);
      } else if (msg.type === "ELEMENT_DESELECTED") {
        setElements((prev) => prev.filter((el) => el.id !== msg.payload.id));
      }
    });
    return unlisten;
  }, []);

  async function injectContentScript(): Promise<boolean> {
    const tabId = await getActiveTabId();
    if (!tabId) return false;

    // Check if already injected
    const pong = await sendToContentScript({ type: "PING" });
    if (pong?.type === "PONG") return true;

    // Inject
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content-scripts/content.js"],
      });
      return true;
    } catch {
      return false;
    }
  }

  async function toggleSelection() {
    if (toggling) return;
    setToggling(true);
    try {
      if (selecting) {
        await sendToContentScript({ type: "STOP_SELECTION" });
        setSelecting(false);
      } else {
        const ok = await injectContentScript();
        if (!ok) {
          setStatus("Cannot inject on this page. Try a regular webpage.");
          setTimeout(() => setStatus(""), 3000);
          return;
        }
        await sendToContentScript({ type: "START_SELECTION" });
        setSelecting(true);
      }
    } finally {
      setToggling(false);
    }
  }

  function handleTagChange(id: string, tag: ElementTag) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, tag } : el)),
    );
  }

  async function handleRemove(id: string) {
    setElements((prev) => prev.filter((el) => el.id !== id));
    await sendToContentScript({ type: "DESELECT_ELEMENT", payload: { id } });
  }

  function handleElementGuidanceChange(id: string, guidance: string) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, guidance } : el)),
    );
  }

  const hasJobDescription = elements.some((el) => el.tag === "job-description");
  const questions = elements.filter((el) => el.tag === "question");

  async function generate() {
    if (generating || cooldown) return;
    setGenerating(true);

    // Stop selection mode
    if (selecting) {
      await sendToContentScript({ type: "STOP_SELECTION" });
      setSelecting(false);
    }

    try {
      const [apiKey, template, model, context, profileImage] = await Promise.all([
        getApiKey(),
        getTemplate(),
        getModel(),
        getContext(),
        getProfileImage(),
      ]);

      if (!apiKey) {
        setStatus("Missing API key. Please re-configure in settings.");
        return;
      }

      if (hasJobDescription && !template) {
        setStatus("Missing LaTeX template. Please re-configure in settings.");
        return;
      }

      const jobDescription = elements
        .filter((el) => el.tag === "job-description")
        .map((el) => el.guidance ? `${el.text}\n\n[Focus note: ${el.guidance}]` : el.text)
        .join("\n\n");

      // Story relevance filter + confirmation
      let selectedStories: Story[] = [];
      const allStories = await getStories();
      if (allStories.length > 0 && jobDescription) {
        setStatus("Selecting relevant stories...");
        const selections = await filterRelevantStories(allStories, jobDescription, apiKey, model);

        // Show confirmation UI and wait for user decision
        const confirmedIds = await new Promise<string[] | null>((resolve) => {
          setStoryConfirmation({ stories: allStories, selections, resolve });
        });
        setStoryConfirmation(null);

        if (confirmedIds === null) {
          // User cancelled
          setStatus("");
          return;
        }

        const confirmedSet = new Set(confirmedIds);
        selectedStories = allStories.filter((s) => confirmedSet.has(s.id));
      }

      let modifiedTex = "";
      let pdfBlob: Blob | null = null;
      let latexErrors: string[] = [];
      let keywordScanBefore: import("@/lib/types").KeywordScanResult | undefined;
      let keywordScanAfter: import("@/lib/types").KeywordScanResult | undefined;
      let salaryEstimate: import("@/lib/types").SalaryEstimate | undefined;

      if (hasJobDescription && template) {
        // Step 1: Tailor CV + scan keywords (before) in parallel
        setStatus("Tailoring CV & scanning keywords...");
        const cvPrompt = buildCvTailoringPrompt(template.mainContent, jobDescription, guidance, context, selectedStories);

        abortRef.current = new AbortController();

        const beforeScanPromise = chatCompletion(apiKey, model, [
          { role: "user", content: buildKeywordScanPrompt(jobDescription, template.mainContent) },
        ]).then((raw) => {
          try {
            const parsed = JSON.parse(raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```\s*$/, "").trim());
            keywordScanBefore = { keywords: parsed };
          } catch { /* silently ignore */ }
        }).catch(() => { /* silently ignore */ });

        const tailorPromise = streamChatCompletion(
          apiKey,
          model,
          [{ role: "user", content: cvPrompt }],
          {
            onChunk: (chunk) => {
              modifiedTex += chunk;
            },
          },
          abortRef.current.signal,
        );

        await Promise.all([tailorPromise, beforeScanPromise]);

        // Clean markdown code fences if present
        modifiedTex = modifiedTex.replace(/^```(?:latex|tex)?\n?/, "").replace(/\n?```\s*$/, "").trim();

        // Step 1.5: Scan keywords (after) on the tailored CV
        setStatus("Scanning tailored CV keywords...");
        try {
          const afterRaw = await chatCompletion(apiKey, model, [
            { role: "user", content: buildKeywordScanPrompt(jobDescription, modifiedTex) },
          ]);
          const afterParsed = JSON.parse(afterRaw.replace(/^```(?:json)?\n?/, "").replace(/\n?```\s*$/, "").trim());
          keywordScanAfter = { keywords: afterParsed };
        } catch { /* silently ignore */ }

        // Step 2: Compile LaTeX
        setStatus("Compiling PDF...");
        const templateForCompile = profileImage
          ? { ...template, auxFiles: [...template.auxFiles, profileImage] }
          : template;
        const compileResult = await compileLatex({
          template: templateForCompile,
          modifiedMainContent: modifiedTex,
        });
        pdfBlob = compileResult.pdfBlob;
        latexErrors = compileResult.errors;
      }

      // Step 3: Answer questions + estimate salary in parallel
      const answers: import("@/lib/types").AnswerItem[] = [];
      const parallelTasks: Promise<void>[] = [];

      if (questions.length > 0) {
        setStatus(`Answering ${questions.length} question(s)...`);
        const cvSource = template?.mainContent ?? "";
        const answerPromises = questions.map(async (q) => {
          const prompt = buildQuestionAnswerPrompt(q.text, jobDescription, cvSource, context, q.guidance, selectedStories);
          const answer = await chatCompletion(apiKey, model, [
            { role: "user", content: prompt },
          ]);
          return { question: q.text, answer, elementId: q.id };
        });
        parallelTasks.push(
          Promise.all(answerPromises).then((results) => { answers.push(...results); }),
        );
      }

      // Salary estimation (non-critical, runs in parallel)
      if (jobDescription && template) {
        parallelTasks.push(
          chatCompletion(apiKey, model, [
            { role: "user", content: buildSalaryEstimatePrompt(jobDescription, template.mainContent) },
          ]).then((raw) => {
            try {
              const parsed = JSON.parse(raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```\s*$/, "").trim());
              salaryEstimate = parsed;
            } catch { /* silently ignore */ }
          }).catch(() => { /* silently ignore */ }),
        );
      }

      if (parallelTasks.length > 0) await Promise.all(parallelTasks);

      onGenerated(
        {
          pdfBlob,
          modifiedTex,
          answers,
          latexErrors,
          jobDescription,
          keywordScanBefore,
          keywordScanAfter,
          salaryEstimate,
        },
        elements,
        guidance,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setStatus(`Error: ${message}`);
      setTimeout(() => setStatus(""), 5000);
    } finally {
      abortRef.current = null;
      setGenerating(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white p-4 pb-16">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">CV Assistant</h1>
      </div>

      {/* Selection toggle */}
      <button
        onClick={toggleSelection}
        disabled={generating}
        className={`mb-4 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          selecting
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={`inline-block h-2 w-2 rounded-full ${selecting ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
        {selecting ? "Selecting elements..." : "Select Elements"}
      </button>

      {/* Selected elements */}
      <div className="mb-4">
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Selected ({elements.length})
        </h2>
        <ElementList
          elements={elements}
          onTagChange={handleTagChange}
          onRemove={handleRemove}
          onGuidanceChange={handleElementGuidanceChange}
        />
      </div>

      {/* Guidance */}
      <div className="mb-4">
        <GuidanceEditor value={guidance} onChange={setGuidance} />
      </div>

      {/* Story confirmation */}
      {storyConfirmation && (
        <div className="mb-4">
          <StoryConfirmation
            stories={storyConfirmation.stories}
            selections={storyConfirmation.selections}
            onConfirm={(ids) => storyConfirmation.resolve(ids)}
            onCancel={() => storyConfirmation.resolve(null)}
          />
        </div>
      )}

      {/* Status / Generate */}
      {status && !generating && (
        <p className="mb-3 text-sm text-red-600">{status}</p>
      )}
      {generating && !storyConfirmation && <div className="mb-3"><StatusBar message={status} /></div>}

      {costEstimate && !generating && (
        <p className="mb-2 text-center text-xs text-gray-400">
          ~{costEstimate.tokens.toLocaleString()} tokens &middot; ~{costEstimate.cost < 0.005 ? "<$0.01" : `$${costEstimate.cost.toFixed(2)}`}
        </p>
      )}

      <button
        onClick={generate}
        disabled={elements.length === 0 || generating || cooldown}
        className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
