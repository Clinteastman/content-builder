import { useRef, useState } from 'react'
import { Button, Stack, Snackbar, Alert } from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import DownloadIcon from '@mui/icons-material/Download'
import { z } from 'zod'
import useTemplateStore from '../store/templateStore'

// Zod schema for template validation
const inputFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'select']),
  options: z.array(z.string()).optional(),
  required: z.boolean()
})

const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  inputs: z.array(inputFieldSchema),
  createdAt: z.string().transform(str => new Date(str)),
  updatedAt: z.string().transform(str => new Date(str))
})

const templatesSchema = z.array(templateSchema)

export const ImportExportControls: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { templates, importTemplates } = useTemplateStore()
  const [error, setError] = useState<string | null>(null)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const json = JSON.parse(content)
      const validated = templatesSchema.parse(json)
      importTemplates(validated)
      event.target.value = '' // Reset file input
    } catch (err) {
      console.error('Import error:', err)
      setError('Invalid template file format')
    }
  }

  const handleExport = () => {
    try {
      const data = templates.map(template => ({
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
      }))
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'prompt-templates.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export templates')
    }
  }

  return (
    <>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept="application/json"
          style={{ display: 'none' }}
        />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={templates.length === 0}
        >
          Export
        </Button>
      </Stack>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}