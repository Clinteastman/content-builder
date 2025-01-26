import { useState } from 'react'
import { Plus, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { Switch } from './ui/switch'
import { Card, CardContent } from './ui/card'
import { ApiConfig, ApiHeaderConfig, CreateApiConfigInput, UpdateApiConfigInput } from '../types/api-config'

interface ApiConfigFormProps {
  config?: ApiConfig
  onSubmit: (config: CreateApiConfigInput | UpdateApiConfigInput) => void
  onCancel: () => void
}

export function ApiConfigForm({ config, onSubmit, onCancel }: ApiConfigFormProps) {
  const [name, setName] = useState(config?.name || '')
  const [url, setUrl] = useState(config?.url || '')
  const [authType, setAuthType] = useState<ApiConfig['authType']>(config?.authType || 'none')
  const [authKey, setAuthKey] = useState(config?.authKey || '')
  const [authValue, setAuthValue] = useState(config?.authValue || '')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      name,
      url,
      authType,
      authKey,
      authValue,
      headers: headers.filter(h => h.key && h.value),
      isDefault
    }

    if (config?.id) {
      onSubmit({ id: config.id, ...formData })
    } else {
      onSubmit(formData)
    }
  }

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
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://api.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authType">Authentication Type</Label>
          <Select
            value={authType} 
            onValueChange={(value: string) => setAuthType(value as ApiConfig['authType'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select auth type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="bearer">Bearer Token</SelectItem>
              <SelectItem value="basic">Basic Auth</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {authType !== 'none' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authKey">
                {authType === 'bearer' ? 'Token' :
                 authType === 'basic' ? 'Username' :
                 'Key'}
              </Label>
              <Input
                id="authKey"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                type={authType === 'basic' ? 'text' : 'password'}
                required={authType === 'bearer' || authType === 'basic' || authType === 'custom'}
              />
            </div>
            {(authType === 'basic' || authType === 'custom') && (
              <div className="space-y-2">
                <Label htmlFor="authValue">
                  {authType === 'basic' ? 'Password' : 'Value'}
                </Label>
                <Input
                  id="authValue"
                  type="password"
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  required={authType === 'basic' || authType === 'custom'}
                />
              </div>
            )}
          </div>
        )}

        <Card className="dark:bg-gray-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Headers</Label>
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