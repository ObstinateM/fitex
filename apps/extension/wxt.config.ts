import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Fitex',
    description: 'Make your LaTeX CV fit any job description',
    permissions: ['activeTab', 'storage', 'sidePanel', 'tabs', 'scripting'],
    host_permissions: ['http://localhost:4000/*', 'http://localhost:3000/*'],
    content_security_policy: {
      extension_pages:
        "script-src 'self'; connect-src 'self' https://*.i.posthog.com https://*.posthog.com http://localhost:*; object-src 'self'",
    },
  },
});
