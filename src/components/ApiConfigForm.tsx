import { useState } from 'react'
import { Plus, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { Switch } from './ui/switch'
import { Card, CardContent, CardDescription } from './ui/card'
import {
  ApiConfig,
  ApiHeaderConfig,
  CreateApiConfigInput,
  UpdateApiConfigInput,
  DEFAULT_PROVIDER_URLS
} from '../types/api-config'

interface ApiConfigFormProps {
  config?: ApiConfig
  onSubmit: (config: CreateApiConfigInput | UpdateApiConfigInput) => void
  onCancel: () => void
}

export function ApiConfigForm({ config, onSubmit, onCancel }: ApiConfigFormProps) {
  const [name, setName] = useState(config?.name || '')
  const [provider, setProvider] = useState<ApiConfig['provider']>(config?.provider || 'custom')
  const [url, setUrl] = useState(config?.url || (provider !== 'custom' ? DEFAULT_PROVIDER_URLS[provider] : ''))
  const [apiKey, setApiKey] = useState(config?.authValue || '')
  const [authType] = useState<ApiConfig['authType']>('bearer') // Always use bearer auth
  const [headers, setHeaders] = useState<ApiHeaderConfig[]>(config?.headers || [])
  const [isDefault, setIsDefault] = useState(config?.isDefault || false)

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const updateHeader = (index: number, updates: Partial<ApiHeaderConfig>) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], ...updates }
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const handleProviderChange = (newProvider: ApiConfig['provider']) => {
    setProvider(newProvider)
    if (newProvider !== 'custom') {
      setUrl(DEFAULT_PROVIDER_URLS[newProvider])
    } else {
      setUrl('')
      setApiKey('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      name,
      provider,
      url,
      authType,
      authValue: apiKey,
      headers: headers.filter(h => h.key && h.value),
      isDefault
    }

    if (config?.id) {
      onSubmit({ id: config.id, ...formData })
    } else {
      onSubmit(formData)
    }
  }

  // Debug log
  console.log('Form state:', {
    provider,
    url,
    authType,
    apiKeyPresent: Boolean(apiKey)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-gray-50">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My API Configuration"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {provider === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="url">API URL</Label>
            <Input
              id="url"
              placeholder="https://api.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              readOnly={provider !== 'custom'}
            />
            <CardDescription className="text-sm">
              Enter the base URL for your API endpoint
            </CardDescription>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              provider === 'openai' ? 'sk-...' :
              provider === 'anthropic' ? 'Your Anthropic API key' :
              provider === 'deepseek' ? 'Your DeepSeek API key' :
              provider === 'gemini' ? 'Your Google API key' :
              'Enter API key'
            }
            required
          />
          <CardDescription className="text-sm">
            {provider === 'openai' && 'OpenAI API key starts with "sk-"'}
            {provider === 'anthropic' && 'Anthropic API key starts with "sk-ant-"'}
            {provider === 'deepseek' && 'DeepSeek API key format'}
            {provider === 'gemini' && 'Google API key format'}
          </CardDescription>
        </div>

        <Card className="dark:bg-gray-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Additional Headers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </div>
            
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => updateHeader(index, { key: e.target.value })}
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, { value: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={header.enabled}
                      onCheckedChange={(checked) => updateHeader(index, { enabled: checked })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2">
          <Switch
            id="isDefault"
            checked={isDefault}
            onCheckedChange={setIsDefault}
          />
          <Label htmlFor="isDefault">Set as default configuration</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {config ? 'Update' : 'Create'} Configuration
        </Button>
      </div>
    </form>
  )
}