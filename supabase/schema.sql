-- Jewish Engagement Insights — Database Schema
-- Run this in the Supabase SQL Editor to create all tables.

-- =============================================================
-- 1. ORGANIZATIONS
-- The org each user belongs to (JCC, synagogue, day school, etc.)
-- =============================================================
create type org_type as enum (
  'synagogue',
  'jcc',
  'day_school',
  'federation',
  'camp',
  'youth_org',
  'social_service',
  'other'
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type org_type not null default 'other',
  subtype text,  -- e.g. denomination for synagogues
  email_domains text[] default '{}',  -- for auto-detecting org on signup
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 2. PROFILES
-- Extended user info linked to Supabase Auth users
-- =============================================================
create type user_role as enum (
  'program_manager',
  'org_leader',
  'communal_leader'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'program_manager',
  organization_id uuid references organizations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 3. EVENTS
-- One row per event logged by a program manager
-- =============================================================
create type event_type as enum (
  'holiday',
  'shabbat',
  'educational',
  'social',
  'fundraiser',
  'family',
  'youth',
  'cultural',
  'worship',
  'volunteer',
  'other'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  created_by uuid not null references profiles(id),
  name text not null,
  short_description text,
  long_description text,
  event_date date not null,
  event_type event_type not null default 'other',
  attendee_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 4. PEOPLE_IDENTITIES (Private Secure Database)
-- Maps emails to anonymous IDs. Never exposed to regular users.
-- =============================================================
create table people_identities (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  alternate_email text,
  first_name text,
  last_name text,
  address text,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 5. PEOPLE_PROFILES (Anonymized People Database)
-- Accumulated demographics, linked by anonymous ID.
-- =============================================================
create type denomination as enum (
  'reform',
  'conservative',
  'orthodox',
  'reconstructionist',
  'just_jewish',
  'other',
  'unknown'
);

create table people_profiles (
  id uuid primary key references people_identities(id),
  date_of_birth date,
  age_bucket text,  -- e.g. '31-40', computed from DOB or uploaded age
  denomination denomination default 'unknown',
  has_children boolean,
  number_of_children integer,
  is_member boolean,        -- member of any org
  member_org_ids uuid[] default '{}',  -- which orgs they're members of
  data_sources integer default 1,  -- how many orgs have contributed data on this person
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 6. EVENT_ATTENDEES
-- Junction table: which people attended which events
-- =============================================================
create table event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references people_identities(id),
  raw_data jsonb default '{}',  -- original spreadsheet row data
  created_at timestamptz not null default now(),
  unique(event_id, person_id)
);

-- =============================================================
-- 7. POPULATION_UPLOADS
-- Tracks each population/membership data upload
-- =============================================================
create table population_uploads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  created_by uuid not null references profiles(id),
  name text not null,                -- e.g. "2024 Membership List", "Preschool Families"
  description text,
  member_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 8. POPULATION_MEMBERS
-- Junction table: which people are in which population upload
-- =============================================================
create table population_members (
  id uuid primary key default gen_random_uuid(),
  population_id uuid not null references population_uploads(id) on delete cascade,
  person_id uuid not null references people_identities(id),
  raw_data jsonb default '{}',  -- original spreadsheet row data
  created_at timestamptz not null default now(),
  unique(population_id, person_id)
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- Organizations: anyone authenticated can read, only system can write
alter table organizations enable row level security;
create policy "Anyone can view orgs" on organizations for select using (true);
create policy "Authenticated users can create orgs" on organizations for insert with check (auth.role() = 'authenticated');

-- Profiles: authenticated users can read all profiles, update their own
alter table profiles enable row level security;
create policy "Users can view profiles" on profiles for select
  using (auth.role() = 'authenticated');
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Events: users can see events from their org
alter table events enable row level security;
create policy "Users can view org events" on events for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );
create policy "Users can create org events" on events for insert
  with check (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );
create policy "Users can update own events" on events for update
  using (created_by = auth.uid());

-- People identities: LOCKED DOWN — no direct access from client
alter table people_identities enable row level security;
-- No policies = no client access. Only service role can read/write.

-- People profiles: read-only for authenticated users (aggregate insights)
alter table people_profiles enable row level security;
create policy "Authenticated users can view anonymized profiles" on people_profiles
  for select using (auth.role() = 'authenticated');

-- Event attendees: users can see attendees for their org's events
alter table event_attendees enable row level security;
create policy "Users can view org event attendees" on event_attendees for select
  using (
    event_id in (
      select e.id from events e
      where e.organization_id in (
        select organization_id from profiles where id = auth.uid()
      )
    )
  );
create policy "Users can add attendees to org events" on event_attendees for insert
  with check (
    event_id in (
      select e.id from events e
      where e.organization_id in (
        select organization_id from profiles where id = auth.uid()
      )
    )
  );

-- Population uploads: users can see/create uploads for their org
alter table population_uploads enable row level security;
create policy "Users can view org populations" on population_uploads for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );
create policy "Users can create org populations" on population_uploads for insert
  with check (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );
create policy "Users can update own populations" on population_uploads for update
  using (created_by = auth.uid());

-- Population members: users can see/add members for their org's populations
alter table population_members enable row level security;
create policy "Users can view org population members" on population_members for select
  using (
    population_id in (
      select p.id from population_uploads p
      where p.organization_id in (
        select organization_id from profiles where id = auth.uid()
      )
    )
  );
create policy "Users can add members to org populations" on population_members for insert
  with check (
    population_id in (
      select p.id from population_uploads p
      where p.organization_id in (
        select organization_id from profiles where id = auth.uid()
      )
    )
  );

-- =============================================================
-- INDEXES
-- =============================================================
create index idx_profiles_org on profiles(organization_id);
create index idx_events_org on events(organization_id);
create index idx_events_date on events(event_date);
create index idx_population_uploads_org on population_uploads(organization_id);
create index idx_population_members_population on population_members(population_id);
create index idx_population_members_person on population_members(person_id);
create index idx_event_attendees_event on event_attendees(event_id);
create index idx_event_attendees_person on event_attendees(person_id);
create index idx_people_identities_email on people_identities(email);
