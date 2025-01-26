import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { Copy, Send } from 'lucide-react'
import useTemplateStore from '../store/templateStore'
import { useTemplateInputs } from '../hooks/useTemplateInputs'

export default function UsePromptsPage() {
  const { templates, activeTemplate, setActiveTemplate } = useTemplateStore()
  const { fields, inputs, updateInput, output, isValid } = useTemplateInputs(
    activeTemplate?.content || ''
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle>Template Selection</CardTitle>
          <CardDescription>Choose a template to start customizing your prompt</CardDescription>
          <div className="pt-2">
            <Select
              defaultValue={activeTemplate?.id}
              value={activeTemplate?.id || ''}
              onValueChange={(value) => {
                const template = templates.find(t => t.id === value)
                if (template) setActiveTemplate(template)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {activeTemplate && (
          <CardContent className="pt-6 space-y-6">
            <Card className="dark:bg-gray-800/50">
              <CardHeader className="pb-2">
                <CardTitle>Template Fields</CardTitle>
                <CardDescription>Fill in the required information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {field.type === 'select' ? (
                      <Select
                        value={inputs[field.key] || ''}
                        onValueChange={(value) => updateInput(field.key, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <input
                        type={field.type}
                        value={inputs[field.key] || ''}
                        onChange={(e) => updateInput(field.key, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-gray-900 dark:text-gray-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Generated Prompt</CardTitle>
                <CardDescription>Preview of your customized prompt</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 p-4 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  {output}
                </pre>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />Copy
              </Button>
              <Button disabled={!isValid} className="gap-2">
                <Send className="h-4 w-4" />Send to Model
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}