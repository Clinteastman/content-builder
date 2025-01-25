import { useCallback, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import useTemplateStore from '../store/templateStore'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

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
        backgroundColor: 'rgb(239 246 255)',
        padding: '0 2px',
        borderRadius: '2px'
      }
    })
  ], [])

  if (!activeTemplate) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">
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
        <div className="border rounded-md overflow-hidden">
          <CodeMirror
            value={activeTemplate.content}
            onChange={handleChange}
            extensions={extensions}
            placeholder="Enter your template content here. Use {placeholders} for dynamic content."
            className="min-h-[400px]"
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