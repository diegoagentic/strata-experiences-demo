import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Bug workaround (2026-07-14) · vite v7.3.x con Node 22 deja handles
 * abiertos tras `vite build` completar · el proceso npm nunca termina
 * y Vercel lo mata con SIGKILL tras ~2min. Este plugin fuerza exit
 * limpio tras el closeBundle hook (heredado del pattern establecido
 * en strata-landing / UI-Dealer / UI-Manufacturer).
 */
const forceExitAfterBuild = () => ({
  name: 'force-exit-after-build',
  apply: 'build' as const,
  closeBundle() {
    setTimeout(() => process.exit(0), 100)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), forceExitAfterBuild()],
  // Puerto propio para no colisionar con inbound-outbound (:8086)
  server: {
    port: 8095,
    strictPort: false,
  },
  resolve: {
    alias: {
      // strata-ds doesn't have a library build — resolve to source
      // directly so both dev and prod builds work.
      'strata-design-system': path.resolve(__dirname, 'packages/strata-ds/src/components/index.ts'),
    },
  },
})
