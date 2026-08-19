-- Vector extension
create extension if not exists vector;

-- profiles
create table profiles (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  avatar_url text,
  timezone text,
  created_at timestamptz default now()
);

-- memories
create table memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  title text,
  content text,
  ai_summary text,
  embedding vector(1536),
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tags
create table tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  name text not null
);

-- memory_tags
create table memory_tags (
  memory_id uuid references memories(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  primary key (memory_id, tag_id)
);

-- collections
create table collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  color text
);

-- collection_memories
create table collection_memories (
  collection_id uuid references collections(id) on delete cascade not null,
  memory_id uuid references memories(id) on delete cascade not null,
  primary key (collection_id, memory_id)
);

-- reminders
create table reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  memory_id uuid references memories(id) on delete set null,
  title text not null,
  remind_at timestamptz not null,
  completed boolean default false,
  notification_method text,
  deadline timestamptz,
  priority text,
  created_at timestamptz default now()
);

-- conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  title text,
  created_at timestamptz default now()
);

-- messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Row Level Security (RLS) setup
alter table profiles enable row level security;
create policy "Users can view their own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);

alter table memories enable row level security;
create policy "Users can view their own memories." on memories for select using (auth.uid() = user_id);
create policy "Users can insert their own memories." on memories for insert with check (auth.uid() = user_id);
create policy "Users can update their own memories." on memories for update using (auth.uid() = user_id);
create policy "Users can delete their own memories." on memories for delete using (auth.uid() = user_id);

alter table tags enable row level security;
create policy "Users can view their own tags." on tags for select using (auth.uid() = user_id);
create policy "Users can insert their own tags." on tags for insert with check (auth.uid() = user_id);
create policy "Users can update their own tags." on tags for update using (auth.uid() = user_id);
create policy "Users can delete their own tags." on tags for delete using (auth.uid() = user_id);

alter table memory_tags enable row level security;
create policy "Users can manage memory tags" on memory_tags for all using (
  exists (select 1 from memories where memories.id = memory_tags.memory_id and memories.user_id = auth.uid())
);

alter table collections enable row level security;
create policy "Users can manage collections" on collections for all using (auth.uid() = user_id);

alter table collection_memories enable row level security;
create policy "Users can manage collection memories" on collection_memories for all using (
  exists (select 1 from collections where collections.id = collection_memories.collection_id and collections.user_id = auth.uid())
);

alter table reminders enable row level security;
create policy "Users can manage reminders" on reminders for all using (auth.uid() = user_id);

alter table conversations enable row level security;
create policy "Users can manage conversations" on conversations for all using (auth.uid() = user_id);

alter table messages enable row level security;
create policy "Users can manage messages" on messages for all using (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);
