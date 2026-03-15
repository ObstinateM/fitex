const WEB_URL = import.meta.env.VITE_WEB_URL ?? 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const CALLBACK_URL = `${WEB_URL}/extension-auth/callback`;
const TOKEN_KEY = 'fitex_session_token';

export default defineBackground(() => {
  const processedTabs = new Set<number>();

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'SELECTION_COMPLETE') {
      chrome.storage.local.set({ pendingSelection: message.text, selectorActive: false });
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const url = changeInfo.url ?? tab.url;
    const isComplete = changeInfo.status === 'complete' || changeInfo.url;
    if (
      !isComplete ||
      !url?.startsWith(CALLBACK_URL) ||
      processedTabs.has(tabId)
    ) {
      return;
    }

    processedTabs.add(tabId);

    try {
      const parsed = new URL(url!);
      const token = parsed.searchParams.get('token');
      if (!token) return;

      const res = await fetch(
        `${API_URL}/api/auth/one-time-token/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        },
      );

      if (!res.ok) return;

      const data = await res.json();
      const sessionToken = data?.token;
      if (sessionToken) {
        await chrome.storage.local.set({ [TOKEN_KEY]: sessionToken });
      }
    } finally {
      chrome.tabs.remove(tabId);
      processedTabs.delete(tabId);
    }
  });
});
