export interface ApiHeaderConfig {
  key: string
  value: string
  enabled: boolean
}

export type ApiProvider = 'openai' | 'anthropic' | 'deepseek' | 'gemini' | 'custom'

export const DEFAULT_PROVIDER_URLS: Record<Exclude<ApiProvider, 'custom'>, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1'
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
  isDefault?: boolean
}

export interface UpdateApiConfigInput extends Partial<Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt'>> {
  id: string
}