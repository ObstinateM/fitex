import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Fitex',
    description: 'Make your LaTeX CV fit any job description',
    permissions: ['activeTab', 'storage', 'sidePanel'],
  },
});
