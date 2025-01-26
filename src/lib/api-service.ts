import { ApiConfig, ApiProvider, LLMResponse } from '../types/api-config'

interface ApiRequestOptions {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
}

interface ProviderEndpoint {
  path: string
  prepareBody: (options: ApiRequestOptions) => Record<string, unknown>
}

const PROVIDER_ENDPOINTS: Record<Exclude<ApiProvider, 'custom'>, ProviderEndpoint> = {
  openai: {
    path: '/chat/completions',
    prepareBody: (options) => ({
      model: options.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000
    })
  },
  anthropic: {
    path: '/messages',
    prepareBody: (options) => ({
      model: options.model || 'claude-3-opus-20240229',
      max_tokens: options.maxTokens,
      messages: [{ role: 'user', content: options.prompt }]
    })
  },
  deepseek: {
    path: '/chat/completions',
    prepareBody: (options) => ({
      model: options.model || 'deepseek-chat',
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens
    })
  },
  gemini: {
    path: '/generateContent',
    prepareBody: (options) => ({
      contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      }
    })
  }
}

const removeTrailingSlash = (url: string) => url.replace(/\/$/, '')

function prepareAuthHeaders(config: ApiConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Log auth configuration
  console.log('Auth config:', {
    type: config.authType,
    hasValue: Boolean(config.authValue),
    hasKey: Boolean(config.authKey)
  })

  // Validate auth configuration
  if (!config.authType || !config.authValue) {
    throw new Error('Missing authentication configuration')
  }

  // Set auth header based on type
  switch (config.authType) {
    case 'bearer':
      headers['Authorization'] = `Bearer ${config.authValue}`
      break
    case 'basic':
      if (!config.authKey) throw new Error('Missing username for basic auth')
      headers['Authorization'] = `Basic ${btoa(`${config.authKey}:${config.authValue}`)}`
      break
    case 'custom':
      if (!config.authKey) throw new Error('Missing header name for custom auth')
      headers[config.authKey] = config.authValue
      break
    default:
      throw new Error(`Unsupported auth type: ${config.authType}`)
  }

  // Add custom headers
  if (config.headers) {
    config.headers.forEach(header => {
      if (header.enabled) {
        headers[header.key] = header.value
      }
    })
  }

  return headers
}

export async function sendPrompt(config: ApiConfig, options: ApiRequestOptions) {
  // Log the incoming config
  console.log('Sending request with config:', {
    provider: config.provider,
    authType: config.authType,
    hasAuthValue: Boolean(config.authValue),
    url: config.url,
  })

  // Prepare headers with authentication
  const headers = prepareAuthHeaders(config)

  // Log headers (with sensitive data redacted)
  console.log('Request headers:', {
    ...headers,
    Authorization: headers.Authorization ? 
      headers.Authorization.replace(/Bearer \S+/, 'Bearer [REDACTED]') : 
      undefined
  })

  // Prepare endpoint and request body
  let endpoint: string
  let body: Record<string, unknown>

  if (config.provider !== 'custom' && PROVIDER_ENDPOINTS[config.provider]) {
    const providerConfig = PROVIDER_ENDPOINTS[config.provider]
    const baseUrl = removeTrailingSlash(config.url)
    endpoint = `${baseUrl}${providerConfig.path}`
    body = providerConfig.prepareBody(options)
  } else {
    endpoint = config.url
    body = {
      model: options.model,
      prompt: options.prompt,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000
    }
  }

  // Log request details
  console.log('Making request to:', endpoint)
  console.log('Request body:', JSON.stringify(body, null, 2))

  // Make the request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  // Handle errors
  if (!response.ok) {
    const responseText = await response.text()
    console.error('API Error Response:', responseText)

    let errorMessage: string
    try {
      const error = JSON.parse(responseText)
      errorMessage = error.error?.message || error.error || error.message || 
        `Request failed with status ${response.status}`
    } catch {
      errorMessage = `Request failed with status ${response.status}: ${responseText}`
    }

    throw new Error(
      response.status === 401 ? 
        `Invalid API key for ${config.provider}. Please check your API configuration.` : 
        errorMessage
    )
  }

  // Parse and return the response
  const result = await response.json()
  console.log('Received response:', {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries())
  })

  return result as LLMResponse
}