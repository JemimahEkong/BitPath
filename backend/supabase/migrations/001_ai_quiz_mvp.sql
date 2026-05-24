create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key,
    email text,
    display_name text,
    total_xp integer not null default 0,
    simulated_sats integer not null default 0,
    current_streak integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    summary text,
    content text not null,
    stage_number integer not null default 1,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.ai_interactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    lesson_id uuid not null references public.lessons(id) on delete cascade,
    stage_number integer not null default 1,
    interaction_number integer not null,
    user_message text not null,
    ai_response text not null,
    created_at timestamptz not null default now()
);

create index if not exists ai_interactions_user_lesson_stage_idx
    on public.ai_interactions(user_id, lesson_id, stage_number, created_at);

create table if not exists public.generated_quizzes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    lesson_id uuid not null references public.lessons(id) on delete cascade,
    stage_number integer not null default 1,
    source text not null default 'ai_interactions',
    status text not null default 'draft',
    created_at timestamptz not null default now()
);

create table if not exists public.generated_quiz_questions (
    id uuid primary key default gen_random_uuid(),
    quiz_id uuid not null references public.generated_quizzes(id) on delete cascade,
    question text not null,
    options jsonb not null,
    correct_option text not null,
    explanation text,
    created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    quiz_id uuid not null references public.generated_quizzes(id) on delete cascade,
    score integer not null default 0,
    passed boolean not null default false,
    answers jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.reward_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    source text not null,
    source_id uuid,
    xp_amount integer not null default 0,
    sats_amount integer not null default 0,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.generated_quizzes enable row level security;
alter table public.generated_quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.reward_transactions enable row level security;