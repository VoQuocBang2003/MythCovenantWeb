-- Migration: Create players table for member management

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  class text,
  role text,
  power integer default 0,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create trigger to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger players_update_timestamp
before update on players
for each row execute function update_updated_at();