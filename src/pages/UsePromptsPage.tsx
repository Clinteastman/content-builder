import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { Copy, Loader2, Send } from 'lucide-react'
import useTemplateStore from '../store/templateStore'
import { useApiConfigStore } from '../store/apiConfigStore'
import { Textarea } from '../components/ui/textarea'
import { useTemplateInputs } from '../hooks/useTemplateInputs'
import { useToast } from '../hooks/useToast'
import { useState, useEffect } from 'react'
import { sendPrompt } from '../lib/api-service'
import { 
  ApiConfig, 
  ModelConfig,
  LLMResponse,
  isOpenAIResponse,
  isAnthropicResponse, 
  isGeminiResponse, 
  isDeepseekResponse 
} from '../types/api-config'
import { fetchAvailableModels } from '../lib/models-service'

interface Template {
  id: string
  name: string
}

function extractResponseText(data: LLMResponse, provider: ApiConfig['provider']): string {
  try {
    switch (provider) {
      case 'openai':
        if (isOpenAIResponse(data)) return data.choices[0].message.content
        break
      case 'anthropic':
        if (isAnthropicResponse(data)) return data.content[0].text
        break
      case 'gemini':
        if (isGeminiResponse(data)) return data.candidates[0].content.parts[0].text
        break
      case 'deepseek':
        if (isDeepseekResponse(data)) return data.choices[0].message.content
        break
      case 'custom':
        if (isOpenAIResponse(data)) return data.choices[0].message.content
        if (isAnthropicResponse(data)) return data.content[0].text
        if (isGeminiResponse(data)) return data.candidates[0].content.parts[0].text
    }
    return JSON.stringify(data, null, 2)
  } catch {
    return `Error parsing ${provider} response: ${JSON.stringify(data, null, 2)}`
  }
}

export default function UsePromptsPage() {
  const { templates, activeTemplate, setActiveTemplate } = useTemplateStore()
  const { fields, inputs, updateInput, output, isValid } = useTemplateInputs(
    activeTemplate?.content || ''
  )
  const { configs, getDefaultConfig } = useApiConfigStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConfigId, setSelectedConfigId] = useState<string>(getDefaultConfig()?.id || '')
  const [response, setResponse] = useState<string | null>(null)
  const [streamedResponse, setStreamedResponse] = useState<string>('')
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([])
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined)

  const selectedConfig = configs.find((config: ApiConfig) => config.id === selectedConfigId)

  useEffect(() => {
    if (!selectedConfig) return

    setIsLoading(true)
    fetchAvailableModels(selectedConfig)
      .then(models => {
        let filteredModels = models;
        if (selectedConfig.provider === 'openai') {
          // Filter out models that contain keywords "vision", "audio", or "whisper" (case-insensitive)
          filteredModels = models.filter(model => 
            !/(vision|audio|whisper|dall|tts|text|omni|babbage|realtime|davinci)/i.test(model.id)
          )
        }
        setAvailableModels(filteredModels)
        setSelectedModel(filteredModels[0]?.id || selectedConfig.selectedModel)
      })
      .catch(error => {
        toast({ title: "Failed to fetch models", description: error.message, variant: "destructive" })
      })
      .finally(() => setIsLoading(false))
  }, [selectedConfigId, selectedConfig, toast])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast({
        title: "Copied",
        description: "The prompt has been copied to your clipboard",
        variant: "success"
      })
    } catch (err: unknown) {
      console.error('Failed to copy text: ', err)
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleSend = async (): Promise<void> => {
    if (!selectedConfig) {
      toast({
        title: "No API configuration selected",
        description: "Please select an API configuration before sending",
        variant: "destructive"
      })
      return
    }

    if (!selectedConfig.authValue) {
      toast({
        title: "No API configuration selected",
        description: "Please select an API configuration before sending",
        variant: "destructive"
      })
      return
    }

    if (!selectedModel) {
      toast({
        title: "No model selected",
        description: "Please select a model before sending",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('Using API config:', {
        name: selectedConfig.name,
        provider: selectedConfig.provider,
        authType: selectedConfig.authType,
        hasAuth: Boolean(selectedConfig.authValue)
      })

      // Reset streamed response at the start
      setStreamedResponse('')
      
      const result = await sendPrompt(
        selectedConfig, 
        { prompt: output, model: selectedModel },
        (chunk: string) => {
          setStreamedResponse(prev => prev + chunk)
        }
      )
      
      // For non-streaming responses, use the full response
      if (Object.keys(result).length > 0) setResponse(extractResponseText(result, selectedConfig.provider))
      toast({
        title: "Success",
        description: "Response received from model",
        variant: "success"
      })
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
          .replace(/^\[.*\]\s*/, '')
          .split('\n')[0]
          .replace(/^Error:\s*/, '')
          .trim()
          .replace(/^Error:\s*/, '')
          .replace(/\.$/, '')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/^[a-z]/, c => c.toUpperCase())
        : 'An unknown error occurred'
        
      const errorMessage = message.includes('API key') 
        ? `Invalid or missing API key for ${selectedConfig.provider}. Please check your API configuration in Settings.`
        : message

      if (message.includes('authentication')) {
        console.error('Auth error details:', selectedConfig)
      }

      toast({ title: "API Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
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
              value={activeTemplate?.id || ''}
              onValueChange={(value: string) => {
                const template = templates.find((t: Template) => t.id === value)
                if (template) setActiveTemplate(template)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {templates
                    .filter((template: Template) => template.id)
                    .map((template: Template) => (
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
                          <SelectValue placeholder={field.placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {field.options
                              ?.filter(option => option && option.trim() !== '')
                              .map((option) => (
                              <SelectItem key={option} value={option || 'default'}>
                                {option || 'Default'}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        value={inputs[field.key] || ''}
                        onChange={(e) => updateInput(field.key, e.target.value)}
                        placeholder={field.placeholder || "Enter text..."}
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={inputs[field.key] || ''}
                        onChange={(e) => updateInput(field.key, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-gray-900 dark:text-gray-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600"
                        placeholder={field.placeholder || (field.type === 'number' ? 'Enter a number...' : 'Enter text...')}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <CardTitle>Generated Prompt</CardTitle>
                <CardDescription>Preview of your customized prompt</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <pre 
                  className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 p-4 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                  style={{ minHeight: '100px' }}
                >
                  {output}
                </pre>
              </CardContent>
            </Card>

            <div className="flex justify-end items-center space-x-2">
              {configs.length > 0 && (
                <Select
                  value={selectedConfigId || ''}
                  onValueChange={setSelectedConfigId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select API config" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {configs
                        .filter(config => config.id)
                        .map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            {config.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {availableModels.length > 0 && (
                <Select
                  value={selectedModel || ''}
                  onValueChange={setSelectedModel}
                  disabled={!selectedConfig || availableModels.length === 0}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableModels
                        .filter(model => model.id)
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />Copy
              </Button>

              <Button
                onClick={handleSend}
                disabled={!isValid || !selectedConfig || !selectedModel || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send to Model
              </Button>
            </div>

            {(response || streamedResponse) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Model Response</CardTitle>
                  <CardDescription>
                    Response from {selectedConfig?.name} ({availableModels.find(m => m.id === selectedModel)?.name})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-800">
                    {streamedResponse || response}
                  </pre>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await navigator.clipboard.writeText(streamedResponse || response || '')
                      toast({
                        title: "Copied",
                        description: "Response has been copied to your clipboard",
                        variant: "success"
                      })
                    }}>
                    <Copy className="h-4 w-4 mr-2" />Copy Response
                  </Button>
                </CardFooter>
              </Card>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}