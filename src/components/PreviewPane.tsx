import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface PreviewPaneProps {
  content: string
  isValid: boolean
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ content, isValid }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Preview</CardTitle>
        <Button
          onClick={handleCopy}
          disabled={!isValid}
          variant="ghost"
          size="icon"
          className={copied ? 'text-green-500' : ''}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy to clipboard</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isValid ? (
          <pre className="font-mono text-sm whitespace-pre-wrap">
            {content}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Please fill in all required fields to preview the template
          </p>
        )}
      </CardContent>
    </Card>
  )
}