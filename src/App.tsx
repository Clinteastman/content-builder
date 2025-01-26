import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Toaster } from './components/ui/toaster'
import { FormItem, FormLabel, FormControl } from './components/ui/form'
import { Card, CardContent } from './components/ui/card'
import { TemplateEditor } from './components/TemplateEditor'
import { InputFieldBuilder } from './components/InputFieldBuilder'
import { PreviewPane } from './components/PreviewPane'
import { ImportExportControls } from './components/ImportExportControls'
import { useTemplateInputs } from './hooks/useTemplateInputs'
import { ThemeToggle } from './components/ui/theme-toggle'
import useTemplateStore from './store/templateStore'

export default function App() {
  const { templates, activeTemplate, addTemplate, setActiveTemplate } = useTemplateStore()
  const [isNewTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const { fields, inputs, updateInput, output, isValid } = useTemplateInputs(
    activeTemplate?.content || ''
  )

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return

    addTemplate({
      name: newTemplateName,
      content: '',
      inputs: []
    })

    setNewTemplateName('')
    setNewTemplateDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center justify-between flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Prompt Builder</h2>
            <div className="flex items-center gap-4">
              <ImportExportControls />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 min-h-[calc(100vh-4rem)] p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start mb-4"
            onClick={() => setNewTemplateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
          <div className="space-y-1">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={template.id === activeTemplate?.id ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveTemplate(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {activeTemplate ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <TemplateEditor />
                <InputFieldBuilder
                  fields={fields}
                  onFieldsChange={(updatedFields) => {
                    if (activeTemplate) {
                      useTemplateStore.getState().updateTemplate(
                        activeTemplate.id,
                        { inputs: updatedFields }
                      )
                    }
                  }}
                />
              </div>
              <div className="space-y-6">
                {fields.length > 0 ? (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {fields.map((field) => (
                        <FormItem key={field.key}>
                          <FormLabel>
                            {field.label}
                            {field.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            {field.type === 'select' ? (
                              <select
                                value={inputs[field.key] || ''}
                                onChange={(e) => updateInput(field.key, e.target.value)}
                                className="flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600"
                              >
                                <option value="">Select an option</option>
                                {field.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                type={field.type}
                                value={inputs[field.key] || ''}
                                onChange={(e) => updateInput(field.key, e.target.value)}
                                required={field.required}
                              />
                            )}
                          </FormControl>
                        </FormItem>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
                      Add {'{placeholders}'} in your template to create input fields
                    </CardContent>
                  </Card>
                )}
                <PreviewPane content={output} isValid={isValid} />
              </div>
            </div>
          ) : (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">No template selected</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select a template or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isNewTemplateDialogOpen} onOpenChange={setNewTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </FormControl>
            </FormItem>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}
