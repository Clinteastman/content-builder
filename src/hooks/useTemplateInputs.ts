import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import type { InputField } from '../types'
import useTemplateStore from '../store/templateStore'

export const useTemplateInputs = (content: string, templateId?: string) => {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [debouncedInputs] = useDebounce(inputs, 300)

  const existingTemplate = useTemplateStore(state => 
    templateId ? state.templates.find(t => t.id === templateId) : state.activeTemplate
  )

  // Parse placeholders from template content using regex
  const placeholders = useMemo(() => {
    const pattern = /\{([^{}]+)\}/g
    const matches = [...content.matchAll(pattern)]
    return [...new Set(matches.map(match => match[1]))]
  }, [content])

  // Generate input fields based on placeholders
  const fields = useMemo<InputField[]>(() => {
    return placeholders.map(key => {
      // Try to find existing field to preserve type
      const existingField = existingTemplate?.inputs?.find(f => f.key === key)
      
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: existingField?.type || 'text',
        required: existingField?.required ?? true,
        options: existingField?.options,
        value: inputs[key] || ''
      }
    })
  }, [placeholders, inputs, existingTemplate])

  // Update input values
  const updateInput = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  // Generate final output by replacing placeholders with values
  const output = useMemo(() => {
    let result = content
    Object.entries(debouncedInputs).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`)
    })
    return result
  }, [content, debouncedInputs])

  // Validate if all required fields are filled
  const isValid = useMemo(() => 
    fields.every(field => !field.required || (inputs[field.key]?.trim() || '').length > 0)
  , [fields, inputs])

  return {
    fields,
    inputs,
    updateInput,
    output,
    isValid
  }
}