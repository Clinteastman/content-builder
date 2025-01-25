import { useRef } from 'react'
import { Upload, Download } from 'lucide-react'
import { z } from 'zod'
import useTemplateStore from '../store/templateStore'
import { Button } from './ui/button'
import { useToast } from '../hooks/useToast'

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

export const ImportExportControls = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { templates, importTemplates } = useTemplateStore()
  const { toast } = useToast()

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const json = JSON.parse(content)
      const validated = templatesSchema.parse(json)
      importTemplates(validated)
      event.target.value = '' // Reset file input
      toast({
        title: "Import successful",
        description: `Imported ${validated.length} templates`,
      })
    } catch (err) {
      console.error('Import error:', err)
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Invalid template file format",
      })
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
      
      toast({
        title: "Export successful",
        description: `Exported ${templates.length} templates`,
      })
    } catch (err) {
      console.error('Export error:', err)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export templates",
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept="application/json"
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={templates.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  )
}