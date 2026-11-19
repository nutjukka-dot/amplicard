import { createEmptyCard, fsrs, Rating, type Card as FsrsCard } from 'ts-fsrs'

export { Rating }
export type { FsrsCard }

export const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['10m'],
})

export function newFsrsCard(now = new Date()): FsrsCard {
  return createEmptyCard(now)
}

export function rateFsrsCard(card: FsrsCard, rating: Rating, now = new Date()) {
  return scheduler.next(card, now, rating as any)
}

export function getFsrsCard(state: any): FsrsCard {
  return {
    ...state,
    due: state.due instanceof Date ? state.due : new Date(state.due),
    last_review: state.last_review ? new Date(state.last_review) : undefined,
  } as FsrsCard
}
