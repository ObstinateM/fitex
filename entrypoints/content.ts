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

    const FILLABLE_SELECTOR =
      'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable="true"]';

    function findFormField(el: HTMLElement): HTMLElement | null {
      // 1. Element itself is fillable
      if (el.matches(FILLABLE_SELECTOR)) return el;

      // 2. Label with for attribute
      if (el.tagName === "LABEL") {
        const forId = el.getAttribute("for");
        if (forId) {
          const target = document.getElementById(forId);
          if (target?.matches(FILLABLE_SELECTOR)) return target;
        }
      }

      // 3. Contains a fillable child
      const child = el.querySelector<HTMLElement>(FILLABLE_SELECTOR);
      if (child) return child;

      // 4. Next siblings (up to 3)
      let sibling = el.nextElementSibling;
      for (let i = 0; i < 3 && sibling; i++, sibling = sibling.nextElementSibling) {
        if ((sibling as HTMLElement).matches(FILLABLE_SELECTOR)) return sibling as HTMLElement;
        const desc = sibling.querySelector<HTMLElement>(FILLABLE_SELECTOR);
        if (desc) return desc;
      }

      // 5. Walk up ancestors (up to 4), check each level's next siblings
      let ancestor = el.parentElement;
      for (let lvl = 0; lvl < 4 && ancestor; lvl++, ancestor = ancestor.parentElement) {
        let sib = ancestor.nextElementSibling;
        for (let j = 0; j < 2 && sib; j++, sib = sib.nextElementSibling) {
          if ((sib as HTMLElement).matches(FILLABLE_SELECTOR)) return sib as HTMLElement;
          const desc = sib.querySelector<HTMLElement>(FILLABLE_SELECTOR);
          if (desc) return desc;
        }
      }

      // 6. aria-labelledby reverse lookup
      const elId = el.id;
      if (elId) {
        const labeled = document.querySelector<HTMLElement>(`[aria-labelledby="${CSS.escape(elId)}"]`);
        if (labeled?.matches(FILLABLE_SELECTOR)) return labeled;
      }

      return null;
    }

    function fillField(field: HTMLElement, value: string) {
      if (field.getAttribute("contenteditable") === "true") {
        field.textContent = value;
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        // Use native setter to bypass React's synthetic setter
        const proto =
          field instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (nativeSetter) {
          nativeSetter.call(field, value);
        } else {
          (field as HTMLInputElement).value = value;
        }
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        field.dispatchEvent(new Event("blur", { bubbles: true }));
      }
    }

    function flashField(field: HTMLElement) {
      const prev = field.style.outline;
      field.style.outline = "2px solid #3b82f6";
      setTimeout(() => {
        field.style.outline = prev;
      }, 1000);
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
          case "FILL_FIELD": {
            const { id, value } = message.payload;
            const el = selectedEls.get(id);
            if (!el) {
              sendResponse({ type: "FILL_RESULT", payload: { id, success: false, error: "Element no longer on page" } } satisfies Message);
              return true;
            }
            const field = findFormField(el);
            if (!field) {
              sendResponse({ type: "FILL_RESULT", payload: { id, success: false, error: "No form field found near element" } } satisfies Message);
              return true;
            }
            try {
              fillField(field, value);
              flashField(field);
              sendResponse({ type: "FILL_RESULT", payload: { id, success: true } } satisfies Message);
            } catch (err) {
              sendResponse({ type: "FILL_RESULT", payload: { id, success: false, error: String(err) } } satisfies Message);
            }
            return true;
          }
          case "PING":
            sendResponse({ type: "PONG" } satisfies Message);
            return true;
        }
      },
    );
  },
});
