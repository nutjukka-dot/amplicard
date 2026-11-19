# Amplicard

A personal flashcard web app built around an Obsidian → AI → JSON → Review workflow.

## Product direction

Amplicard is a focused study tool, not a social learning platform. The fastest path from notes to usable flashcards is the primary product goal.

### Core workflow
1. Write and summarize study notes in Obsidian.
2. Ask an external AI to convert the notes into Amplicard JSON.
3. Paste the JSON into Import.
4. Validate and preview cards, choose a deck, then import.
5. Review cards using spaced repetition.

## Initial product scope

- Dashboard: due cards, new cards, review progress, and a clear Continue Studying action.
- Deck Library: create, rename, browse, and search decks.
- Import: paste JSON, validate it, preview valid/invalid cards, detect duplicates, and import selected cards.
- Study: Basic Q&A and Cloze cards; reveal answer; rate Again / Hard / Good / Easy.
- Statistics: review activity and retention-oriented progress.
- Settings: export/import backup and review preferences.

Out of scope for the first release: social features, public decks, collaboration, in-app AI generation, payments, and gamification.

## Design direction

- Calm, editorial study workspace; avoid a generic AI-chat aesthetic.
- Light neutral canvas, restrained indigo accent, strong readable typography.
- Compact left navigation on desktop; responsive navigation on small screens.
- Generous whitespace around study cards; minimal distractions during review.
- Clear hierarchy: today's workload first, deck organization second, analytics third.

## Technical direction

- Frontend: React + TypeScript + Vite.
- UI: Tailwind CSS with accessible reusable components.
- Backend: Supabase Postgres + Supabase Auth.
- Data access: Row Level Security; every user-owned record is scoped to the authenticated user.
- Hosting: Vercel, linked to this GitHub repository.
- Scheduling: FSRS implementation/library rather than a custom scheduling algorithm.
- Validation: Zod schemas for imported JSON.
- Backup: JSON export/import.

## Import JSON contract

```json
{
  "deck": "Biology",
  "cards": [
    {
      "type": "basic",
      "front": "What is ...?",
      "back": " ...",
      "tags": ["biology", "cell"]
    },
    {
      "type": "cloze",
      "text": "The {{c1::mitochondrion}} produces most cellular ATP.",
      "tags": ["biology"]
    }
  ]
}
```

The importer should also accept a missing `type` as `basic` for simple AI-generated payloads. It must never silently discard invalid cards.

## Initial data model

- profiles: user preferences and review settings.
- decks: user-owned deck metadata.
- cards: user-owned card content, type, tags, and deck relation.
- card_scheduling: FSRS state per card.
- review_logs: immutable review events for statistics and schedule reconstruction.

All user data tables must have RLS enabled and ownership policies. No service-role key may be exposed to the browser.

## Build phases

1. App shell, dashboard, deck library, import validation and preview.
2. Study session, FSRS scheduling, review history.
3. Statistics, backup/restore, polish and responsive QA.
