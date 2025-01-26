export interface InputField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  options?: string[];
  required: boolean;
  placeholder?: string;
  value?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  inputs: InputField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateStore {
  templates: PromptTemplate[];
  activeTemplate: PromptTemplate | null;
  setActiveTemplate: (template: PromptTemplate | null) => void;
  setFieldType: (key: string, type: 'text' | 'number' | 'select' | 'textarea') => void;
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  importTemplates: (templates: PromptTemplate[]) => void;
}