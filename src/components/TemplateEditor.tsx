import { useCallback, useMemo, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import useTemplateStore from '../store/templateStore'
import { useTheme } from './ui/theme-provider'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

const createHighlightStyle = (isDark: boolean) => HighlightStyle.define([{
    tag: [t.special(t.name)],
    color: isDark ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
  }])

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'rgb(17 24 39)', // gray-900
    color: 'rgb(243 244 246)' // gray-100
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'rgb(243 244 246)' // gray-100
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(75, 85, 99, 0.5)' // gray-600 with opacity
  },
  '.cm-scroller': {
    backgroundColor: 'rgb(17 24 39)' // gray-900
  },
  '.cm-content': {
    caretColor: 'rgb(243 244 246)', // gray-100
    backgroundColor: 'rgb(17 24 39)', // gray-900
    height: '400px'
  },
  '.cm-gutters': {
    backgroundColor: 'rgb(31 41 55)', // gray-800
    color: 'rgb(156 163 175)', // gray-400
    borderRight: '1px solid rgb(55 65 81)' // gray-700
  }
}, { dark: true })

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'rgb(255 255 255)', // white
    color: 'rgb(17 24 39)' // gray-900
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'rgb(17 24 39)' // gray-900
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(209 213 219, 0.5)' // gray-300 with opacity
  },
  '.cm-scroller': {
    backgroundColor: 'rgb(255 255 255)' // white
  },
  '.cm-content': {
    caretColor: 'rgb(17 24 39)', // gray-900
    backgroundColor: 'rgb(255 255 255)', // white
    height: '400px'
  },
  '.cm-gutters': {
    backgroundColor: 'rgb(249 250 251)', // gray-50
    color: 'rgb(107 114 128)', // gray-500
    borderRight: '1px solid rgb(229 231 235)' // gray-200
  }
}, { dark: false })

const placeholderExtension = EditorView.updateListener.of((update) => {
  const doc = update.state.doc.toString()
  const pattern = /\{([^{}]+)\}/g
  let match
  const decorations = []
  while ((match = pattern.exec(doc)) !== null) {
    const from = match.index
    const to = from + match[0].length
    decorations.push({
      from,
      to,
      class: 'cm-special'
    })
  }
  return decorations
})

export const TemplateEditor: React.FC = () => {
  const { activeTemplate, updateTemplate } = useTemplateStore()
  const { theme } = useTheme()

  const handleChange = useCallback((value: string) => {
    if (activeTemplate) {
      updateTemplate(activeTemplate.id, { content: value })
    }
  }, [activeTemplate, updateTemplate])

  // When theme is "system", check the system preference
  const isDark = theme === 'dark' || (
    theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // Force a re-render when system theme changes
    const handler = () => {
      // Find the editor instance and update its theme
      const editorElement = document.querySelector('.cm-editor')
      if (editorElement) {
        editorElement.classList.toggle('dark', mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])


  const extensions = useMemo(() => [
    syntaxHighlighting(createHighlightStyle(isDark)),
    placeholderExtension,
    isDark ? darkTheme : lightTheme,
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        height: '400px',
        overflow: 'hidden'
      },
      '& .cm-special': {
        color: isDark ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
        backgroundColor: isDark ? 'rgb(15 23 42)' : 'rgb(239 246 255)', // slate-900 : blue-50
        padding: '0 2px',
        borderRadius: '2px'
      }
    })
  ], [isDark])

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
          <CodeMirror
            value={activeTemplate.content}
            onChange={handleChange}
            extensions={extensions}
            placeholder="Enter your template content here. Use {placeholders} for dynamic content."
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              bracketMatching: true,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}