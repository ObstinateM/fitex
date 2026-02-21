import type { Message } from "@/lib/types";

export default defineContentScript({
  matches: ["<all_urls>"],
  registration: "runtime",
  main() {
    // Inject styles into page (guard against duplicate injection)
    const STYLE_ID = "__cv_ext_styles";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .__cv_ext_hover {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: crosshair !important;
        }
        .__cv_ext_selected {
          outline: 2px solid #22c55e !important;
          outline-offset: 2px !important;
          background-color: rgba(34, 197, 94, 0.08) !important;
        }
      `;
      document.head.appendChild(style);
    }

    let active = false;
    let hoveredEl: HTMLElement | null = null;
    const selectedEls = new Map<string, HTMLElement>();

    const INLINE_TAGS = new Set([
      "SPAN", "A", "STRONG", "EM", "B", "I", "U", "CODE", "SMALL", "SUB", "SUP", "MARK",
    ]);

    function findBestElement(target: HTMLElement): HTMLElement {
      let el = target;
      while (el.parentElement && INLINE_TAGS.has(el.tagName)) {
        el = el.parentElement;
      }
      return el;
    }

    function extractText(el: HTMLElement): string {
      return (el.innerText || el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function elementId(el: HTMLElement): string | undefined {
      for (const [id, selEl] of selectedEls) {
        if (selEl === el) return id;
      }
      return undefined;
    }

    function onMouseOver(e: Event) {
      if (!active) return;
      const target = findBestElement(e.target as HTMLElement);
      if (hoveredEl && hoveredEl !== target) {
        hoveredEl.classList.remove("__cv_ext_hover");
      }
      if (!target.classList.contains("__cv_ext_selected")) {
        target.classList.add("__cv_ext_hover");
      }
      hoveredEl = target;
    }

    function onMouseOut(_e: Event) {
      if (!active || !hoveredEl) return;
      hoveredEl.classList.remove("__cv_ext_hover");
      hoveredEl = null;
    }

    function onClick(e: Event) {
      if (!active) return;
      e.preventDefault();
      e.stopPropagation();

      const target = findBestElement(e.target as HTMLElement);
      target.classList.remove("__cv_ext_hover");

      const existingId = elementId(target);
      if (existingId) {
        target.classList.remove("__cv_ext_selected");
        selectedEls.delete(existingId);
        chrome.runtime.sendMessage({
          type: "ELEMENT_DESELECTED",
          payload: { id: existingId },
        } satisfies Message).catch(() => {});
      } else {
        const id = crypto.randomUUID();
        target.classList.add("__cv_ext_selected");
        selectedEls.set(id, target);
        chrome.runtime.sendMessage({
          type: "ELEMENT_SELECTED",
          payload: { id, text: extractText(target) },
        } satisfies Message).catch(() => {});
      }
    }

    function activate() {
      active = true;
      document.addEventListener("mouseover", onMouseOver, true);
      document.addEventListener("mouseout", onMouseOut, true);
      document.addEventListener("click", onClick, true);
    }

    function deactivate() {
      active = false;
      if (hoveredEl) {
        hoveredEl.classList.remove("__cv_ext_hover");
        hoveredEl = null;
      }
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("mouseout", onMouseOut, true);
      document.removeEventListener("click", onClick, true);
    }

    function clearAll() {
      for (const [, el] of selectedEls) {
        el.classList.remove("__cv_ext_selected");
      }
      selectedEls.clear();
    }

    chrome.runtime.onMessage.addListener(
      (message: Message, _sender, sendResponse) => {
        switch (message.type) {
          case "START_SELECTION":
            activate();
            break;
          case "STOP_SELECTION":
            deactivate();
            break;
          case "CLEAR_SELECTIONS":
            clearAll();
            break;
          case "DESELECT_ELEMENT": {
            const el = selectedEls.get(message.payload.id);
            if (el) {
              el.classList.remove("__cv_ext_selected");
              selectedEls.delete(message.payload.id);
            }
            break;
          }
          case "PING":
            sendResponse({ type: "PONG" } satisfies Message);
            return true;
        }
      },
    );
  },
});
