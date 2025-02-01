import { ApiConfig, ApiProvider, LLMResponse } from '../types/api-config'
import { useSettingsStore } from '../store/settingsStore'

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

interface StreamingResponse {
  choices?: Array<{
    delta?: {
      content?: string
    }
  }>
  delta?: {
    text?: string
  }
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

const PROVIDER_ENDPOINTS: Record<Exclude<ApiProvider, 'custom'>, ProviderEndpoint> = {
  openai: {
    path: '/chat/completions',
    prepareBody: (options) => ({
      model: options.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      max_completion_tokens: options.maxTokens ?? 1000  // Changed from max_tokens to max_completion_tokens
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

export async function sendPrompt(config: ApiConfig, options: ApiRequestOptions, onChunk?: (chunk: string) => void) {
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
  
  // Extract streaming flag and add it to the request body when using OpenAI
  const { streamResponses } = useSettingsStore.getState()
  if (streamResponses && config.provider === 'openai') {
    body = { ...body, stream: true }
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
  
  if (!response.ok) {
    await handleError(response)
  }

  if (streamResponses && response.body && onChunk) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // Process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep the last incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data) as StreamingResponse
            const text = extractResponseChunk(parsed, config.provider)
            if (text) onChunk(text)
          } catch (e) {
            console.warn('Failed to parse streaming response:', e)
          }
        }
      }
    }
    // Process any remaining buffer content
    if (buffer.trim() !== '' && buffer.startsWith('data: ')) {
      const data = buffer.slice(6)
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data) as StreamingResponse
          const text = extractResponseChunk(parsed, config.provider)
          if (text) onChunk(text)
        } catch (e) {
          console.warn('Failed to parse final streaming response:', e)
        }
      }
    }
    
    return {} as LLMResponse // Streaming doesn't return a final response
  }

  // Non-streaming response handling
  return handleResponse(response)
}

async function handleError(response: Response) {
  // Handle errors
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
      `Invalid API key for ${response.url}. Please check your API configuration.` : 
      errorMessage
  )
}

async function handleResponse(response: Response) {
  // Parse and return the response
  const result = await response.json()
  console.log('Received response:', {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries())
  })
  return result as LLMResponse
}

function extractResponseChunk(data: StreamingResponse, provider: ApiProvider): string | null {
  try {
    switch (provider) {
      case 'openai':
        return data.choices?.[0]?.delta?.content || null
      case 'anthropic':
        return data.delta?.text || null
      case 'gemini':
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null
      case 'deepseek':
        return data.choices?.[0]?.delta?.content || null
      case 'custom':
        // Try all formats
        return (
          data.choices?.[0]?.delta?.content ||
          data.delta?.text ||
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          null
        )
      default:
        return null
    }
  } catch (e) {
    console.warn('Error extracting chunk:', e)
    return null
  }
}