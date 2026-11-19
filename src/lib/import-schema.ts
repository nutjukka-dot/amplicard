import { z } from 'zod'

const basicCard = z.object({
  type: z.literal('basic').optional(),
  front: z.string().trim().min(1),
  back: z.string().trim().min(1),
  tags: z.array(z.string()).optional().default([]),
})
const clozeCard = z.object({
  type: z.literal('cloze'),
  text: z.string().trim().min(1).refine(value => /\{\{c\d+::.+?\}\}/.test(value), 'Cloze card needs {{c1::hidden text}} syntax'),
  tags: z.array(z.string()).optional().default([]),
})
export const importSchema = z.object({
  deck: z.string().trim().min(1).default('Imported deck'),
  cards: z.array(z.discriminatedUnion('type', [
    basicCard.extend({ type: z.literal('basic') }),
    clozeCard,
  ])).min(1),
})
export type ImportPayload = z.infer<typeof importSchema>