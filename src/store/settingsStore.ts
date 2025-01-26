import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  streamResponses: boolean
  setStreamResponses: (stream: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      streamResponses: true,
      setStreamResponses: (stream) => set({ streamResponses: stream }),
    }),
    {
      name: 'settings-store'
    }
  )
)