create or replace function public.record_card_review(
  p_card_id uuid,
  p_fsrs_state jsonb,
  p_due_at timestamptz,
  p_stability double precision,
  p_difficulty double precision,
  p_elapsed_days integer,
  p_scheduled_days integer,
  p_reps integer,
  p_lapses integer,
  p_learning_steps integer,
  p_state text,
  p_rating smallint,
  p_reviewed_at timestamptz
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_rating not between 1 and 4 then
    raise exception 'Invalid FSRS rating';
  end if;

  if p_state not in ('new', 'learning', 'review', 'relearning') then
    raise exception 'Invalid FSRS state';
  end if;

  update public.card_scheduling
  set fsrs_state = p_fsrs_state,
      due_at = p_due_at,
      stability = p_stability,
      difficulty = p_difficulty,
      elapsed_days = p_elapsed_days,
      scheduled_days = p_scheduled_days,
      reps = p_reps,
      lapses = p_lapses,
      learning_steps = p_learning_steps,
      state = p_state,
      updated_at = p_reviewed_at
  where card_id = p_card_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Card schedule not found or access denied';
  end if;

  insert into public.review_logs(user_id, card_id, rating, reviewed_at)
  values (auth.uid(), p_card_id, p_rating, p_reviewed_at);
end;
$$;

revoke all on function public.record_card_review(uuid,jsonb,timestamptz,double precision,double precision,integer,integer,integer,integer,integer,text,smallint,timestamptz) from public;
grant execute on function public.record_card_review(uuid,jsonb,timestamptz,double precision,double precision,integer,integer,integer,integer,integer,text,smallint,timestamptz) to authenticated;
