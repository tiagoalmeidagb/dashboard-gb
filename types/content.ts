export type ContentProduct = 'instructor' | 'integration' | 'non-icp'

export type InstructionProduct = {
  id: string
  name: string
  description: string
  promise: string
  audience: string
  differential: string
}

export type InstructionExample = {
  id: string
  type: 'email' | 'whatsapp' | 'carousel'
  productId?: string
  content: string
}

export type ContentInstructions = {
  general: {
    toneOfVoice: string
    targetAudience: string
    generalRules: string
  }
  formats: {
    email: string
    whatsapp: string
    carousel: string
  }
  products: InstructionProduct[]
  examples: InstructionExample[]
  updatedAt: string
}

export type ContentFormat = 'email' | 'whatsapp' | 'carousel'

export type ContentTheme = {
  id: string
  title: string
  description?: string
  angle: string
  product: ContentProduct
  formats: {
    email: boolean
    whatsapp: boolean
    carousel: boolean
  }
  order: number
  createdAt: string
}

export type ContentBlock = {
  pt: {
    generated: string
    edited?: string
  }
  en?: {
    translated: string
  }
  status: 'draft' | 'approved'
}

export type GeneratedContent = {
  id: string
  themeSnapshot: {
    title: string
    description?: string
    angle: string
    product: string
  }
  formats: {
    email?: ContentBlock
    whatsapp?: ContentBlock
    carousel?: ContentBlock
  }
  createdAt: string
  status: 'draft' | 'completed'
}
