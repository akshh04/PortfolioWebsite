import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Keep fake delivery credentials out of the deployable production build.
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'tmp/browser-build'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_EMAILJS_SERVICE_ID: 'browser-test-service',
    VITE_EMAILJS_TEMPLATE_ID: 'browser-test-delivery',
    VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID: 'browser-test-reply',
    VITE_EMAILJS_PUBLIC_KEY: 'browser-tests-only',
  },
});
