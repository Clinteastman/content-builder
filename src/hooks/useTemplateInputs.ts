import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import type { InputField } from '../types'

export const useTemplateInputs = (content: string) => {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [debouncedInputs] = useDebounce(inputs, 300)

  // Parse placeholders from template content using regex
  const placeholders = useMemo(() => {
    const pattern = /\{([^{}]+)\}/g
    const matches = [...content.matchAll(pattern)]
    return [...new Set(matches.map(match => match[1]))]
  }, [content])

  // Generate input fields based on placeholders
  const fields = useMemo<InputField[]>(() => 
    placeholders.map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: 'text',
      required: true,
      value: inputs[key] || ''
    }))
  , [placeholders, inputs])

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