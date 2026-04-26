-- Add membership expiration tracking to people_profiles.
-- A person counts as a current member when is_member = true AND
-- (membership_expires_at IS NULL OR membership_expires_at > now()).

alter table people_profiles
  add column if not exists membership_expires_at timestamptz;

create index if not exists idx_people_profiles_membership_expires
  on people_profiles(membership_expires_at);
