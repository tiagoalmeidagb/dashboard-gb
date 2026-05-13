import type { ContentFormat, ContentInstructions } from '@/types/content'

type ThemeContext = {
  title: string
  description?: string
  angle: string
  product: string
}

const PRODUCT_LABELS: Record<string, string> = {
  instructor: 'Instructor Certification (ICP/PCI)',
  integration: 'Integration Programs',
  'non-icp': 'Non-ICP Products',
}

export function buildPrompt(
  type: ContentFormat,
  theme: ThemeContext,
  instructions?: ContentInstructions
): string {
  const productLabel = PRODUCT_LABELS[theme.product] ?? theme.product
  const desc = theme.description ? `\nDescrição: ${theme.description}` : ''

  // ── 1. Instruções gerais ──────────────────────────────────────────────────
  const generalSection = instructions
    ? [
        instructions.general.toneOfVoice && `Tom de voz: ${instructions.general.toneOfVoice}`,
        instructions.general.targetAudience && `Público-alvo: ${instructions.general.targetAudience}`,
        instructions.general.generalRules && `Regras gerais: ${instructions.general.generalRules}`,
      ]
        .filter(Boolean)
        .join('\n')
    : ''

  // ── 2. Instruções do formato ──────────────────────────────────────────────
  const formatInstruction = instructions?.formats[type] ?? ''

  // ── 3. Dados do produto ───────────────────────────────────────────────────
  const productData = instructions?.products.find(
    p => p.name.toLowerCase().includes(theme.product) || theme.product.includes(p.id)
  )
  const productSection = productData
    ? [
        `Produto: ${productData.name}`,
        productData.description && `Descrição: ${productData.description}`,
        productData.promise && `Promessa: ${productData.promise}`,
        productData.audience && `Público específico: ${productData.audience}`,
        productData.differential && `Diferencial: ${productData.differential}`,
      ]
        .filter(Boolean)
        .join('\n')
    : `Produto: ${productLabel}`

  // ── 4. Exemplos few-shot ──────────────────────────────────────────────────
  const relevantExamples = instructions?.examples.filter(
    ex => ex.type === type && (!ex.productId || ex.productId === productData?.id)
  ) ?? []
  const examplesSection =
    relevantExamples.length > 0
      ? `\n\nExemplos de referência (use como guia de estilo, NÃO copie):\n${relevantExamples
          .map((ex, i) => `--- Exemplo ${i + 1} ---\n${ex.content}`)
          .join('\n\n')}`
      : ''

  // ── Base do prompt ────────────────────────────────────────────────────────
  const base = [
    `Você é um especialista em marketing da Gracie Barra, uma rede global de academias de jiu-jitsu.`,
    generalSection,
    productSection,
    `\nTema: ${theme.title}${desc}`,
    `Ângulo: ${theme.angle}`,
    `\nEscreva em português do Brasil.`,
    formatInstruction && `\nInstruções específicas para ${type}:\n${formatInstruction}`,
  ]
    .filter(Boolean)
    .join('\n')

  switch (type) {
    case 'email':
      return `${base}${examplesSection}

Crie um email de marketing com:
- Linha de assunto (Subject:)
- Corpo do email com abertura, desenvolvimento e CTA claro
- Máximo 250 palavras no corpo

Formato de saída:
Subject: [linha de assunto]

[corpo do email]`

    case 'whatsapp':
      return `${base}${examplesSection}

Crie uma mensagem para WhatsApp com:
- Máximo 150 palavras
- Linguagem direta e pessoal
- Use emojis com moderação (1-3 no máximo)
- CTA claro no final

Formato de saída:
[mensagem pronta para enviar]`

    case 'carousel':
      return `${base}${examplesSection}

Crie um roteiro de carrossel para Instagram com 5 a 7 slides:
- Slide 1: Capa com título chamativo (máximo 8 palavras)
- Slides 2-6: Um ponto por slide, texto curto (máximo 3 linhas por slide)
- Último slide: CTA com próximo passo

Formato de saída:
Slide 1 - Capa:
[texto]

Slide 2:
[texto]

[continuar para todos os slides]`
  }
}

export function buildTranslatePrompt(text: string): string {
  return `Traduza o texto abaixo do português para o inglês americano.
Mantenha o tom, a formatação e os emojis originais.
Retorne APENAS a tradução, sem explicações adicionais.

Texto:
${text}`
}
