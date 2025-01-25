import { useState } from 'react'
import { Paper, IconButton, Snackbar, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h6" component="h2">
          Preview
        </Typography>
        <IconButton
          onClick={handleCopy}
          disabled={!isValid}
          color={copied ? 'success' : 'default'}
          aria-label="Copy to clipboard"
        >
          {copied ? <CheckIcon /> : <ContentCopyIcon />}
        </IconButton>
      </div>

      <Paper
        elevation={0}
        variant="outlined"
        className={`p-4 ${!isValid ? 'bg-gray-50' : 'bg-white'}`}
      >
        {isValid ? (
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {content}
          </pre>
        ) : (
          <Typography color="text.secondary" className="italic">
            Please fill in all required fields to preview the template
          </Typography>
        )}
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  )
}