import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Fitex",
    description: "Tailor your LaTeX CV to any job description using AI",
    permissions: ["sidePanel", "activeTab", "scripting", "storage"],
    host_permissions: [
      "https://api.openai.com/*",
      "https://latex.ytotech.com/*",
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; frame-src blob: 'self';",
    },
    side_panel: {
      default_path: "sidepanel/index.html",
    },
    action: {
      default_title: "Open Fitex",
    },
  },
});
