import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    // Octokit ships ESM-only; externalizing it means the CJS main bundle
    // tries to require() it at runtime and fails with ERR_REQUIRE_ESM.
    // Bundling it instead lets Rollup convert it (and its ESM deps) to CJS.
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@octokit/rest', '@octokit/plugin-throttling', '@octokit/plugin-retry']
      })
    ],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
