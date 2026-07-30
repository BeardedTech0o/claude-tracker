import { create } from 'zustand'
import type { Accent, Settings } from '@shared/ipcContract'

interface SettingsState {
  settings: Settings | null
  fetchSettings: () => Promise<void>
  setAccent: (accent: Accent) => Promise<void>
  setToken: (token: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  fetchSettings: async () => {
    const settings = await window.api.settings.get()
    set({ settings })
  },
  setAccent: async (accent) => {
    await window.api.settings.setAccent(accent)
    const current = get().settings
    set({ settings: current ? { ...current, accent } : current })
  },
  setToken: async (token) => {
    await window.api.settings.setToken(token)
    const settings = await window.api.settings.get()
    set({ settings })
  }
}))
