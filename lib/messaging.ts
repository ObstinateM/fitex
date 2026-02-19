import type { Message } from "./types";

export async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

export async function sendToContentScript(message: Message): Promise<Message | undefined> {
  const tabId = await getActiveTabId();
  if (tabId === undefined) return undefined;
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    return undefined;
  }
}

export function onMessage(
  callback: (message: Message, sender: chrome.runtime.MessageSender) => void | Message | Promise<Message | void>,
): () => void {
  const listener = (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: Message) => void,
  ) => {
    const result = callback(message, sender);
    if (result instanceof Promise) {
      result.then((r) => sendResponse(r ?? undefined));
      return true; // keep channel open for async
    }
    if (result) sendResponse(result);
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
