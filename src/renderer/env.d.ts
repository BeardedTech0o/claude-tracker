/// <reference types="vite/client" />

import type { PreloadApi } from '@shared/ipcContract'

declare global {
  interface Window {
    api: PreloadApi
  }
}
