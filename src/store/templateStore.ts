import { create } from 'zustand'
import { type PersistStorage, persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { TemplateStore, PromptTemplate } from '../types'

// Type for persisted state subset
type PersistedState = {
  templates: TemplateStore['templates']
}

// Helper function to update both active template and templates array
const updateTemplateState = (state: TemplateStore, updatedTemplate: PromptTemplate): Partial<TemplateStore> => ({
  templates: state.templates.map(template => template.id === updatedTemplate.id ? updatedTemplate : template),
  activeTemplate: state.activeTemplate?.id === updatedTemplate.id ? updatedTemplate : state.activeTemplate
})

const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      activeTemplate: null,
      setActiveTemplate: (template) => set({ activeTemplate: template }),
      setFieldType: (key: string, type: 'text' | 'number' | 'select' | 'textarea') => set((state) => {
        if (!state.activeTemplate) return state
        
        const updatedTemplate = {
          ...state.activeTemplate,
          inputs: state.activeTemplate.inputs.map(field =>
            field.key === key ? { ...field, type } : field
          )
        }
        
        if (!state.activeTemplate?.id) return state
        updatedTemplate.updatedAt = new Date()

        // Update both active template and templates array
        return updateTemplateState(state, updatedTemplate)
      }),
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, {
          ...template,
          id: nanoid(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      })),
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((template) => 
          template.id === id
            ? { ...template, ...updates, updatedAt: new Date() }
            : template
        ),
        activeTemplate: state.activeTemplate?.id === id
          ? { ...state.activeTemplate, ...updates, updatedAt: new Date() }
          : state.activeTemplate
      })),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
        activeTemplate: state.activeTemplate?.id === id ? null : state.activeTemplate
      })),
      importTemplates: (templates) => set((state) => ({
        templates: [
          ...state.templates,
          ...templates.map((template) => ({
            ...template,
            id: nanoid(),
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        ]
      }))
    }),
    {
      name: 'template-storage-v2',
      storage: createJSONStorage(),
      partialize: (state) => ({
        templates: state.templates
      })
    }
  )
)

// Helper to create storage with proper Date handling
function createJSONStorage(): PersistStorage<PersistedState> {
  return {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name)
            return str ? JSON.parse(str, (_key, value) => 
              _key.endsWith('At') ? new Date(value) : value
            ) : null
          } catch (error) {
            console.error('Failed to parse persisted state:', error)
            return null
          }
        },
        setItem: (name, value) => 
          localStorage.setItem(name, JSON.stringify(value, (_key, value) =>
            value instanceof Date ? value.toISOString() : value
          )),
        removeItem: (name) => localStorage.removeItem(name)
  }
}


export default useTemplateStore
