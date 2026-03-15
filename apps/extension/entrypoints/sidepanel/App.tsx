import { useState, useEffect, useRef } from 'react';
import { getToken, clearToken, authedFetch } from '../../src/lib/auth-storage';
import { initPostHog, posthog } from '../../src/lib/posthog';
import './App.css';

interface User {
  name: string;
  email: string;
  isOnboarded?: boolean;
}

type FlowState =
  | 'IDLE'
  | 'SELECTING'
  | 'TYPE_SELECTION'
  | 'SELECTED'
  | 'ATS_ANALYZING'
  | 'GENERATING'
  | 'PREVIEW'
  | 'QUESTIONING'
  | 'ANSWERING'
  | 'ANSWER_READY'
  | 'ERROR';

const WEB_URL = import.meta.env.VITE_WEB_URL ?? 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [flowState, setFlowState] = useState<FlowState>('IDLE');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredTex, setTailoredTex] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  const [adjustmentComment, setAdjustmentComment] = useState('');
  const [atsKeywords, setAtsKeywords] = useState<string[]>([]);
  const [relevantStoryIds, setRelevantStoryIds] = useState<string[]>([]);
  const [pendingSelection, setPendingSelection] = useState('');
  const [question, setQuestion] = useState('');
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [answerCopied, setAnswerCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    initPostHog();
    checkAuth();
    hydrateFromStorage();

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area === 'local') {
        if (changes.fitex_session_token?.newValue) checkAuth();
        if (changes.pendingSelection?.newValue) {
          setPendingSelection(changes.pendingSelection.newValue);
          setFlowState('TYPE_SELECTION');
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function hydrateFromStorage() {
    const result = await chrome.storage.local.get([
      'tailoredTex',
      'interviewAnswer',
      'selectedJobDescription',
      'selectedQuestion',
      'pendingSelection',
    ]);

    if (result.tailoredTex) {
      setTailoredTex(result.tailoredTex);
      setJobDescription(result.selectedJobDescription ?? '');
      setFlowState('PREVIEW');
      compilePdf(result.tailoredTex);
    } else if (result.interviewAnswer) {
      setInterviewAnswer(result.interviewAnswer);
      setQuestion(result.selectedQuestion ?? '');
      setFlowState('ANSWER_READY');
    } else if (result.selectedJobDescription) {
      setJobDescription(result.selectedJobDescription);
      setFlowState('SELECTED');
    } else if (result.selectedQuestion) {
      setQuestion(result.selectedQuestion);
      setFlowState('QUESTIONING');
    } else if (result.pendingSelection) {
      setPendingSelection(result.pendingSelection);
      setFlowState('TYPE_SELECTION');
    }
  }

  async function checkAuth() {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          posthog.identify(data.user.email, { name: data.user.name });
        } else {
          await clearToken();
          setUser(null);
        }
      } else {
        await clearToken();
        setUser(null);
      }
    } catch {
      await clearToken();
      setUser(null);
    }
    setLoading(false);
  }

  async function handleSignOut() {
    posthog.capture('extension_sign_out');
    posthog.reset();
    await clearToken();
    await chrome.storage.local.remove([
      'selectedJobDescription',
      'tailoredTex',
      'selectorActive',
      'pendingSelection',
      'selectedQuestion',
      'interviewAnswer',
    ]);
    setUser(null);
    resetFlow();
  }

  function handleSignIn() {
    chrome.tabs.create({ url: `${WEB_URL}/extension-auth` });
  }

  function resetFlow() {
    setFlowState('IDLE');
    setJobDescription('');
    setTailoredTex('');
    setAdjustmentComment('');
    setAtsKeywords([]);
    setRelevantStoryIds([]);
    setError('');
    setPendingSelection('');
    setQuestion('');
    setInterviewAnswer('');
    setAnswerCopied(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
  }

  async function handleStartSelector() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/content.js'],
      });
    } catch {
      // Content script may already be injected
    }

    chrome.tabs.sendMessage(tab.id, { action: 'START_SELECTOR' });
    await chrome.storage.local.set({ selectorActive: true });
    setFlowState('SELECTING');
  }

  async function handleClear() {
    await chrome.storage.local.remove([
      'selectedJobDescription',
      'tailoredTex',
      'pendingSelection',
      'selectedQuestion',
      'interviewAnswer',
    ]);
    resetFlow();
  }

  async function handleSelectAsJobDescription() {
    await chrome.storage.local.set({ selectedJobDescription: pendingSelection });
    await chrome.storage.local.remove(['pendingSelection']);
    setJobDescription(pendingSelection);
    setPendingSelection('');
    setFlowState('SELECTED');
  }

  async function handleSelectAsQuestion() {
    await chrome.storage.local.set({ selectedQuestion: pendingSelection });
    await chrome.storage.local.remove(['pendingSelection']);
    setQuestion(pendingSelection);
    setPendingSelection('');
    setFlowState('QUESTIONING');
  }

  async function handleGetAnswer() {
    setFlowState('ANSWERING');
    setError('');

    try {
      const body: Record<string, string> = { question };
      if (jobDescription) body.jobDescription = jobDescription;

      const res = await authedFetch('/api/stories/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to generate answer');
      }

      const { answer } = await res.json();
      setInterviewAnswer(answer);
      await chrome.storage.local.set({ interviewAnswer: answer });
      setFlowState('ANSWER_READY');
      posthog.capture('interview_answer_generated');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setFlowState('ERROR');
    }
  }

  async function handleCopyAnswer() {
    await navigator.clipboard.writeText(interviewAnswer);
    setAnswerCopied(true);
    setTimeout(() => setAnswerCopied(false), 2000);
  }

  async function compilePdf(tex: string) {
    try {
      const res = await authedFetch('/api/cv/compile-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex, includeImages: true }),
      });
      if (!res.ok) throw new Error('Compilation failed');
      const blob = await res.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch {
      // PDF preview unavailable but tex is still valid
    }
  }

  async function handleGenerate(withAdjustment = false) {
    setError('');

    if (!withAdjustment) {
      setFlowState('ATS_ANALYZING');
      try {
        const atsRes = await authedFetch('/api/cv/analyze-ats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription }),
        });
        if (!atsRes.ok) {
          const data = await atsRes.json().catch(() => null);
          throw new Error(data?.message ?? 'ATS analysis failed');
        }
        const { keywords, relevantStoryIds: storyIds } = await atsRes.json();
        setAtsKeywords(keywords);
        setRelevantStoryIds(storyIds);
        await tailorWithData(jobDescription, undefined, keywords, storyIds);
      } catch (err: any) {
        setError(err.message ?? 'Something went wrong');
        setFlowState('ERROR');
        posthog.capture('ats_analysis_failed', { error: err.message });
      }
    } else {
      await tailorWithData(
        jobDescription,
        adjustmentComment.trim() || undefined,
        atsKeywords,
        relevantStoryIds,
      );
    }
  }

  async function tailorWithData(
    jd: string,
    comment?: string,
    keywords?: string[],
    storyIds?: string[],
  ) {
    setFlowState('GENERATING');
    try {
      const body: Record<string, unknown> = { jobDescription: jd };
      if (comment) body.adjustmentComment = comment;
      if (keywords && keywords.length > 0) body.atsKeywords = keywords;
      if (storyIds && storyIds.length > 0) body.storyIds = storyIds;

      const res = await authedFetch('/api/cv/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Tailoring failed');
      }
      const { tex } = await res.json();
      setTailoredTex(tex);
      setAdjustmentComment('');
      await chrome.storage.local.set({ tailoredTex: tex });
      setFlowState('PREVIEW');
      posthog.capture('cv_generated', {
        with_adjustment: !!comment,
        ats_keywords_count: keywords?.length ?? 0,
      });
      compilePdf(tex);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setFlowState('ERROR');
      posthog.capture('cv_generation_failed', { error: err.message });
    }
  }

  function handleDownload() {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'fitex-cv.pdf';
    a.click();
  }

  function handleOpenInTab() {
    if (!pdfUrl) return;
    chrome.tabs.create({ url: pdfUrl });
  }

  // ─── Render ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="sidepanel">
        <div className="loading-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="sidepanel">
        <div className="header">
          <h1 className="brand">Fitex</h1>
        </div>
        <div className="user-card">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
        <div className="content">
          {!user.isOnboarded ? (
            <div className="onboarding-card">
              <p className="onboarding-text">Complete setup to start tailoring CVs</p>
              <a
                href={`${WEB_URL}/onboarding`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Complete setup
              </a>
            </div>
          ) : (
            <>
              {flowState === 'IDLE' && (
                <button className="btn btn-primary" onClick={handleStartSelector}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8 }}>
                    <path d="M2 2h5v2H4v3H2V2zm7 0h5v5h-2V4H9V2zM2 9h2v3h3v2H2V9zm12 0v5H9v-2h3V9h2z" fill="currentColor"/>
                  </svg>
                  Select from page
                </button>
              )}

              {flowState === 'SELECTING' && (
                <div className="status-card">
                  <div className="pulse-dot" />
                  <p className="status-text">Click on any text on the page</p>
                </div>
              )}

              {flowState === 'TYPE_SELECTION' && (
                <>
                  <div className="job-preview">
                    <p className="job-preview-label">Selected text</p>
                    <p className="job-preview-text">
                      {pendingSelection.slice(0, 200)}{pendingSelection.length > 200 ? '...' : ''}
                    </p>
                  </div>
                  <p className="type-selection-prompt">What is this?</p>
                  <div className="action-bar">
                    <button className="btn btn-primary btn-half" onClick={handleSelectAsJobDescription}>
                      Job description
                    </button>
                    <button className="btn btn-answer btn-half" onClick={handleSelectAsQuestion}>
                      Interview question
                    </button>
                  </div>
                  <button className="btn btn-ghost" onClick={handleClear}>
                    Cancel
                  </button>
                </>
              )}

              {flowState === 'SELECTED' && (
                <>
                  <div className="job-preview">
                    <p className="job-preview-label">Job description</p>
                    <p className="job-preview-text">{jobDescription.slice(0, 300)}{jobDescription.length > 300 ? '...' : ''}</p>
                  </div>
                  <div className="action-bar">
                    <button className="btn btn-primary" onClick={() => handleGenerate()}>
                      Generate CV
                    </button>
                    <button className="btn btn-secondary" onClick={handleClear}>
                      Clear
                    </button>
                  </div>
                </>
              )}

              {flowState === 'ATS_ANALYZING' && (
                <div className="generating">
                  <div className="spinner" />
                  <p className="generating-text">Analyzing job requirements...</p>
                  <p className="generating-hint">Identifying ATS keywords</p>
                </div>
              )}

              {flowState === 'GENERATING' && (
                <div className="generating">
                  <div className="spinner" />
                  <p className="generating-text">Tailoring your CV...</p>
                  <p className="generating-hint">This may take a moment</p>
                </div>
              )}

              {flowState === 'PREVIEW' && (
                <>
                  {pdfUrl && (
                    <div className="pdf-preview">
                      <iframe ref={iframeRef} src={pdfUrl} title="CV Preview" />
                    </div>
                  )}
                  <div className="action-bar">
                    <button className="btn btn-primary btn-half" onClick={handleOpenInTab}>
                      Open in tab
                    </button>
                    <button className="btn btn-secondary btn-half" onClick={handleDownload}>
                      Download
                    </button>
                  </div>
                  <div className="readjust-form">
                    <textarea
                      className="readjust-input"
                      placeholder="Want changes? Describe what to adjust..."
                      value={adjustmentComment}
                      onChange={(e) => setAdjustmentComment(e.target.value)}
                      rows={2}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleGenerate(true)}
                      disabled={!adjustmentComment.trim()}
                    >
                      Readjust
                    </button>
                  </div>
                  <button className="btn btn-ghost" onClick={handleClear}>
                    Start over
                  </button>
                </>
              )}

              {flowState === 'QUESTIONING' && (
                <>
                  <div className="job-preview">
                    <p className="answer-label">Interview question</p>
                    <p className="job-preview-text">{question.slice(0, 300)}{question.length > 300 ? '...' : ''}</p>
                  </div>
                  <button className="btn btn-answer" onClick={handleGetAnswer}>
                    Get answer
                  </button>
                  <button className="btn btn-ghost" onClick={handleClear}>
                    Clear
                  </button>
                </>
              )}

              {flowState === 'ANSWERING' && (
                <div className="generating">
                  <div className="spinner spinner-green" />
                  <p className="generating-text">Crafting your answer...</p>
                  <p className="generating-hint">Using your stories & background</p>
                </div>
              )}

              {flowState === 'ANSWER_READY' && (
                <>
                  <div className="job-preview">
                    <p className="answer-label">Interview question</p>
                    <p className="job-preview-text">{question.slice(0, 150)}{question.length > 150 ? '...' : ''}</p>
                  </div>
                  <div className="answer-card">
                    <p className="answer-label">Your answer</p>
                    <p className="answer-text">{interviewAnswer}</p>
                  </div>
                  <button className="btn btn-answer" onClick={handleCopyAnswer}>
                    {answerCopied ? 'Copied!' : 'Copy answer'}
                  </button>
                  <button className="btn btn-ghost" onClick={handleClear}>
                    Start over
                  </button>
                </>
              )}

              {flowState === 'ERROR' && (
                <div className="error-card">
                  <p className="error-text">{error}</p>
                  <button className="btn btn-primary" onClick={() => handleGenerate()}>
                    Try again
                  </button>
                  <button className="btn btn-ghost" onClick={handleClear}>
                    Start over
                  </button>
                </div>
              )}
            </>
          )}
          <button className="btn btn-ghost" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidepanel">
      <div className="hero">
        <h1 className="brand">Fitex</h1>
        <p className="tagline">Tailor your CV to any job</p>
      </div>
      <button className="btn btn-primary btn-sign-in" onClick={handleSignIn}>
        Sign in
      </button>
      <p className="hint">Opens fitex.app to sign in</p>
    </div>
  );
}

export default App;
