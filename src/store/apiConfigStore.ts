import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ApiConfig, CreateApiConfigInput, UpdateApiConfigInput } from '../types/api-config'

interface ApiConfigStore {
  configs: ApiConfig[]
  addConfig: (config: CreateApiConfigInput) => void
  updateConfig: (config: UpdateApiConfigInput) => void
  removeConfig: (id: string) => void
  getDefaultConfig: () => ApiConfig | undefined
  setDefaultConfig: (id: string) => void
}

export const useApiConfigStore = create<ApiConfigStore>()(
  persist(
    (set, get) => ({
      configs: [],

      addConfig: (configInput) => {
        const newConfig: ApiConfig = {
          id: crypto.randomUUID(),
          ...configInput,
          headers: configInput.headers || [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        // If this is the first config or marked as default, ensure it's the only default
        if (configInput.isDefault || get().configs.length === 0) {
          set((state) => ({
            configs: [
              ...state.configs.map(c => ({ ...c, isDefault: false })),
              { ...newConfig, isDefault: true }
            ]
          }))
        } else {
          set((state) => ({
            configs: [...state.configs, newConfig]
          }))
        }
      },

      updateConfig: (configInput) => {
        set((state) => {
          const updatedConfigs = state.configs.map(config => {
            if (config.id === configInput.id) {
              // If setting this as default, remove default from others
              if (configInput.isDefault) {
                return {
                  ...config,
                  ...configInput,
                  updatedAt: Date.now(),
                  isDefault: true
                }
              }
              // If this was default and we're unsetting it, don't allow if it's the only config
              if (config.isDefault && configInput.isDefault === false && state.configs.length === 1) {
                return {
                  ...config,
                  ...configInput,
                  updatedAt: Date.now(),
                  isDefault: true // Keep it as default
                }
              }
              return {
                ...config,
                ...configInput,
                updatedAt: Date.now()
              }
            }
            // If setting a new default, remove default from others
            if (configInput.isDefault) {
              return { ...config, isDefault: false }
            }
            return config
          })

          return { configs: updatedConfigs }
        })
      },

      removeConfig: (id) => {
        set((state) => {
          // Get the config to remove
          const configToRemove = state.configs.find(c => c.id === id)
          const remainingConfigs = state.configs.filter(c => c.id !== id)

          // If removing the default config and there are others, make the first one default
          if (configToRemove?.isDefault && remainingConfigs.length > 0) {
            remainingConfigs[0].isDefault = true
          }

          return { configs: remainingConfigs }
        })
      },

      getDefaultConfig: () => {
        return get().configs.find(c => c.isDefault)
      },

      setDefaultConfig: (id) => {
        set((state) => ({
          configs: state.configs.map(config => ({
            ...config,
            isDefault: config.id === id
          }))
        }))
      }
    }),
    {
      name: 'api-configs'
    }
  )
)