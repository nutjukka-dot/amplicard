import { z } from 'zod'

const basicCard = z.object({
  type: z.literal('basic').optional().default('basic'),
  front: z.string().trim().min(1, 'Front is required'),
  back: z.string().trim().min(1, 'Back is required'),
  tags: z.array(z.string().trim()).optional().default([]),
})
const clozeCard = z.object({
  type: z.literal('cloze'),
  text: z.string().trim().min(1).refine(
    value => /\{\{c\d+::.+?\}\}/.test(value),
    'Cloze card needs {{c1::hidden text}} syntax',
  ),
  tags: z.array(z.string().trim()).optional().default([]),
})
export const importSchema = z.object({
  deck: z.string().trim().min(1).default('Imported deck'),
  cards: z.array(z.union([basicCard, clozeCard])).min(1, 'At least one card is required'),
})
export type ImportPayload = z.infer<typeof importSchema>
