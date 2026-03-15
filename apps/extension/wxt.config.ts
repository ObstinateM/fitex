import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Fitex',
    description: 'Make your LaTeX CV fit any job description',
    permissions: ['activeTab', 'storage', 'sidePanel', 'tabs', 'scripting'],
    host_permissions: ['http://localhost:4000/*', 'http://localhost:3000/*'],
  },
});
