-- =============================================================
-- FIELD REGISTRY
-- Tracks all known data field types for column mapping
-- =============================================================
create table field_registry (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,           -- machine key e.g. 'child_1_dob'
  label text not null,                -- display label e.g. 'Child 1 date of birth'
  category text not null,             -- grouping: demographics, family, jewish_identity, engagement, geographic
  data_type text not null default 'text',  -- text, date, number, boolean, enum
  enum_values text[],                 -- for enum types, valid values
  match_patterns text[] default '{}', -- patterns for auto-detection e.g. '{kid.*dob, child.*birth}'
  is_core boolean default false,      -- if true, gets its own column on people_profiles
  created_at timestamptz not null default now()
);

-- Seed the registry with known fields
INSERT INTO field_registry (key, label, category, data_type, match_patterns, is_core) VALUES
-- Core Demographics
('date_of_birth', 'Date of birth', 'demographics', 'date', '{dob,date.?of.?birth,birth.?date,birthdate,participant.?dob,member.?dob}', true),
('age', 'Age', 'demographics', 'number', '{^age$,^age.?group$,participant.?age}', true),
('gender', 'Gender', 'demographics', 'text', '{gender,sex}', false),

-- Family
('spouse_name', 'Spouse / Partner name', 'family', 'text', '{spouse,partner,husband,wife}', false),
('num_children', 'Number of children', 'family', 'number', '{num.?child,number.?of.?child,num.?kid,how.?many.?kid,children}', false),
('child_1_name', 'Child 1 name', 'family', 'text', '{kid.?one.?name,child.?1.?name,kid.?1.?name,first.?child.?name,child.?one.?name}', false),
('child_1_dob', 'Child 1 date of birth', 'family', 'date', '{kid.?one.?dob,child.?1.?dob,kid.?1.?dob,kid.?one.?birth,child.?1.?birth,child.?one.?dob}', false),
('child_2_name', 'Child 2 name', 'family', 'text', '{kid.?two.?name,child.?2.?name,kid.?2.?name,second.?child.?name,child.?two.?name}', false),
('child_2_dob', 'Child 2 date of birth', 'family', 'date', '{kid.?two.?dob,child.?2.?dob,kid.?2.?dob,kid.?two.?birth,child.?2.?birth,child.?two.?dob}', false),
('child_3_name', 'Child 3 name', 'family', 'text', '{kid.?three.?name,child.?3.?name,kid.?3.?name,third.?child.?name}', false),
('child_3_dob', 'Child 3 date of birth', 'family', 'date', '{kid.?three.?dob,child.?3.?dob,kid.?3.?dob,kid.?three.?birth}', false),
('child_4_name', 'Child 4 name', 'family', 'text', '{kid.?four.?name,child.?4.?name,kid.?4.?name}', false),
('child_4_dob', 'Child 4 date of birth', 'family', 'date', '{kid.?four.?dob,child.?4.?dob,kid.?4.?dob}', false),

-- Jewish Identity
('denomination', 'Denomination', 'jewish_identity', 'enum', '{denom,movement,affiliation}', true),
('synagogue_name', 'Synagogue name', 'jewish_identity', 'text', '{synagogue,shul,temple.?name,congregation}', false),
('synagogue_member', 'Synagogue membership', 'jewish_identity', 'boolean', '{synagogue.?member,shul.?member,temple.?member,belong.?synagogue}', false),
('day_school_enrolled', 'Day school enrollment', 'jewish_identity', 'boolean', '{day.?school.?enroll,attend.?day.?school,jewish.?day.?school}', false),
('day_school_name', 'Day school name', 'jewish_identity', 'text', '{day.?school.?name,school.?name,school.?attend}', false),
('jewish_education', 'Jewish education type', 'jewish_identity', 'text', '{jewish.?ed,hebrew.?school,supplementary,religious.?school}', false),
('hebrew_name', 'Hebrew name', 'jewish_identity', 'text', '{hebrew.?name}', false),
('bnai_mitzvah_date', 'B''nai mitzvah date', 'jewish_identity', 'date', '{b.?nai.?mitzvah,bar.?mitzvah,bat.?mitzvah,b.?mitzvah}', false),

-- Engagement
('membership_type', 'Membership type', 'engagement', 'text', '{member.?type,membership.?type,membership.?level,member.?level}', false),
('membership_start', 'Membership start date', 'engagement', 'date', '{member.?start,membership.?start,join.?date,member.?since}', false),
('is_volunteer', 'Volunteer', 'engagement', 'boolean', '{volunteer,volunteers}', false),
('is_board_member', 'Board member', 'engagement', 'boolean', '{board.?member,board}', false),
('is_donor', 'Donor', 'engagement', 'boolean', '{donor,donated,donation}', false),

-- Geographic
('zip_code', 'Zip code', 'geographic', 'text', '{zip,zip.?code,postal,postal.?code}', false),
('city', 'City', 'geographic', 'text', '{^city$,town}', false),
('neighborhood', 'Neighborhood', 'geographic', 'text', '{neighborhood,area}', false),

-- Identity (always mapped, handled separately)
('email', 'Email address', 'identity', 'text', '{e.?mail,email}', false),
('first_name', 'First name', 'identity', 'text', '{first.?name,fname,first$}', false),
('last_name', 'Last name', 'identity', 'text', '{last.?name,lname,last$,surname}', false),
('full_name', 'Full name', 'identity', 'text', '{^name$,full.?name,fullname,participant.?name,member.?name}', false);

-- RLS for field_registry (read-only for all authenticated users)
alter table field_registry enable row level security;
create policy "Anyone can view field registry" on field_registry for select using (true);
create policy "Authenticated can add fields" on field_registry for insert with check (auth.role() = 'authenticated');

-- Add flexible attributes column to people_profiles
alter table people_profiles add column if not exists attributes jsonb default '{}';
