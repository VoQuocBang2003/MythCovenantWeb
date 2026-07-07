-- Supabase table schema for Myth Covenant admin app

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  class text,
  role text,
  power int default 0,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists layouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  config jsonb not null,
  created_at timestamptz default now()
);

create table if not exists team_assignments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  assignments jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create function if not exists update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger team_assignments_update_timestamp
before update on team_assignments
for each row execute function update_timestamp();