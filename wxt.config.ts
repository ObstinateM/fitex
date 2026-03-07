import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Fitex",
    description: "Tailor your LaTeX CV to any job description using AI",
    permissions: ["activeTab", "scripting", "storage"],
    optional_permissions: ["sidePanel"],
    host_permissions: [
      "https://api.openai.com/*",
      "https://latex.ytotech.com/*",
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; frame-src blob: 'self';",
    },
    action: {
      default_title: "Open Fitex",
    },
  },
  hooks: {
    "build:manifestGenerated": (_wxt, manifest) => {
      // WXT auto-adds sidePanel to permissions from the sidepanel entrypoint.
      // Move it to optional_permissions so the extension installs on browsers
      // that don't recognize the sidePanel permission (Opera, older Chromium).
      if (manifest.permissions) {
        manifest.permissions = manifest.permissions.filter(
          (p: string) => p !== "sidePanel",
        );
      }
      // Remove side_panel manifest key — set programmatically in background.ts
      delete (manifest as Record<string, unknown>).side_panel;
    },
  },
});
