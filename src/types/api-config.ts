export interface ApiHeaderConfig {
  key: string
  value: string
  enabled: boolean
}

export interface ApiConfig {
  id: string
  name: string
  url: string
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
  authType: ApiConfig['authType']
  authKey?: string
  authValue?: string
  headers?: ApiHeaderConfig[]
  isDefault?: boolean
}

export interface UpdateApiConfigInput extends Partial<Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt'>> {
  id: string
}