import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /*
         * Function form rather than the id->chunk map. The map only places the
         * *named entry modules* into a chunk; React's real implementation
         * lives in dependency files like react-dom/cjs/*.js, which were left
         * behind in the main bundle and produced a useless 0.07 kB
         * vendor-react chunk. Matching on path captures the whole package.
         */
        manualChunks(id) {
          // Vite's __vitePreload helper is a virtual module. Left unassigned,
          // Rollup parked it inside vendor-three — which made every chunk that
          // uses the helper (including Home) statically depend on 810 kB of
          // three.js. Pin it to the chunk everything already loads.
          if (id.includes('vite/preload-helper')) return 'vendor-react';

          if (!id.includes('node_modules')) return;
          const path = id.replace(/\\/g, '/');

          if (/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'vendor-react';
          if (path.includes('node_modules/framer-motion/')) return 'vendor-motion';
          if (/node_modules\/(three|@react-three)\//.test(path)) return 'vendor-three';
          if (path.includes('node_modules/@tsparticles/')) return 'vendor-particles';
          if (path.includes('node_modules/lucide-react/')) return 'vendor-icons';
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
