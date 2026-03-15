import { useState, useEffect, useRef } from 'react';
import { getToken, clearToken, authedFetch } from '../../src/lib/auth-storage';
import { initPostHog, posthog } from '../../src/lib/posthog';
import './App.css';

interface User {
  name: string;
  email: string;
  isOnboarded?: boolean;
}

type FlowState = 'IDLE' | 'SELECTING' | 'SELECTED' | 'GENERATING' | 'PREVIEW' | 'ERROR';

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
        if (changes.selectedJobDescription?.newValue) {
          setJobDescription(changes.selectedJobDescription.newValue);
          setFlowState('SELECTED');
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function hydrateFromStorage() {
    const result = await chrome.storage.local.get([
      'selectedJobDescription',
      'tailoredTex',
    ]);
    if (result.tailoredTex) {
      setTailoredTex(result.tailoredTex);
      setJobDescription(result.selectedJobDescription ?? '');
      setFlowState('PREVIEW');
      compilePdf(result.tailoredTex);
    } else if (result.selectedJobDescription) {
      setJobDescription(result.selectedJobDescription);
      setFlowState('SELECTED');
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
    setError('');
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
    // Popup will close when user clicks the page
  }

  async function handleClear() {
    await chrome.storage.local.remove(['selectedJobDescription', 'tailoredTex']);
    resetFlow();
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
    setFlowState('GENERATING');
    setError('');

    try {
      const body: Record<string, string> = { jobDescription };
      if (withAdjustment && adjustmentComment.trim()) {
        body.adjustmentComment = adjustmentComment.trim();
      }

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
      posthog.capture('cv_generated', { with_adjustment: withAdjustment });
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
      <div className="popup">
        <div className="loading-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="popup">
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
                  Select job description
                </button>
              )}

              {flowState === 'SELECTING' && (
                <div className="status-card">
                  <div className="pulse-dot" />
                  <p className="status-text">Click on the job description on the page</p>
                </div>
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
    <div className="popup">
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
