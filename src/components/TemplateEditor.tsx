import { useCallback, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import useTemplateStore from '../store/templateStore'

const placeholderHighlight = HighlightStyle.define([{
  tag: [t.special(t.name)],
  color: '#2563eb'
}])

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

  const handleChange = useCallback((value: string) => {
    if (activeTemplate) {
      updateTemplate(activeTemplate.id, { content: value })
    }
  }, [activeTemplate, updateTemplate])

  const extensions = useMemo(() => [
    syntaxHighlighting(placeholderHighlight),
    placeholderExtension,
    EditorView.theme({
      '&': {
        height: '400px'
      },
      '.cm-special': {
        color: '#2563eb',
        backgroundColor: '#dbeafe',
        padding: '0 2px',
        borderRadius: '2px'
      }
    })
  ], [])

  if (!activeTemplate) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500">Select a template to edit</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
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
  )
}