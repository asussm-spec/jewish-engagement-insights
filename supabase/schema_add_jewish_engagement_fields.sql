-- =============================================================
-- JEWISH ENGAGEMENT FIELDS
-- Biographical yes/no facts about a person's Jewish life —
-- concrete, answerable, comparable across organizations.
--
-- Safe to run multiple times (ON CONFLICT DO NOTHING).
-- =============================================================

INSERT INTO field_registry (key, label, category, data_type, match_patterns, is_core) VALUES
-- Things they did themselves (Jewish identity)
('attended_jewish_preschool', 'Attended Jewish preschool', 'jewish_identity', 'boolean',
  '{attended.?jewish.?preschool,jewish.?preschool.?alum,went.?to.?jewish.?preschool,self.?jewish.?preschool}',
  false),
('attended_hebrew_school', 'Attended Hebrew school', 'jewish_identity', 'boolean',
  '{attended.?hebrew.?school,hebrew.?school.?alum,went.?to.?hebrew.?school,supplementary.?school.?alum,religious.?school.?alum,self.?hebrew.?school}',
  false),
('attended_day_school', 'Attended Jewish day school', 'jewish_identity', 'boolean',
  '{attended.?day.?school,day.?school.?alum,went.?to.?day.?school,self.?day.?school}',
  false),
('attended_overnight_camp', 'Attended Jewish overnight camp', 'jewish_identity', 'boolean',
  '{attended.?overnight.?camp,overnight.?camp.?alum,went.?to.?overnight.?camp,camp.?alum,self.?overnight.?camp}',
  false),
('is_birthright_alum', 'Birthright alum', 'jewish_identity', 'boolean',
  '{birthright,birthright.?alum,birthright.?israel,went.?birthright}',
  false),

-- Current adult Jewish engagement
('serves_on_jewish_board', 'Serves on a Jewish board', 'jewish_identity', 'boolean',
  '{jewish.?board,serves.?on.?board,board.?member,lay.?leader}',
  false),
('donates_to_federation', 'Donates to Federation', 'jewish_identity', 'boolean',
  '{donates.?federation,federation.?donor,gives.?to.?federation,federation.?gift,federation.?contributor}',
  false),

-- What they've done for their kids (family)
('sent_kid_to_jewish_preschool', 'Sent a kid to Jewish preschool', 'family', 'boolean',
  '{sent.?kid.?jewish.?preschool,kid.?jewish.?preschool,child.?jewish.?preschool}',
  false),
('sent_kid_to_hebrew_school', 'Sent a kid to Hebrew school', 'family', 'boolean',
  '{sent.?kid.?hebrew.?school,kid.?hebrew.?school,child.?hebrew.?school,kid.?religious.?school,child.?religious.?school}',
  false),
('sent_kid_to_day_school', 'Sent a kid to Jewish day school', 'family', 'boolean',
  '{sent.?kid.?day.?school,kid.?day.?school,child.?day.?school}',
  false),
('sent_kid_to_jewish_day_camp', 'Sent a kid to Jewish day camp', 'family', 'boolean',
  '{sent.?kid.?day.?camp,kid.?day.?camp,child.?day.?camp}',
  false),
('sent_kid_to_overnight_camp', 'Sent a kid to Jewish overnight camp', 'family', 'boolean',
  '{sent.?kid.?overnight.?camp,kid.?overnight.?camp,child.?overnight.?camp}',
  false),
('sent_kid_to_jewish_youth_group', 'Sent a kid to a Jewish youth group', 'family', 'boolean',
  '{sent.?kid.?youth.?group,kid.?youth.?group,child.?youth.?group,bbyo,ncsy,usy,nfty,young.?judaea}',
  false),
('sent_kid_on_teen_israel_trip', 'Sent a kid on a teen Israel trip', 'family', 'boolean',
  '{sent.?kid.?israel.?trip,kid.?israel.?trip,teen.?israel.?trip,march.?of.?the.?living,usy.?on.?wheels,ramah.?israel,nfty.?israel}',
  false),
('kid_had_bnai_mitzvah', 'A kid had a bar/bat mitzvah', 'family', 'boolean',
  '{kid.?bnai.?mitzvah,kid.?bar.?mitzvah,kid.?bat.?mitzvah,child.?bnai.?mitzvah,child.?bar.?mitzvah,child.?bat.?mitzvah,kid.?mitzvah,child.?mitzvah}',
  false)
ON CONFLICT (key) DO NOTHING;
