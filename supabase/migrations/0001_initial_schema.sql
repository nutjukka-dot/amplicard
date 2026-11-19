create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  card_type text not null default 'basic' check (card_type in ('basic', 'cloze')),
  front text,
  back text,
  cloze_text text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  check (
    (card_type = 'basic' and front is not null and back is not null)
    or (card_type = 'cloze' and cloze_text is not null)
  )
);

create table public.card_scheduling (
  card_id uuid primary key references public.cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  due_at timestamptz not null default now(),
  stability double precision,
  difficulty double precision,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state text not null default 'new' check (state in ('new','learning','review','relearning')),
  updated_at timestamptz not null default now()
);

create table public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  rating smallint not null check (rating between 1 and 4),
  reviewed_at timestamptz not null default now(),
  elapsed_ms integer
);

alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.card_scheduling enable row level security;
alter table public.review_logs enable row level security;

create policy "profile owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "deck owner" on public.decks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "card owner" on public.cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "schedule owner" on public.card_scheduling for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review owner" on public.review_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index decks_user_id_idx on public.decks(user_id);
create index cards_deck_id_idx on public.cards(deck_id);
create index cards_user_id_idx on public.cards(user_id);
create index scheduling_due_idx on public.card_scheduling(user_id, due_at);
create index review_logs_user_date_idx on public.review_logs(user_id, reviewed_at desc);