# History

## Purpose

Stores and manages the 20 most recent generated CVs. Allows viewing past results and re-running generation with the same inputs.

## Storage

- **Key**: `cv_history` in `chrome.storage.local`
- **Value**: `HistoryEntry[]` array
- **Max entries**: 20 (oldest removed when exceeded)

## Access

- Bottom tab bar "History" tab (visible on Selector and History pages)
- History page shows all entries with view/re-run/delete actions

## Sub-features

- [Auto-Save](./auto-save.md) - How generations are automatically saved
- [History List](./history-list.md) - History page UI and actions
- [View and Re-run](./view-and-rerun.md) - Viewing and re-running from history
