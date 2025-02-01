import { useCallback, useEffect } from 'react'
import CodeEditor from './CodeEditor'
import useTemplateStore from '../store/templateStore'
import { useTheme } from './ui/theme-provider'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

export const TemplateEditor: React.FC = () => {
  const { activeTemplate, updateTemplate } = useTemplateStore()
  const { theme } = useTheme()

  const handleChange = useCallback((value: string) => {
    if (activeTemplate) {
      updateTemplate(activeTemplate.id, { content: value })
    }
  }, [activeTemplate, updateTemplate])

  // Determine if dark mode is active
  const isDark = theme === 'dark' || (
    theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const editorElement = document.querySelector('.cm-editor')
      if (editorElement) {
        editorElement.classList.toggle('dark', mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  if (!activeTemplate) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">
            Select a template to edit
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Template Editor</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          <CodeEditor
            value={activeTemplate.content}
            onChange={handleChange}
            placeholder="Enter your template content here. Use {placeholders} for dynamic content."
            isDark={isDark}
          />
        </div>
      </CardContent>
    </Card>
  )
}
