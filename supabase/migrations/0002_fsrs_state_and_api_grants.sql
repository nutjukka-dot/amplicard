alter table public.card_scheduling
  add column if not exists learning_steps integer not null default 0,
  add column if not exists fsrs_state jsonb;

update public.card_scheduling
set fsrs_state = jsonb_build_object(
  'due', due_at,
  'stability', coalesce(stability, 0),
  'difficulty', coalesce(difficulty, 0),
  'elapsed_days', elapsed_days,
  'scheduled_days', scheduled_days,
  'reps', reps,
  'lapses', lapses,
  'learning_steps', learning_steps,
  'state', case state when 'new' then 0 when 'learning' then 1 when 'review' then 2 else 3 end,
  'last_review', null
)
where fsrs_state is null;

alter table public.card_scheduling alter column fsrs_state set not null;

grant select, insert, update, delete
on public.profiles, public.decks, public.cards, public.card_scheduling, public.review_logs
to authenticated;

create index if not exists review_logs_card_id_idx on public.review_logs(card_id);
