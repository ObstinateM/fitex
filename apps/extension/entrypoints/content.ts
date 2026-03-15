export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let highlightedEl: HTMLElement | null = null;
    let originalOutline = '';
    let originalBackground = '';
    let active = false;

    function highlight(el: HTMLElement) {
      if (highlightedEl && highlightedEl !== el) {
        unhighlight();
      }
      highlightedEl = el;
      originalOutline = el.style.outline;
      originalBackground = el.style.backgroundColor;
      el.style.outline = '2px solid #7c3aed';
      el.style.backgroundColor = 'rgba(124, 58, 237, 0.08)';
    }

    function unhighlight() {
      if (!highlightedEl) return;
      highlightedEl.style.outline = originalOutline;
      highlightedEl.style.backgroundColor = originalBackground;
      highlightedEl = null;
    }

    function onMouseOver(e: MouseEvent) {
      if (!active) return;
      const target = e.target as HTMLElement;
      if (target && target !== document.body && target !== document.documentElement) {
        highlight(target);
      }
    }

    function onClick(e: MouseEvent) {
      if (!active) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const target = (highlightedEl ?? e.target) as HTMLElement;
      const text = target?.innerText?.trim() ?? '';

      cleanup();
      chrome.runtime.sendMessage({ action: 'SELECTION_COMPLETE', text });
    }

    function cleanup() {
      active = false;
      unhighlight();
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('click', onClick, true);
      document.body.style.cursor = '';
    }

    function activate() {
      active = true;
      document.addEventListener('mouseover', onMouseOver, true);
      document.addEventListener('click', onClick, true);
      document.body.style.cursor = 'crosshair';
    }

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'START_SELECTOR') {
        activate();
      } else if (message.action === 'CANCEL_SELECTOR') {
        cleanup();
      }
    });
  },
});
