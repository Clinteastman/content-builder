import { ApiConfig, ApiProvider, DEFAULT_PROVIDER_MODELS, ModelConfig } from '../types/api-config'

interface OpenAIModelsResponse {
  data: Array<{ id: string; name?: string }>
}

interface AnthropicModelsResponse {
  models: Array<{ name: string; max_tokens?: number }>
}

const removeTrailingSlash = (url: string) => url.replace(/\/$/, '')

export async function fetchAvailableModels(config: ApiConfig): Promise<ModelConfig[]> {
  if (config.provider === 'custom') {
    return config.customModels?.map(model => ({
      ...model,
      provider: 'custom'
    })) || []
  }

  // Return default models if no auth is configured
  if (!config.authValue) {
    return DEFAULT_PROVIDER_MODELS[config.provider as Exclude<ApiProvider, 'custom'>] || []
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (config.authType === 'bearer' && config.authValue) {
    headers['Authorization'] = `Bearer ${config.authValue}`
  }

  // Add custom headers
  config.headers.forEach(header => {
    if (header.enabled) {
      headers[header.key] = header.value
    }
  })

  try {
    switch (config.provider) {
      case 'openai': {
        // Clean URLs to prevent double slashes
        const baseUrl = removeTrailingSlash(config.url)
        const modelsUrl = `${baseUrl}/models`
        const response = await fetch(modelsUrl, { headers })
        if (!response.ok) throw new Error('Failed to fetch models')
        const data: OpenAIModelsResponse = await response.json()
        return data.data.map(model => ({
          id: model.id,
          name: model.name || model.id,
          provider: 'openai',
          contextWindow: model.id.includes('gpt-4') ? 8192 : 4096
        }))
      }

      case 'anthropic': {
        const baseUrl = removeTrailingSlash(config.url)
        const modelsUrl = `${baseUrl}/models`
        const response = await fetch(modelsUrl, { headers })
        if (!response.ok) throw new Error('Failed to fetch models')
        const data: AnthropicModelsResponse = await response.json()
        return data.models.map(model => ({
          id: model.name,
          name: model.name,
          provider: 'anthropic',
          contextWindow: model.max_tokens || 200000
        }))
      }

      // For providers without model list endpoints, return default models
      case 'deepseek':
      case 'gemini':
        return DEFAULT_PROVIDER_MODELS[config.provider]

      default:
        return []
    }
  } catch (error) {
    console.error('Error fetching models:', error)
    // Fallback to default models if API call fails
    return DEFAULT_PROVIDER_MODELS[config.provider as Exclude<ApiProvider, 'custom'>] || []
  }
}