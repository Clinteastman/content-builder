import React, { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isDark?: boolean
}

const createHighlightStyle = (isDark: boolean) => HighlightStyle.define([
  {
    tag: [t.special(t.name)],
    color: isDark ? '#60a5fa' : '#2563eb' // blue-400 : blue-600
  }
])

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
    backgroundColor: 'rgb(17 24 39)' // gray-900
    // removed fixed height
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
    backgroundColor: 'rgba(209, 213, 219, 0.5)' // gray-300 with opacity
  },
  '.cm-scroller': {
    backgroundColor: 'rgb(255 255 255)' // white
  },
  '.cm-content': {
    caretColor: 'rgb(17 24 39)', // gray-900
    backgroundColor: 'rgb(255 255 255)' // white
    // removed fixed height
  },
  '.cm-gutters': {
    backgroundColor: 'rgb(249 250 251)', // gray-50
    color: 'rgb(107 114 128)', // gray-500
    borderRight: '1px solid rgb(229 231 235)' // gray-200
  }
}, { dark: false })

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  isDark = false
}) => {
  const extensions = useMemo(() => [
    syntaxHighlighting(createHighlightStyle(isDark)),
    isDark ? darkTheme : lightTheme,
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        // removed fixed height and overflow styles to allow dynamic height
        // height: '400px',
        // overflow: 'hidden'
      },
      '& .cm-special': {
        color: isDark ? '#60a5fa' : '#2563eb',
        backgroundColor: isDark ? 'rgb(15 23 42)' : 'rgb(239 246 255)',
        padding: '0 2px',
        borderRadius: '2px'
      }
    })
  ], [isDark])

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightActiveLine: true,
        bracketMatching: true
      }}
    />
  )
}

export default CodeEditor