export default defineBackground(() => {
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({ path: "sidepanel.html" });
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else {
    // Fallback for browsers without sidePanel support:
    // Open the app in a persistent popup window instead.
    chrome.action.setPopup({ popup: "" });

    let panelWindowId: number | undefined;

    chrome.action.onClicked.addListener(async () => {
      if (panelWindowId !== undefined) {
        try {
          await chrome.windows.update(panelWindowId, { focused: true });
          return;
        } catch {
          panelWindowId = undefined;
        }
      }

      const win = await chrome.windows.create({
        url: chrome.runtime.getURL("/popup.html"),
        type: "popup",
        width: 420,
        height: 700,
      });
      panelWindowId = win.id;
    });

    chrome.windows.onRemoved.addListener((id) => {
      if (id === panelWindowId) panelWindowId = undefined;
    });
  }
});
