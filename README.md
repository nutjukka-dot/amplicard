# Amplicard

A personal, earth-tone flashcard app built around the Obsidian → external AI → JSON → review workflow.

## Core workflow

1. Summarize notes in Obsidian.
2. Ask an external AI to produce Amplicard JSON.
3. Paste JSON into Import, validate every card, and preview.
4. Import into a deck; duplicate cards are skipped with a visible result.
5. Review due cards using FSRS (Again / Hard / Good / Easy).

## Features

- Dashboard with real deck counts, due cards, daily reviews, and 30-day activity.
- Deck library and deck creation.
- JSON import for Basic Q&A and Cloze cards; omitted type defaults to basic.
- Invalid cards are listed with their card numbers; they are not silently discarded.
- Duplicate detection within the destination deck.
- Study sessions with answer reveal and FSRS scheduling.
- Review history and statistics.
- JSON backup export.
- Anonymous Supabase Auth session; no email or password is requested.

## Stack

- React 19 + TypeScript + Vite
- Supabase Postgres + Supabase Auth + Row Level Security
- ts-fsrs 5.4.2
- Zod validation, Recharts, Lucide
- Vercel deployment

## Data and privacy

Each browser creates an anonymous Supabase identity. The browser session persists locally and RLS scopes all records to that identity. This is intentionally passwordless, but it is not portable between browsers/devices: clearing browser storage or losing the session can make the anonymous account inaccessible. Export JSON backups regularly.

The frontend uses only the Supabase publishable key. Never expose a service-role key in client code.

## Supabase setup

1. Enable Anonymous Sign-Ins in Authentication → Providers.
2. Keep RLS enabled on all public user-data tables.
3. Configure Vercel environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (the modern publishable key).
4. Redeploy after changing environment variables.

## Import format

    {
      "deck": "Biology",
      "cards": [
        { "type": "basic", "front": "What is ...?", "back": "...", "tags": ["biology"] },
        { "type": "cloze", "text": "The {{c1::mitochondrion}} produces most cellular ATP." }
      ]
    }

A missing type is treated as basic.

## Current scope

No social features, public decks, in-app AI generation, payments, or multi-user collaboration. Study algorithm and scheduling are delegated to the maintained FSRS library rather than a custom implementation.
