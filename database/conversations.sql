create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default 'Novo chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table chats
add column if not exists conversation_id uuid references conversations(id) on delete cascade;

create index if not exists conversations_user_updated_idx
on conversations(user_id, updated_at desc);

create index if not exists chats_conversation_created_idx
on chats(conversation_id, created_at desc);
