export interface ApiHeaderConfig {
  key: string
  value: string
  enabled: boolean
}

export type ApiProvider = 'openai' | 'anthropic' | 'deepseek' | 'gemini' | 'custom'

export const DEFAULT_PROVIDER_URLS: Record<Exclude<ApiProvider, 'custom'>, string> = {
  openai: 'https://api.openai.com/v1/', // Ensure trailing slash
  anthropic: 'https://api.anthropic.com/v1/',
  deepseek: 'https://api.deepseek.com/v1/',
  gemini: 'https://generativelanguage.googleapis.com/v1/'
}

export interface ModelConfig {
  id: string
  name: string
  provider: ApiProvider
  contextWindow?: number
  maxOutputTokens?: number
}

// Default models per provider
export const DEFAULT_PROVIDER_MODELS: Record<Exclude<ApiProvider, 'custom'>, ModelConfig[]> = {
  openai: [
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000 },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai', contextWindow: 8192 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385 }
  ],
  anthropic: [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', contextWindow: 200000 },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', contextWindow: 200000 },
    { id: 'claude-2.1', name: 'Claude 2.1', provider: 'anthropic', contextWindow: 200000 }
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'Deepseek Chat', provider: 'deepseek', contextWindow: 32000 },
    { id: 'deepseek-reasoner', name: 'Deepseek R1', provider: 'deepseek', contextWindow: 32000 }
  ],
  gemini: [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', contextWindow: 32000 },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'gemini', contextWindow: 32000 }
  ]
}

export interface CustomModel {
  id: string
  name: string
  contextWindow?: number
}

export interface ApiConfig {
  id: string
  name: string
  url: string
  provider: ApiProvider
  authType: 'none' | 'bearer' | 'basic' | 'custom'
  authKey?: string
  authValue?: string
  headers: ApiHeaderConfig[]
  selectedModel?: string
  customModels?: CustomModel[]
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export interface CreateApiConfigInput {
  name: string
  url: string
  provider: ApiProvider
  authType: ApiConfig['authType']
  authKey?: string
  authValue?: string
  headers?: ApiHeaderConfig[]
  selectedModel?: string
  customModels?: CustomModel[]
  isDefault?: boolean
}

export interface UpdateApiConfigInput extends Partial<Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt'>> {
  id: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface AnthropicResponse {
  content: Array<{
    text: string
  }>
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export function isOpenAIResponse(response: LLMResponse): response is OpenAIResponse {
  return 'choices' in response && 
         Array.isArray(response.choices) && 
         response.choices.length > 0 &&
         'message' in response.choices[0] &&
         'content' in response.choices[0].message
}

export function isAnthropicResponse(response: LLMResponse): response is AnthropicResponse {
  return 'content' in response && 
         Array.isArray(response.content) && 
         response.content.length > 0 &&
         'text' in response.content[0]
}

export function isGeminiResponse(response: LLMResponse): response is GeminiResponse {
  return 'candidates' in response && 
         Array.isArray(response.candidates) && 
         response.candidates.length > 0 &&
         'content' in response.candidates[0] &&
         'parts' in response.candidates[0].content &&
         Array.isArray(response.candidates[0].content.parts) &&
         response.candidates[0].content.parts.length > 0 &&
         'text' in response.candidates[0].content.parts[0]
}

export function isDeepseekResponse(response: LLMResponse): response is DeepseekResponse {
  return isOpenAIResponse(response) // Deepseek uses the same response format as OpenAI
}

export type LLMResponse = OpenAIResponse | AnthropicResponse | GeminiResponse | DeepseekResponse | {
  [key: string]: unknown
}