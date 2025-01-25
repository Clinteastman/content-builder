import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { TemplateStore } from '../types'

const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      activeTemplate: null,
      setActiveTemplate: (template) => set({ activeTemplate: template }),
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
      name: 'template-storage',
      skipHydration: true, // Prevents hydration mismatch with Date objects
    }
  )
)

export default useTemplateStore