import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import useTemplateStore from '../store/templateStore'
import { useTemplateInputs } from '../hooks/useTemplateInputs'

export default function UsePromptsPage() {
  const { templates, activeTemplate, setActiveTemplate } = useTemplateStore()
  const { fields, inputs, updateInput, output, isValid } = useTemplateInputs(
    activeTemplate?.content || ''
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Use Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Select Template
            </label>
            <Select
              value={activeTemplate?.id || ''}
              onValueChange={(value) => {
                const template = templates.find(t => t.id === value)
                if (template) setActiveTemplate(template)
              }}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </Select>
          </div>

          {activeTemplate && (
            <>
              {/* Input Fields */}
              <div className="space-y-4">
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
                        <option value="">Select an option</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
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
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Generated Prompt
                </label>
                <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                    {output}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Copy</Button>
                <Button disabled={!isValid}>
                  Send to Model
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}