-- =============================================================================
-- run_impossible_questions.sql
-- Combined impossible-difficulty questions for all anime series.
-- Uses ON CONFLICT to safely skip duplicates based on (anime_id, question_text).
-- Source files: 008a, 008b, 008c, 008d, 008f
-- =============================================================================

-- Ensure a unique index exists so ON CONFLICT works
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_anime_id_question_text
  ON questions (anime_id, question_text);

-- Impossible questions: Attack on Titan + Death Note (60 questions)

-- ============================================================
-- Attack on Titan — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'In which episode of the anime does Eren first transform into a Titan?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 7","isCorrect":false},{"text":"Episode 5","isCorrect":false},{"text":"Episode 8","isCorrect":true},{"text":"Episode 6","isCorrect":false}]'::jsonb,
  'Eren first transforms into a Titan in Episode 8 of Season 1, titled "I Can Hear His Heartbeat: The Struggle for Trost, Part 4." He transforms after being swallowed by a Titan while saving Armin.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is the Japanese voice actor (seiyuu) for Levi Ackerman?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yūki Kaji","isCorrect":false},{"text":"Hiroshi Kamiya","isCorrect":true},{"text":"Daisuke Ono","isCorrect":false},{"text":"Takehito Koyasu","isCorrect":false}]'::jsonb,
  'Hiroshi Kamiya voices Levi Ackerman. Yūki Kaji voices Eren, Daisuke Ono voices Erwin, and Takehito Koyasu voices Zeke.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'During which numbered expedition does Commander Erwin Smith lose his right arm?',
  'multiple_choice',
  'impossible',
  '[{"text":"The 56th Expedition","isCorrect":false},{"text":"The 58th Expedition","isCorrect":false},{"text":"The 55th Expedition","isCorrect":false},{"text":"The 57th Expedition","isCorrect":true}]'::jsonb,
  'Erwin loses his right arm during the 57th Expedition Outside the Walls, which was the operation to capture the Female Titan. A Titan bit off his arm as he led a charge.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the official name of the scouting formation Erwin devised for expeditions outside the walls?',
  'multiple_choice',
  'impossible',
  '[{"text":"Long-Distance Enemy Scouting Formation","isCorrect":true},{"text":"Diamond Defensive Formation","isCorrect":false},{"text":"Wide-Range Titan Detection Array","isCorrect":false},{"text":"Expedition Relay Communication Formation","isCorrect":false}]'::jsonb,
  'The Long-Distance Enemy Scouting Formation uses smoke signals and spread-out ranks to detect and avoid Titans, minimizing casualties during expeditions beyond the walls.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What was Kenny Ackerman''s notorious title within the Interior Police?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kenny the Blade","isCorrect":false},{"text":"Kenny the Slasher","isCorrect":false},{"text":"Kenny the Ripper","isCorrect":true},{"text":"Kenny the Shadow","isCorrect":false}]'::jsonb,
  'Kenny Ackerman was known as "Kenny the Ripper" for his notorious killing spree in the capital. He murdered over 100 members of the Military Police before being recruited by Uri Reiss.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the exact height of the Colossal Titan in meters?',
  'multiple_choice',
  'impossible',
  '[{"text":"50 meters","isCorrect":false},{"text":"60 meters","isCorrect":true},{"text":"45 meters","isCorrect":false},{"text":"55 meters","isCorrect":false}]'::jsonb,
  'The Colossal Titan stands at approximately 60 meters tall, making it the tallest of the Nine Titans. The walls themselves are 50 meters tall, and the Colossal Titan''s head peeks over them.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the title of the OVA episode that focuses on Levi''s backstory in the Underground City?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wings of Freedom","isCorrect":false},{"text":"No Regrets","isCorrect":true},{"text":"Wall Sina, Goodbye","isCorrect":false},{"text":"Lost Girls","isCorrect":false}]'::jsonb,
  'The OVA "No Regrets" (Kuinaki Sentaku) is a two-part story that adapts the manga spin-off about Levi''s life as a thug in the Underground City and how Erwin recruited him into the Survey Corps.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which of the Nine Titans possesses the unique ability of skin hardening as its primary specialization?',
  'multiple_choice',
  'impossible',
  '[{"text":"The War Hammer Titan","isCorrect":false},{"text":"The Armored Titan","isCorrect":true},{"text":"The Female Titan","isCorrect":false},{"text":"The Attack Titan","isCorrect":false}]'::jsonb,
  'The Armored Titan, held by Reiner Braun, specializes in hardening — its entire body is covered in hardened Titan skin like armor plating. While other Titans can use hardening to a degree, it is the Armored Titan''s defining trait.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'In which year (in-universe) did Wall Maria fall to the Titans?',
  'multiple_choice',
  'impossible',
  '[{"text":"Year 850","isCorrect":false},{"text":"Year 844","isCorrect":false},{"text":"Year 845","isCorrect":true},{"text":"Year 847","isCorrect":false}]'::jsonb,
  'Wall Maria fell in the year 845 when the Colossal Titan and Armored Titan breached the Shiganshina District gate. The main story of the series picks up five years later in 850.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the full name of Grisha Yeager''s first wife from Marley?',
  'multiple_choice',
  'impossible',
  '[{"text":"Faye Yeager","isCorrect":false},{"text":"Dina Fritz","isCorrect":true},{"text":"Alma Reiss","isCorrect":false},{"text":"Karina Braun","isCorrect":false}]'::jsonb,
  'Dina Fritz was Grisha''s first wife and a descendant of the royal Fritz family living in Marley. She was turned into a Pure Titan and later became the Smiling Titan that ate Eren''s mother Carla.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'How many years can a Titan shifter live after inheriting their power, according to the Curse of Ymir?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 years","isCorrect":false},{"text":"15 years","isCorrect":false},{"text":"9 years","isCorrect":false},{"text":"13 years","isCorrect":true}]'::jsonb,
  'The Curse of Ymir limits all Titan shifters to 13 years of life after inheriting their power, mirroring the 13 years that the original Ymir Fritz lived after gaining the Power of the Titans.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the Japanese name for the Survey Corps?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chōsa Heidan","isCorrect":true},{"text":"Kenpei Heidan","isCorrect":false},{"text":"Chūō Heidan","isCorrect":false},{"text":"Shubiheitai","isCorrect":false}]'::jsonb,
  'The Survey Corps is called Chōsa Heidan (調査兵団) in Japanese. Chōsa means "investigation/survey" and Heidan means "military corps/regiment."'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who directed Seasons 1 through 3 of the Attack on Titan anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Masashi Koizuka","isCorrect":false},{"text":"Tetsurō Araki","isCorrect":true},{"text":"Jun Shishido","isCorrect":false},{"text":"Yuichiro Hayashi","isCorrect":false}]'::jsonb,
  'Tetsurō Araki directed the anime from Season 1 through Season 3 at WIT Studio. Yuichiro Hayashi took over as director for The Final Season at MAPPA.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which animation studio produced Attack on Titan: The Final Season?',
  'multiple_choice',
  'impossible',
  '[{"text":"WIT Studio","isCorrect":false},{"text":"Bones","isCorrect":false},{"text":"MAPPA","isCorrect":true},{"text":"Ufotable","isCorrect":false}]'::jsonb,
  'MAPPA took over production of Attack on Titan starting with The Final Season (Season 4). WIT Studio animated Seasons 1-3 but did not continue with the series.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What unique ability does the Attack Titan possess that no other Titan has?',
  'multiple_choice',
  'impossible',
  '[{"text":"The ability to regenerate faster than all other Titans","isCorrect":false},{"text":"The ability to copy other Titan powers temporarily","isCorrect":false},{"text":"The ability to receive memories from future inheritors","isCorrect":true},{"text":"The ability to harden without the need for a serum","isCorrect":false}]'::jsonb,
  'The Attack Titan can receive memories from its future inheritors, effectively seeing the future. This ability is what allowed Eren to manipulate events across time and is central to the plot of the final arc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What are the names of the two Titans that Hange Zoë captured for research?',
  'multiple_choice',
  'impossible',
  '[{"text":"Albert and Bean","isCorrect":false},{"text":"Sawney and Bean","isCorrect":true},{"text":"Sunny and Beane","isCorrect":false},{"text":"Sawyer and Bane","isCorrect":false}]'::jsonb,
  'Hange captured two Titans and named them Sawney and Bean, after the legendary Scottish cannibal Sawney Bean. They were killed by Annie Leonhart in her attempt to sabotage the Survey Corps'' research.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which numbered Training Corps did Eren, Mikasa, and Armin graduate from?',
  'multiple_choice',
  'impossible',
  '[{"text":"The 103rd Training Corps","isCorrect":false},{"text":"The 105th Training Corps","isCorrect":false},{"text":"The 104th Training Corps","isCorrect":true},{"text":"The 106th Training Corps","isCorrect":false}]'::jsonb,
  'Eren, Mikasa, Armin, and their classmates were all members of the 104th Training Corps (sometimes called the 104th Cadet Corps). This is also the class that included Reiner, Bertholdt, Annie, Jean, Sasha, and Connie.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'In which manga magazine was Attack on Titan originally serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Weekly Shōnen Jump","isCorrect":false},{"text":"Bessatsu Shōnen Magazine","isCorrect":true},{"text":"Monthly Shōnen Gangan","isCorrect":false},{"text":"Weekly Shōnen Magazine","isCorrect":false}]'::jsonb,
  'Attack on Titan was serialized in Bessatsu Shōnen Magazine (a monthly publication by Kodansha) from September 2009 to April 2021. Creator Hajime Isayama was famously rejected by Weekly Shōnen Jump.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is Falco Grice''s full first and last name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Falco Braun","isCorrect":false},{"text":"Falco Galliard","isCorrect":false},{"text":"Falco Grice","isCorrect":true},{"text":"Falco Kruger","isCorrect":false}]'::jsonb,
  'Falco Grice is his full name. His older brother is Colt Grice. He is a Warrior Candidate from Marley who eventually inherits the Jaw Titan from Porco Galliard.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What was Zeke Yeager''s secret plan when he conspired with Eren to use the Founding Titan?',
  'multiple_choice',
  'impossible',
  '[{"text":"To use the Rumbling to destroy the entire world outside Paradis","isCorrect":false},{"text":"To euthanize all Eldians by making them unable to reproduce","isCorrect":true},{"text":"To remove Titan powers from all Eldians permanently","isCorrect":false},{"text":"To rewrite Eldian memories to forget the history of Titans","isCorrect":false}]'::jsonb,
  'Zeke''s secret plan was the Euthanasia Plan: using the Founding Titan to alter the biology of all Subjects of Ymir so they could no longer reproduce, causing the Eldian race to peacefully die out within a generation. Eren pretended to agree but had his own plan.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What specific ability did King Karl Fritz use on the Eldians inside the walls?',
  'multiple_choice',
  'impossible',
  '[{"text":"He removed their ability to transform into Titans","isCorrect":false},{"text":"He implanted false memories of a peaceful history","isCorrect":false},{"text":"He erased their memories of the world outside the walls","isCorrect":true},{"text":"He altered their bloodline to prevent royal succession","isCorrect":false}]'::jsonb,
  'Karl Fritz used the Founding Titan''s power to erase the memories of all Subjects of Ymir within the walls, making them forget the outside world, the existence of Marley, and the true history of the Eldian Empire.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What specific condition must be met for the Founding Titan to use its full power?',
  'multiple_choice',
  'impossible',
  '[{"text":"The user must be within the Coordinate dimension","isCorrect":false},{"text":"The user must possess all Nine Titan powers simultaneously","isCorrect":false},{"text":"The user must make physical contact with a Titan of royal blood","isCorrect":true},{"text":"The user must consume a serum derived from spinal fluid","isCorrect":false}]'::jsonb,
  'A non-royal Founding Titan holder must make physical contact with a Titan who has royal blood to access the Founding Titan''s full power. This is why Eren needed Zeke (who has royal blood through Dina Fritz) and why touching Dina''s Titan temporarily activated his power.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the title of the first opening theme song for Attack on Titan Season 1?',
  'multiple_choice',
  'impossible',
  '[{"text":"Shinzou wo Sasageyo!","isCorrect":false},{"text":"Jiyuu no Tsubasa","isCorrect":false},{"text":"Guren no Yumiya","isCorrect":true},{"text":"Red Swan","isCorrect":false}]'::jsonb,
  'The first opening song is "Guren no Yumiya" (Crimson Bow and Arrow) by Linked Horizon. "Shinzou wo Sasageyo!" is the Season 2 opening, "Jiyuu no Tsubasa" is the second Season 1 opening, and "Red Swan" is from Season 3.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Approximately how tall was Rod Reiss''s abnormal Titan form compared to the walls?',
  'multiple_choice',
  'impossible',
  '[{"text":"About 80 meters, taller than Wall Maria","isCorrect":false},{"text":"About 120 meters, more than twice the wall height","isCorrect":true},{"text":"About 60 meters, the same as the Colossal Titan","isCorrect":false},{"text":"About 200 meters, the tallest Titan ever recorded","isCorrect":false}]'::jsonb,
  'Rod Reiss''s abnormal Titan was approximately 120 meters tall, over twice the height of the 50-meter walls and twice the size of the Colossal Titan. It was the largest Titan ever seen, though it could only crawl due to its deformed body.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who designed and created the anti-personnel vertical maneuvering equipment used by Kenny''s squad?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hange Zoë","isCorrect":false},{"text":"Angel Aaltonen","isCorrect":true},{"text":"Moblit Berner","isCorrect":false},{"text":"Dimo Reeves","isCorrect":false}]'::jsonb,
  'Angel Aaltonen is credited as the inventor and developer of the anti-personnel ODM gear. This modified version replaced the sword blades with firearms, specifically designed for combat against humans rather than Titans.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which district of Wall Maria was breached in the initial Titan attack?',
  'multiple_choice',
  'impossible',
  '[{"text":"Trost District","isCorrect":false},{"text":"Karanes District","isCorrect":false},{"text":"Shiganshina District","isCorrect":true},{"text":"Stohess District","isCorrect":false}]'::jsonb,
  'Shiganshina District, on the southern edge of Wall Maria, was the first district breached by the Colossal and Armored Titans in 845. Trost is a district of Wall Rose, and Stohess is a district of Wall Sheena.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'How many distinct Titan shifter powers (the Nine Titans) exist in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"Seven","isCorrect":false},{"text":"Eight","isCorrect":false},{"text":"Nine","isCorrect":true},{"text":"Thirteen","isCorrect":false}]'::jsonb,
  'There are exactly Nine Titans: the Founding Titan, Attack Titan, Colossal Titan, Armored Titan, Female Titan, Beast Titan, Jaw Titan, Cart Titan, and War Hammer Titan. They originate from Ymir Fritz''s power splitting among her descendants.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which Titan shifter has the specific ability to call and control Pure Titans using a scream, but only due to royal blood?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Founding Titan only","isCorrect":false},{"text":"The Female Titan","isCorrect":false},{"text":"Any Beast Titan holder","isCorrect":false},{"text":"Zeke Yeager''s Beast Titan, due to his royal blood","isCorrect":true}]'::jsonb,
  'While the Beast Titan does not inherently control Pure Titans, Zeke Yeager''s royal blood (through his mother Dina Fritz) gives his Beast Titan the ability to create and command Pure Titans through his spinal fluid and scream. This is unique to Zeke, not the Beast Titan itself.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the Marleyan military commander who leads the initial assault on Liberio during the raid?',
  'multiple_choice',
  'impossible',
  '[{"text":"General Calvi","isCorrect":false},{"text":"Sergeant Major Gross","isCorrect":false},{"text":"Commander Magath","isCorrect":true},{"text":"Officer Koslow","isCorrect":false}]'::jsonb,
  'Commander Theo Magath is the Marleyan military officer who oversees the Warrior program and commands Marley''s forces. He later becomes a key figure in the alliance against Eren during the Rumbling arc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- ============================================================
-- Death Note — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'According to the rules of the Death Note, how long does the user have to write the details of the cause of death after writing a name?',
  'multiple_choice',
  'impossible',
  '[{"text":"40 seconds","isCorrect":false},{"text":"6 minutes and 40 seconds","isCorrect":true},{"text":"10 minutes","isCorrect":false},{"text":"2 minutes and 20 seconds","isCorrect":false}]'::jsonb,
  'After writing a cause of death, the user has 6 minutes and 40 seconds to write the specific details. If the cause of death is written within 40 seconds of writing the name, the details must be completed within this additional timeframe.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is L''s real full name as revealed in supplementary materials?',
  'multiple_choice',
  'impossible',
  '[{"text":"L Lawliet","isCorrect":true},{"text":"L Lind Taylor","isCorrect":false},{"text":"L Liam Riviere","isCorrect":false},{"text":"L Lucian Wammy","isCorrect":false}]'::jsonb,
  'L''s real name is L Lawliet (pronounced "Law-light"), as confirmed in the Death Note 13: How to Read companion book. His first name is literally the letter L.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Who is the Japanese voice actor (seiyuu) for Light Yagami?',
  'multiple_choice',
  'impossible',
  '[{"text":"Jun Fukuyama","isCorrect":false},{"text":"Mamoru Miyano","isCorrect":true},{"text":"Kappei Yamaguchi","isCorrect":false},{"text":"Takahiro Sakurai","isCorrect":false}]'::jsonb,
  'Mamoru Miyano voices Light Yagami. He is also well known for voicing Rintaro Okabe in Steins;Gate and Tamaki Suoh in Ouran High School Host Club.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of Misa Amane''s Shinigami who follows her?',
  'multiple_choice',
  'impossible',
  '[{"text":"Ryuk","isCorrect":false},{"text":"Sidoh","isCorrect":false},{"text":"Rem","isCorrect":true},{"text":"Gelus","isCorrect":false}]'::jsonb,
  'Rem is the Shinigami who accompanies Misa Amane. Rem inherited the Death Note from Gelus, who died saving Misa''s life out of love. Rem develops similar protective feelings for Misa, which Light exploits.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the fake rule that Light had Ryuk write into the Death Note to protect himself?',
  'multiple_choice',
  'impossible',
  '[{"text":"A Death Note becomes inactive if not used for 30 days","isCorrect":false},{"text":"If the owner does not write a name within 13 days, they will die","isCorrect":true},{"text":"A Death Note can only be destroyed by fire from the Shinigami Realm","isCorrect":false},{"text":"The owner cannot kill someone whose name they learned through the Shinigami Eyes","isCorrect":false}]'::jsonb,
  'The fake "13-day rule" states that if the owner of a Death Note does not write a name within 13 days of their last entry, they will die. Light had this rule added to prevent the investigation team from testing the notebook by having him and Misa stop using it.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Which member of the Kira Investigation Task Force is killed during the raid on the Sakura TV station?',
  'multiple_choice',
  'impossible',
  '[{"text":"Aizawa","isCorrect":false},{"text":"Mogi","isCorrect":false},{"text":"Matsuda","isCorrect":false},{"text":"Ukita","isCorrect":true}]'::jsonb,
  'Kanzo Ukita rushed to the Sakura TV station to stop the Kira broadcast tapes and was killed by the Second Kira (Misa Amane), who was waiting outside with Shinigami Eyes and a Death Note.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What signature habit does Near display during his investigation sessions?',
  'multiple_choice',
  'impossible',
  '[{"text":"Eating sweets constantly","isCorrect":false},{"text":"Stacking and playing with toys, dice, and finger puppets","isCorrect":true},{"text":"Biting his thumbnail while thinking","isCorrect":false},{"text":"Drawing diagrams on the floor","isCorrect":false}]'::jsonb,
  'Near habitually plays with toys, stacks dice, builds card towers, and uses finger puppets during his investigations. This is his thinking method and a character trait that contrasts with L''s sweet-eating habits.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the Shinigami who originally owned the Death Note before Ryuk dropped it in the human world?',
  'multiple_choice',
  'impossible',
  '[{"text":"Gelus","isCorrect":false},{"text":"Ryuk always owned it — he stole a second notebook","isCorrect":true},{"text":"Sidoh","isCorrect":false},{"text":"Nu","isCorrect":false}]'::jsonb,
  'Ryuk actually stole the second Death Note from Sidoh, another Shinigami who was too lazy to retrieve it. Ryuk tricked the Shinigami King into giving him a second notebook, but it was actually Sidoh''s stolen one that he dropped to Earth.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What fraction of their remaining lifespan does a person give up when making the Shinigami Eye deal?',
  'multiple_choice',
  'impossible',
  '[{"text":"One third","isCorrect":false},{"text":"One quarter","isCorrect":false},{"text":"Half","isCorrect":true},{"text":"Two thirds","isCorrect":false}]'::jsonb,
  'The Shinigami Eye deal costs exactly half of the user''s remaining lifespan. In exchange, they gain the ability to see any human''s real name and remaining lifespan by looking at their face. Both Misa and Mikami made this deal.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the title of the first opening theme song for the Death Note anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Alumina","isCorrect":false},{"text":"What''s up, people?!","isCorrect":false},{"text":"the WORLD","isCorrect":true},{"text":"Zetsubou Billy","isCorrect":false}]'::jsonb,
  '"the WORLD" by Nightmare is the first opening song of Death Note, used for episodes 1-19. The second opening is "What''s up, people?!" by Maximum the Hormone. "Alumina" and "Zetsubou Billy" are ending themes.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Matt''s real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mihael Keehl","isCorrect":false},{"text":"Nate River","isCorrect":false},{"text":"Mail Jeevas","isCorrect":true},{"text":"Quilsh Wammy","isCorrect":false}]'::jsonb,
  'Matt''s real name is Mail Jeevas. He is the third-ranked successor at Wammy''s House and Mello''s closest friend and accomplice. Despite his limited screen time, he is a fan-favorite character.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How many FBI agents does Light Yagami kill to remove the surveillance on him?',
  'multiple_choice',
  'impossible',
  '[{"text":"8","isCorrect":false},{"text":"12","isCorrect":true},{"text":"16","isCorrect":false},{"text":"6","isCorrect":false}]'::jsonb,
  'Light killed all 12 FBI agents who were sent to Japan to investigate the Kira case. He manipulated agent Raye Penber into revealing all their names on a bus hijacking, then used the Death Note to kill all of them simultaneously.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What was Naomi Misora''s specific connection to L before the Kira case?',
  'multiple_choice',
  'impossible',
  '[{"text":"She was L''s personal bodyguard","isCorrect":false},{"text":"She was an FBI agent who worked with L on the Los Angeles BB Murder Cases","isCorrect":true},{"text":"She was a childhood friend from Wammy''s House","isCorrect":false},{"text":"She was a former Interpol liaison to L","isCorrect":false}]'::jsonb,
  'Naomi Misora was an FBI agent who previously collaborated with L on the Los Angeles BB (Beyond Birthday) Murder Cases, as detailed in the novel "Death Note: Another Note." Her investigative skills impressed L greatly.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Which member of the Yotsuba Group is chosen to temporarily wield the Death Note during the Yotsuba arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"Reiji Namikawa","isCorrect":false},{"text":"Shingo Mido","isCorrect":false},{"text":"Kyosuke Higuchi","isCorrect":true},{"text":"Takeshi Ooi","isCorrect":false}]'::jsonb,
  'Kyosuke Higuchi of the Yotsuba Group was the one who received the Death Note and acted as the third Kira. He used it for corporate murders to benefit Yotsuba. His capture by the task force was orchestrated by Light to regain the notebook.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Which animation studio produced the Death Note anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Bones","isCorrect":false},{"text":"Madhouse","isCorrect":true},{"text":"Sunrise","isCorrect":false},{"text":"Production I.G","isCorrect":false}]'::jsonb,
  'Madhouse produced the Death Note anime, which aired from October 2006 to June 2007 for 37 episodes. Madhouse is also known for producing Hunter x Hunter (2011), One Punch Man Season 1, and Parasyte.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Who directed the Death Note anime series?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tetsurou Araki","isCorrect":true},{"text":"Mamoru Hosoda","isCorrect":false},{"text":"Satoshi Kon","isCorrect":false},{"text":"Takeshi Obata","isCorrect":false}]'::jsonb,
  'Tetsurō Araki directed the Death Note anime at Madhouse. He later went on to direct Attack on Titan at WIT Studio. Takeshi Obata is the manga artist, not the anime director.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Watari''s real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Roger Ruvie","isCorrect":false},{"text":"Quillsh Wammy","isCorrect":true},{"text":"Backyard Bottomslash","isCorrect":false},{"text":"Watari Yagami","isCorrect":false}]'::jsonb,
  'Watari''s real name is Quillsh Wammy. He is L''s handler, the founder of Wammy''s House orphanage for gifted children, and a wealthy inventor who funds L''s detective operations.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'In which country was L raised at Wammy''s House orphanage?',
  'multiple_choice',
  'impossible',
  '[{"text":"France","isCorrect":false},{"text":"Japan","isCorrect":false},{"text":"United States","isCorrect":false},{"text":"England","isCorrect":true}]'::jsonb,
  'Wammy''s House is located in Winchester, England. It is an orphanage for extraordinarily gifted children, founded by Quillsh Wammy (Watari), where L, Near, Mello, and Matt were all raised.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What does the Shinigami Rem do to save Misa from being caught by L?',
  'multiple_choice',
  'impossible',
  '[{"text":"Rem threatens to kill L directly using her Shinigami powers","isCorrect":false},{"text":"Rem writes L''s and Watari''s names in her Death Note, killing herself in the process","isCorrect":true},{"text":"Rem erases Misa''s memories of the Death Note","isCorrect":false},{"text":"Rem hides the Death Note in the Shinigami Realm","isCorrect":false}]'::jsonb,
  'Rem writes both Watari''s and L''s real names in her Death Note to protect Misa from L''s investigation. Because a Shinigami who extends a human''s life by killing for them will die, Rem turns to dust. Light manipulated this outcome as part of his plan to eliminate L.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Teru Mikami''s repeated catchphrase when judging criminals?',
  'multiple_choice',
  'impossible',
  '[{"text":"Justice!","isCorrect":false},{"text":"Kira is God!","isCorrect":false},{"text":"Delete!","isCorrect":true},{"text":"Cleanse!","isCorrect":false}]'::jsonb,
  'Mikami''s signature catchphrase is "Sakujo!" which translates to "Delete!" He repeats it obsessively while writing names in the Death Note, reflecting his zealous devotion to Kira''s cause and his belief in absolute justice.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the King of the Shinigami Realm?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Great Shinigami","isCorrect":false},{"text":"The Shinigami King","isCorrect":true},{"text":"Yama","isCorrect":false},{"text":"The Death Lord","isCorrect":false}]'::jsonb,
  'The ruler of the Shinigami Realm is simply known as the Shinigami King (or King of Death). He is mentioned but never fully shown in the main series. He is the one who makes the rules governing Death Notes and the Shinigami Eye deals.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How does Light Yagami''s death differ between the manga and the anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"In the manga Light escapes; in the anime Ryuk kills him","isCorrect":false},{"text":"In both versions Ryuk writes Light''s name in his Death Note","isCorrect":false},{"text":"In the manga Light dies in a warehouse after being shot; in the anime he dies on a staircase after fleeing","isCorrect":true},{"text":"In the manga Near shoots Light; in the anime Matsuda does","isCorrect":false}]'::jsonb,
  'In the manga, after being exposed, Matsuda shoots Light and he bleeds out in the warehouse while begging Ryuk for help, and Ryuk writes his name. In the anime, Light flees and runs through the city, eventually collapsing on a staircase where he sees a vision of his younger self before Ryuk writes his name.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the Shinigami who sacrificed himself to save Misa Amane''s life before the events of the main story?',
  'multiple_choice',
  'impossible',
  '[{"text":"Rem","isCorrect":false},{"text":"Sidoh","isCorrect":false},{"text":"Armonia Justin Beyondormason","isCorrect":false},{"text":"Gelus","isCorrect":true}]'::jsonb,
  'Gelus was a Shinigami who fell in love with Misa Amane while watching her from the Shinigami Realm. When a stalker was about to kill her, Gelus wrote the stalker''s name in his Death Note to save her, which is forbidden for Shinigami. He crumbled to dust, and his notebook was passed to Rem.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How many days after finding the Death Note does L make his first televised broadcast challenging Kira?',
  'multiple_choice',
  'impossible',
  '[{"text":"3 days","isCorrect":false},{"text":"5 days","isCorrect":true},{"text":"7 days","isCorrect":false},{"text":"10 days","isCorrect":false}]'::jsonb,
  'L makes his first broadcast (using Lind L. Tailor as a decoy) approximately 5 days after Light first uses the Death Note. This broadcast was specifically targeted at the Kanto region of Japan, which allowed L to narrow down Kira''s location.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What specific piece of the Death Note did Light hide on his person as a backup?',
  'multiple_choice',
  'impossible',
  '[{"text":"A full page hidden in his wallet","isCorrect":false},{"text":"A small piece hidden inside his watch","isCorrect":true},{"text":"A torn corner tucked into his belt buckle","isCorrect":false},{"text":"A folded piece sewn into his jacket lining","isCorrect":false}]'::jsonb,
  'Light hid a small piece of the Death Note inside a secret compartment in his wristwatch. The watch had a mechanism where a tiny piece of paper could be accessed by pulling the crown pin and inserting a pin from the other side. He used this as a last resort backup.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What hotel does L use as his first headquarters when investigating the Kira case in Japan?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Imperial Hotel Tokyo","isCorrect":false},{"text":"The Ritz Kanto","isCorrect":false},{"text":"A suite in a luxury hotel in the Kanto region (unnamed in early episodes)","isCorrect":false},{"text":"The Teito Hotel","isCorrect":true}]'::jsonb,
  'L initially operates from the Teito Hotel before the task force establishes its dedicated headquarters. L uses hotel rooms as temporary bases, frequently changing locations for security purposes.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What was L doing when he famously demonstrated his physical abilities against Light in a one-on-one encounter at the university?',
  'multiple_choice',
  'impossible',
  '[{"text":"Playing chess","isCorrect":false},{"text":"Arm wrestling","isCorrect":false},{"text":"Playing tennis","isCorrect":true},{"text":"Running a race","isCorrect":false}]'::jsonb,
  'L and Light played a tennis match at To-Oh University, where both showed their competitive nature and physical prowess. L revealed he was once the British junior tennis champion, and the match served as an intellectual and physical battle between the two.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'According to the Death Note rules, what happens if the cause of death is not specified within 40 seconds of writing a name?',
  'multiple_choice',
  'impossible',
  '[{"text":"The person dies of a heart attack","isCorrect":true},{"text":"The death is cancelled and the name becomes void","isCorrect":false},{"text":"The person dies within 23 days of natural causes","isCorrect":false},{"text":"The Death Note''s owner loses a year of their lifespan","isCorrect":false}]'::jsonb,
  'If the cause of death is not specified within 40 seconds, the victim will simply die of a heart attack. This is the default cause of death for the Death Note, which is why Kira''s victims are predominantly reported as dying from heart attacks.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'In the manga, what specific number of volumes does the Death Note series span?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 volumes","isCorrect":false},{"text":"12 volumes","isCorrect":true},{"text":"14 volumes","isCorrect":false},{"text":"8 volumes","isCorrect":false}]'::jsonb,
  'The Death Note manga spans 12 volumes (108 chapters), serialized in Weekly Shōnen Jump from December 2003 to May 2006. The 13th book, "How to Read," is a supplementary guidebook, not a story volume.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Impossible questions: Demon Slayer + Dragon Ball Z (60 questions)

-- ============================================================
-- Demon Slayer — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who is the Japanese voice actor (seiyuu) for Tanjiro Kamado?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yoshitsugu Matsuoka","isCorrect":false},{"text":"Natsuki Hanae","isCorrect":true},{"text":"Yūki Kaji","isCorrect":false},{"text":"Ryōta Ōsaka","isCorrect":false}]'::jsonb,
  'Natsuki Hanae voices Tanjiro Kamado. He is also known for voicing Ken Kaneki in Tokyo Ghoul. Yoshitsugu Matsuoka voices Inosuke, and Yūki Kaji is known for Eren in Attack on Titan.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How many forms does Sun Breathing (Hinokami Kagura) have in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 forms","isCorrect":false},{"text":"12 forms","isCorrect":false},{"text":"13 forms","isCorrect":true},{"text":"9 forms","isCorrect":false}]'::jsonb,
  'Sun Breathing has 13 forms in total. The 13th form is a continuous cycle that connects all 12 forms into an endless loop. Tanjiro''s father performed all 12 forms in a continuous dance (Hinokami Kagura) throughout the night as an offering.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'In which historical era was Muzan Kibutsuji originally turned into a demon?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sengoku period","isCorrect":false},{"text":"Edo period","isCorrect":false},{"text":"Heian period","isCorrect":true},{"text":"Kamakura period","isCorrect":false}]'::jsonb,
  'Muzan was turned into a demon during the Heian period (794-1185 AD) of Japan, making him over 1,000 years old. He was a sickly human who was given an experimental medicine by a doctor that transformed him into the first demon.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the doctor who inadvertently turned Muzan Kibutsuji into a demon?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dr. Tamayo","isCorrect":false},{"text":"The doctor''s name is unknown — he was killed by Muzan before completing treatment","isCorrect":true},{"text":"Dr. Kagaya","isCorrect":false},{"text":"Dr. Yushiro","isCorrect":false}]'::jsonb,
  'The doctor who treated Muzan is never named in the series. He used a prototype medicine containing the Blue Spider Lily to treat Muzan''s terminal illness. When Muzan didn''t see immediate results, he killed the doctor in a rage, only to realize afterward that the treatment was working — but had turned him into a demon.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Kokushibo''s human name before he became a demon?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yoriichi Tsugikuni","isCorrect":false},{"text":"Michikatsu Tsugikuni","isCorrect":true},{"text":"Akaza Hakuji","isCorrect":false},{"text":"Kaigaku","isCorrect":false}]'::jsonb,
  'Kokushibo''s human name was Michikatsu Tsugikuni. He was the twin brother of Yoriichi Tsugikuni, the creator of Sun Breathing. Consumed by jealousy of his brother''s talent, Michikatsu accepted Muzan''s blood and became Upper Moon One.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is unique about Zenitsu''s mastery of Thunder Breathing?',
  'multiple_choice',
  'impossible',
  '[{"text":"He created his own original seventh form","isCorrect":false},{"text":"He can only perform the First Form: Thunderclap and Flash, but has perfected it to an extreme degree","isCorrect":true},{"text":"He mastered all six forms faster than any other student","isCorrect":false},{"text":"He can combine Thunder Breathing with Water Breathing","isCorrect":false}]'::jsonb,
  'Zenitsu could only learn the First Form of Thunder Breathing: Thunderclap and Flash (Ichi no Kata: Hekireki Issen). However, he refined this single form to an extraordinary level, developing multiple speed variations. He later creates his own original form, the Seventh Form: Honoikazuchi no Kami.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the Japanese name for Water Breathing?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kaze no Kokyū","isCorrect":false},{"text":"Hi no Kokyū","isCorrect":false},{"text":"Mizu no Kokyū","isCorrect":true},{"text":"Iwa no Kokyū","isCorrect":false}]'::jsonb,
  'Water Breathing is called Mizu no Kokyū (水の呼吸) in Japanese. Kaze is Wind, Hi is Flame, and Iwa is Stone. Water Breathing has 11 forms and is one of the five main Breathing Styles derived from Sun Breathing.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What type of weapon does the Stone Hashira Gyomei Himejima use, which is unique among the Hashira?',
  'multiple_choice',
  'impossible',
  '[{"text":"A massive stone hammer","isCorrect":false},{"text":"A spiked iron ball and axe connected by a chain","isCorrect":true},{"text":"Twin stone gauntlets","isCorrect":false},{"text":"A stone-bladed naginata","isCorrect":false}]'::jsonb,
  'Gyomei Himejima uses a hand-axe and a spiked flail ball connected by a long chain, both made of the same Nichirin ore. This is unique among the Hashira, who typically use Nichirin swords. He is considered the strongest active Hashira.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Which specific animation studio and team produced the Demon Slayer anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"MAPPA","isCorrect":false},{"text":"Ufotable","isCorrect":true},{"text":"Bones","isCorrect":false},{"text":"A-1 Pictures","isCorrect":false}]'::jsonb,
  'Ufotable produced Demon Slayer: Kimetsu no Yaiba. The studio is renowned for its digital compositing and visual effects work. Ufotable is also famous for the Fate series animations. Their work on Episode 19''s Hinokami Kagura scene went viral worldwide.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Upper Moon 4 Hantengu''s unique ability when his head is cut off?',
  'multiple_choice',
  'impossible',
  '[{"text":"He regenerates instantly from any severed part","isCorrect":false},{"text":"He splits into multiple smaller demons, each embodying a different emotion","isCorrect":true},{"text":"His body turns to stone and reforms","isCorrect":false},{"text":"He creates an illusion of himself while hiding his real body","isCorrect":false}]'::jsonb,
  'When Hantengu is beheaded, he splits into multiple demons, each representing a different emotion: Sekido (anger), Karaku (pleasure), Aizetsu (sorrow), and Urogi (joy). These can further combine into Zōhakuten (hatred). His real body is a tiny demon that hides while the clones fight.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How old was Tanjiro when his family was massacred by Muzan?',
  'multiple_choice',
  'impossible',
  '[{"text":"12 years old","isCorrect":false},{"text":"15 years old","isCorrect":false},{"text":"13 years old","isCorrect":true},{"text":"14 years old","isCorrect":false}]'::jsonb,
  'Tanjiro was 13 years old when Muzan Kibutsuji killed his family and turned Nezuko into a demon. He then spent two years training under Sakonji Urokodaki before attempting Final Selection at age 15.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the relation between Muichiro Tokito (Mist Hashira) and Kokushibo (Upper Moon One)?',
  'multiple_choice',
  'impossible',
  '[{"text":"Muichiro is Kokushibo''s son","isCorrect":false},{"text":"There is no relation","isCorrect":false},{"text":"Muichiro is Kokushibo''s descendant","isCorrect":true},{"text":"Muichiro is a reincarnation of Kokushibo","isCorrect":false}]'::jsonb,
  'Muichiro Tokito is a descendant of Kokushibo (Michikatsu Tsugikuni), who was Upper Moon One. This makes Muichiro also a descendant of the Tsugikuni bloodline. Despite being a descendant of a demon, Muichiro became one of the most talented Hashira, achieving the Demon Slayer Mark at just 14.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What color does Tanjiro''s Nichirin sword turn?',
  'multiple_choice',
  'impossible',
  '[{"text":"Blue","isCorrect":false},{"text":"Black","isCorrect":true},{"text":"Red","isCorrect":false},{"text":"White","isCorrect":false}]'::jsonb,
  'Tanjiro''s Nichirin sword turns black, which is considered an extremely rare and historically ominous color. Black blades are said to be wielded by swordsmen who die young and never become Hashira. The color is connected to Sun Breathing, the original Breathing Style.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the mountain where the Demon Slayer Corps'' Final Selection takes place?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mount Natagumo","isCorrect":false},{"text":"Mount Kumotori","isCorrect":false},{"text":"Mount Fujikasane","isCorrect":true},{"text":"Mount Sagiri","isCorrect":false}]'::jsonb,
  'Final Selection takes place on Mount Fujikasane (Fujikasane-yama), a mountain covered in wisteria flowers that bloom year-round. Demon Slayer candidates must survive seven days on the mountain among trapped demons to pass.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How many Hashira are alive and active at the beginning of the main story?',
  'multiple_choice',
  'impossible',
  '[{"text":"7","isCorrect":false},{"text":"10","isCorrect":false},{"text":"9","isCorrect":true},{"text":"8","isCorrect":false}]'::jsonb,
  'There are 9 active Hashira at the start of the series: Giyu Tomioka (Water), Shinobu Kocho (Insect), Kyojuro Rengoku (Flame), Tengen Uzui (Sound), Muichiro Tokito (Mist), Mitsuri Kanroji (Love), Obanai Iguro (Serpent), Sanemi Shinazugawa (Wind), and Gyomei Himejima (Stone).'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of Inosuke Hashibira''s mother?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kotoha Hashibira","isCorrect":true},{"text":"Kie Kamado","isCorrect":false},{"text":"Ruka Rengoku","isCorrect":false},{"text":"Kanae Kocho","isCorrect":false}]'::jsonb,
  'Inosuke''s mother was Kotoha Hashibira. She fled from her abusive husband to the Paradise Faith cult led by Doma (Upper Moon Two). When she discovered Doma was eating his followers, she tried to escape and threw baby Inosuke off a cliff into a river to save him before Doma killed her.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Daki''s (Upper Moon 6) specific Blood Demon Art?',
  'multiple_choice',
  'impossible',
  '[{"text":"She creates poisonous flower petals","isCorrect":false},{"text":"She manipulates Obi sashes that can cut and store humans","isCorrect":true},{"text":"She generates illusions of beautiful women","isCorrect":false},{"text":"She controls fire from her hairpins","isCorrect":false}]'::jsonb,
  'Daki''s Blood Demon Art allows her to create and manipulate sentient Obi sashes (fabric strips) from her body. These sashes can extend great distances, slice through flesh, and store captured humans alive inside them for later consumption.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the title of the first opening theme song for Demon Slayer Season 1?',
  'multiple_choice',
  'impossible',
  '[{"text":"Homura","isCorrect":false},{"text":"Zankyō Sanka","isCorrect":false},{"text":"Gurenge","isCorrect":true},{"text":"Akeboshi","isCorrect":false}]'::jsonb,
  '"Gurenge" (Red Lotus) by LiSA is the first opening theme. It became one of the best-selling anime songs in history. "Homura" is the Mugen Train film theme, "Zankyō Sanka" is the Entertainment District Arc opening, and "Akeboshi" is a later season opening.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who directed the Demon Slayer: Kimetsu no Yaiba anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tetsurō Araki","isCorrect":false},{"text":"Haruo Sotozaki","isCorrect":true},{"text":"Takahiro Miura","isCorrect":false},{"text":"Naokatsu Tsuda","isCorrect":false}]'::jsonb,
  'Haruo Sotozaki directed the Demon Slayer anime at Ufotable. He also directed the Mugen Train movie, which became the highest-grossing anime film in Japanese box office history, surpassing Spirited Away.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Kanao Tsuyuri''s specific reason for flipping a coin to make decisions?',
  'multiple_choice',
  'impossible',
  '[{"text":"She has a superstitious belief in fate","isCorrect":false},{"text":"She was so emotionally shut down from abuse that she couldn''t make decisions on her own","isCorrect":true},{"text":"It was a training exercise from her Hashira master","isCorrect":false},{"text":"The coin contains a special demon-detecting property","isCorrect":false}]'::jsonb,
  'Kanao suffered severe abuse as a child that left her emotionally numb and unable to make choices for herself. Kanae Kocho gave her a coin and told her to flip it whenever she needed to decide something. Tanjiro later told her to follow her heart, helping her begin making her own decisions.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Upper Moon 3 Akaza''s original human name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hakuji","isCorrect":true},{"text":"Kaigaku","isCorrect":false},{"text":"Michikatsu","isCorrect":false},{"text":"Gyutaro","isCorrect":false}]'::jsonb,
  'Akaza''s human name was Hakuji. He was a martial artist who cared for his sick father and later his master''s daughter Koyuki. After both were poisoned by a rival dojo, he slaughtered 67 people bare-handed before Muzan found and turned him into a demon.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Why is the Blue Spider Lily so important to Muzan Kibutsuji?',
  'multiple_choice',
  'impossible',
  '[{"text":"It is the only flower that can permanently kill him","isCorrect":false},{"text":"It was the key ingredient in the medicine that turned him into a demon, and he believes it can help him conquer sunlight","isCorrect":true},{"text":"It grows only where demon blood has been spilled","isCorrect":false},{"text":"It is needed to create new Upper Rank demons","isCorrect":false}]'::jsonb,
  'The Blue Spider Lily was an ingredient in the medicine the doctor used to turn Muzan into a demon. Muzan has searched for it for over 1,000 years, believing it is the key to conquering his weakness to sunlight and achieving true immortality.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Which Hashira was the first to achieve the Demon Slayer Mark in the current era?',
  'multiple_choice',
  'impossible',
  '[{"text":"Gyomei Himejima","isCorrect":false},{"text":"Giyu Tomioka","isCorrect":false},{"text":"Tanjiro Kamado","isCorrect":true},{"text":"Muichiro Tokito","isCorrect":false}]'::jsonb,
  'Although Tanjiro is not a Hashira, he was the first to manifest the Demon Slayer Mark in the current era during his battle against Upper Moon demons. His mark then triggered the awakening of marks in the Hashira, starting with Muichiro Tokito during the Swordsmith Village Arc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What specific Water Breathing technique does Tanjiro use in combination with Hinokami Kagura to defeat Lower Moon 5 Rui?',
  'multiple_choice',
  'impossible',
  '[{"text":"Water Breathing Tenth Form: Constant Flux combined with Hinokami Kagura: Dance","isCorrect":true},{"text":"Water Breathing First Form: Water Surface Slash combined with Hinokami Kagura: Burning Bones","isCorrect":false},{"text":"Water Breathing Fourth Form: Striking Tide combined with Hinokami Kagura: Clear Blue Sky","isCorrect":false},{"text":"Water Breathing Eighth Form: Waterfall Basin combined with Hinokami Kagura: Sunflower Thrust","isCorrect":false}]'::jsonb,
  'In the iconic Episode 19 fight against Rui, Tanjiro uses Water Breathing Tenth Form: Constant Flux but transitions mid-attack into Hinokami Kagura: Dance, combining both breathing styles. This moment, animated spectacularly by Ufotable, became one of the most celebrated scenes in anime history.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What Demon Slayer Corps rank does Tanjiro hold at the end of the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hashira","isCorrect":false},{"text":"Tsuchinoto","isCorrect":false},{"text":"Kinoe","isCorrect":true},{"text":"Hinoto","isCorrect":false}]'::jsonb,
  'Tanjiro reaches the rank of Kinoe, the highest rank below Hashira, by the end of the manga. Despite his incredible feats, he never officially becomes a Hashira. The ranking system goes: Mizunoto, Mizunoe, Kanoto, Kanoe, Tsuchinoto, Tsuchinoe, Hinoto, Hinoe, Kinoto, Kinoe, then Hashira.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'In which manga magazine was Demon Slayer: Kimetsu no Yaiba serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Weekly Shōnen Magazine","isCorrect":false},{"text":"Weekly Shōnen Jump","isCorrect":true},{"text":"Monthly Shōnen Gangan","isCorrect":false},{"text":"Bessatsu Shōnen Magazine","isCorrect":false}]'::jsonb,
  'Demon Slayer was serialized in Weekly Shōnen Jump from February 2016 to May 2020, running for 205 chapters across 23 volumes. It was created by Koyoharu Gotouge.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'In which episode of the anime does Kyojuro Rengoku die fighting Akaza?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 18 of Season 1","isCorrect":false},{"text":"The final act of the Mugen Train movie / Episode 7 of Mugen Train Arc","isCorrect":true},{"text":"Episode 1 of the Entertainment District Arc","isCorrect":false},{"text":"Episode 10 of the Swordsmith Village Arc","isCorrect":false}]'::jsonb,
  'Rengoku dies at the end of the Mugen Train movie (also adapted as Episode 7 of the Mugen Train TV arc). After defeating Lower Moon One Enmu, he fights Upper Moon Three Akaza until dawn, ultimately dying from his injuries while Akaza flees from the sunlight.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- ============================================================
-- Dragon Ball Z — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Goku''s original Saiyan birth name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Bardock","isCorrect":false},{"text":"Vegeta","isCorrect":false},{"text":"Kakarot","isCorrect":true},{"text":"Raditz","isCorrect":false}]'::jsonb,
  'Goku''s Saiyan birth name is Kakarot. He was given the name "Son Goku" by his adoptive grandfather Gohan on Earth. Vegeta and other Saiyans consistently refer to him as Kakarot throughout the series.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'In the original Japanese manga, what does Vegeta''s scouter read as Goku''s power level during their first fight on Earth?',
  'multiple_choice',
  'impossible',
  '[{"text":"Over 8,000","isCorrect":true},{"text":"Over 9,000","isCorrect":false},{"text":"Exactly 9,001","isCorrect":false},{"text":"Over 10,000","isCorrect":false}]'::jsonb,
  'In the original Japanese manga and anime, Vegeta exclaims "It''s over 8,000!" (Hassen Ijou Da!). The famous "over 9,000" line comes from the English dub by Ocean Studios/Funimation, which changed the number. This is one of anime''s most well-known localization changes.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is the Japanese voice actress who has voiced Goku since the original Dragon Ball?',
  'multiple_choice',
  'impossible',
  '[{"text":"Aya Hirano","isCorrect":false},{"text":"Megumi Hayashibara","isCorrect":false},{"text":"Masako Nozawa","isCorrect":true},{"text":"Romi Park","isCorrect":false}]'::jsonb,
  'Masako Nozawa has voiced Goku since the original Dragon Ball in 1986. She also voices Gohan, Goten, Bardock, Turles, and Goku Black — essentially every character related to Goku. She continued the role well into her 80s.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'In which specific episode number does Goku first transform into a Super Saiyan on Namek?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 80","isCorrect":false},{"text":"Episode 95","isCorrect":true},{"text":"Episode 100","isCorrect":false},{"text":"Episode 88","isCorrect":false}]'::jsonb,
  'Goku first transforms into a Super Saiyan in Episode 95 of Dragon Ball Z, titled "Transformed at Last." This happens after Frieza kills Krillin, and Goku''s rage triggers the legendary transformation on planet Namek.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Frieza''s stated maximum power level in his final form on Namek?',
  'multiple_choice',
  'impossible',
  '[{"text":"12,000,000","isCorrect":false},{"text":"120,000,000","isCorrect":true},{"text":"53,000,000","isCorrect":false},{"text":"1,000,000","isCorrect":false}]'::jsonb,
  'Frieza states his maximum power level at 100% in his final form is 120,000,000. At 50% power, he was at 60,000,000. Goku''s Super Saiyan form was estimated at 150,000,000, which is why he was able to overpower Frieza at full power.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the full Japanese name of the technique Goku learns from King Kai?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kamehameha","isCorrect":false},{"text":"Genki Dama","isCorrect":false},{"text":"Kaiō-ken","isCorrect":true},{"text":"Shunkan Idō","isCorrect":false}]'::jsonb,
  'The Kaiō-ken (界王拳, literally "Fist of the World King") is the power-multiplying technique Goku learns from King Kai. It multiplies his power but strains his body. He also learned the Genki Dama (Spirit Bomb) from King Kai, but Kaiō-ken is the signature combat technique.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'How many Dragon Balls exist on Planet Namek, and who created them?',
  'multiple_choice',
  'impossible',
  '[{"text":"7, created by Grand Elder Guru","isCorrect":true},{"text":"7, created by Kami","isCorrect":false},{"text":"5, created by the Namekian Dragon Clan","isCorrect":false},{"text":"9, created by Grand Elder Guru","isCorrect":false}]'::jsonb,
  'There are 7 Namekian Dragon Balls, created by Grand Elder Guru (Saichōrō). Unlike Earth''s Dragon Balls, the Namekian ones are much larger and can grant three wishes instead of one. They summon the dragon Porunga instead of Shenron.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Vegeta''s father?',
  'multiple_choice',
  'impossible',
  '[{"text":"King Cold","isCorrect":false},{"text":"King Vegeta","isCorrect":true},{"text":"Paragus","isCorrect":false},{"text":"Bardock","isCorrect":false}]'::jsonb,
  'Vegeta''s father is King Vegeta, the king of all Saiyans and ruler of Planet Vegeta. Both the planet and the prince are named after him. He was killed by Frieza when the tyrant destroyed Planet Vegeta.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the exact time limit of the Fusion Dance technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"15 minutes","isCorrect":false},{"text":"60 minutes","isCorrect":false},{"text":"30 minutes","isCorrect":true},{"text":"45 minutes","isCorrect":false}]'::jsonb,
  'The Fusion Dance lasts exactly 30 minutes before the fused warriors separate. However, excessive power usage (like Super Saiyan 3) can shorten this time. The fusion also requires the two fighters to be roughly equal in size and power level.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Gohan''s superhero alter ego that he uses during the Buu Saga?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Golden Warrior","isCorrect":false},{"text":"The Great Saiyaman","isCorrect":true},{"text":"The Green Champion","isCorrect":false},{"text":"Justice Man","isCorrect":false}]'::jsonb,
  'Gohan adopts the superhero identity "The Great Saiyaman" (Greto Saiyaman) during the early Buu Saga while attending Orange Star High School. He wears a ridiculous costume with a helmet and cape, performing dramatic poses much to Videl''s annoyance.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Android 17''s real human name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Lapis","isCorrect":true},{"text":"Lazuli","isCorrect":false},{"text":"Lars","isCorrect":false},{"text":"Leon","isCorrect":false}]'::jsonb,
  'Android 17''s original human name is Lapis, while Android 18''s is Lazuli. These names were revealed in the Dragon Ball manga companion guide. Dr. Gero kidnapped them as teenagers and modified them into cyborgs.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the full name of the manga creator of Dragon Ball?',
  'multiple_choice',
  'impossible',
  '[{"text":"Eiichiro Oda","isCorrect":false},{"text":"Masashi Kishimoto","isCorrect":false},{"text":"Akira Toriyama","isCorrect":true},{"text":"Yoshihiro Togashi","isCorrect":false}]'::jsonb,
  'Akira Toriyama created the Dragon Ball manga, which was serialized in Weekly Shōnen Jump from 1984 to 1995. He also created Dr. Slump and designed characters for the Dragon Quest video game series and Chrono Trigger. He passed away in March 2024.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the Japanese name for the Spirit Bomb technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Makankōsappō","isCorrect":false},{"text":"Kienzan","isCorrect":false},{"text":"Genki Dama","isCorrect":true},{"text":"Kakusan Yuudou Kikoha","isCorrect":false}]'::jsonb,
  'The Spirit Bomb is called Genki Dama (元気玉, literally "Energy Sphere") in Japanese. It gathers energy from living things in the surrounding area. Makankōsappō is Piccolo''s Special Beam Cannon, and Kienzan is Krillin''s Destructo Disc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which Dragon Ball Z saga is entirely anime-filler and does not appear in the original manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Saiyan Saga","isCorrect":false},{"text":"The Garlic Jr. Saga","isCorrect":true},{"text":"The Cell Games Saga","isCorrect":false},{"text":"The World Tournament Saga","isCorrect":false}]'::jsonb,
  'The Garlic Jr. Saga (episodes 108-117) is entirely anime-filler, occurring between the Frieza and Android sagas. It features Garlic Jr. from the first DBZ movie returning with the Makyo Star power-up. None of this appears in Toriyama''s original manga.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'How many times has Krillin died throughout the entire Dragon Ball franchise (DB, DBZ, GT)?',
  'multiple_choice',
  'impossible',
  '[{"text":"2 times","isCorrect":false},{"text":"4 times","isCorrect":false},{"text":"3 times","isCorrect":true},{"text":"5 times","isCorrect":false}]'::jsonb,
  'Krillin dies 3 times in the main canon: (1) killed by Tambourine in Dragon Ball, (2) killed by Frieza on Namek in DBZ, and (3) turned into chocolate and eaten by Super Buu in the Buu Saga. Each time he was revived by the Dragon Balls.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the time limit for Potara earring fusion when used by non-Supreme Kais?',
  'multiple_choice',
  'impossible',
  '[{"text":"It is permanent regardless of who uses it","isCorrect":false},{"text":"30 minutes","isCorrect":false},{"text":"1 hour","isCorrect":true},{"text":"24 hours","isCorrect":false}]'::jsonb,
  'As revealed in Dragon Ball Super, Potara fusion only lasts permanently for Supreme Kais. For mortals, the fusion lasts approximately one hour. This retcon explains why Vegito defused inside Super Buu, which was previously attributed to Buu''s magical body.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What special ability did Bardock possess in the TV special "Bardock — The Father of Goku"?',
  'multiple_choice',
  'impossible',
  '[{"text":"He could transform into a Super Saiyan","isCorrect":false},{"text":"He could see visions of the future","isCorrect":true},{"text":"He had an innate healing ability","isCorrect":false},{"text":"He could sense energy without a scouter","isCorrect":false}]'::jsonb,
  'In the 1990 TV special, Bardock gained the ability to see the future after being hit by the psychic alien Kanassan. He foresaw the destruction of Planet Vegeta and his son Goku''s battle with Frieza, but no one believed his warnings.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'On which planet did Goku train under 100x Earth''s gravity while traveling to Namek?',
  'multiple_choice',
  'impossible',
  '[{"text":"Planet Vegeta","isCorrect":false},{"text":"He trained on a spaceship, not a planet","isCorrect":true},{"text":"King Kai''s planet","isCorrect":false},{"text":"Planet Yardrat","isCorrect":false}]'::jsonb,
  'Goku trained inside Dr. Brief''s modified Saiyan spaceship during his journey to Namek, not on any planet. The ship had an adjustable gravity chamber that he cranked up to 100x Earth''s normal gravity. King Kai''s planet only has 10x gravity.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the exact power multiplier of the base Super Saiyan transformation?',
  'multiple_choice',
  'impossible',
  '[{"text":"10x base power","isCorrect":false},{"text":"100x base power","isCorrect":false},{"text":"50x base power","isCorrect":true},{"text":"25x base power","isCorrect":false}]'::jsonb,
  'The Super Saiyan transformation multiplies the user''s base power level by 50. This was established in the Daizenshuu guidebooks. Super Saiyan 2 is a 2x multiplier on top of that (100x base), and Super Saiyan 3 is 4x SSJ2 (400x base).'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Majin Buu''s original, most dangerous form?',
  'multiple_choice',
  'impossible',
  '[{"text":"Super Buu","isCorrect":false},{"text":"Kid Buu","isCorrect":true},{"text":"Ultra Buu","isCorrect":false},{"text":"Majin Buu (Pure Evil)","isCorrect":false}]'::jsonb,
  'Kid Buu (Pure Buu) is Majin Buu''s original form — pure, chaotic evil without any of the absorbed personalities that made other forms more rational. He is considered the most dangerous because he is completely unpredictable and destructive, destroying Earth without hesitation.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which specific techniques did Cell copy from each Z Fighter due to his bio-android composition?',
  'multiple_choice',
  'impossible',
  '[{"text":"Only the Kamehameha from Goku","isCorrect":false},{"text":"Kamehameha from Goku, Special Beam Cannon from Piccolo, Destructo Disc from Krillin, and regeneration from Piccolo","isCorrect":true},{"text":"Spirit Bomb from Goku and Final Flash from Vegeta","isCorrect":false},{"text":"Tri-Beam from Tien and Wolf Fang Fist from Yamcha only","isCorrect":false}]'::jsonb,
  'Cell contains the cells of Goku, Vegeta, Piccolo, Frieza, and King Cold, giving him access to the Kamehameha, Instant Transmission, regeneration (from Piccolo''s Namekian cells), Special Beam Cannon, Destructo Disc, and more. He also demonstrates Frieza''s Death Beam.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'According to the legend in Dragon Ball Super, how many righteous Saiyans were needed to create the original Super Saiyan God?',
  'multiple_choice',
  'impossible',
  '[{"text":"7 righteous Saiyans","isCorrect":false},{"text":"3 righteous Saiyans","isCorrect":false},{"text":"6 righteous Saiyans, including the one receiving the power","isCorrect":false},{"text":"5 righteous Saiyans channeling their energy into a 6th","isCorrect":true}]'::jsonb,
  'The Super Saiyan God ritual requires 5 righteous Saiyans to channel their energy into a 6th Saiyan. Goku achieved this form through Vegeta, Gohan, Goten, Trunks, and the unborn Pan (through Videl) channeling their energy into him during the Battle of Gods arc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Vegeta''s younger brother?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tarble","isCorrect":true},{"text":"Cabba","isCorrect":false},{"text":"Nappa","isCorrect":false},{"text":"Turles","isCorrect":false}]'::jsonb,
  'Tarble is Vegeta''s younger brother, introduced in the 2008 special "Yo! Son Goku and His Friends Return!!" He was sent to a distant planet as a child because he lacked fighting ability. His name combined with "Vege-" from Vegeta spells "vegetable."'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Dr. Gero''s own android designation number?',
  'multiple_choice',
  'impossible',
  '[{"text":"Android 19","isCorrect":false},{"text":"Android 21","isCorrect":false},{"text":"Android 20","isCorrect":true},{"text":"Android 16","isCorrect":false}]'::jsonb,
  'Dr. Gero converted himself into Android 20 to achieve immortality. Unlike Androids 17 and 18 who were humans modified into cyborgs, Gero transferred his brain into a fully mechanical body. He is eventually killed by Android 17 in his own laboratory.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What specific type of wish can Shenron NOT grant?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wishes that involve time travel","isCorrect":false},{"text":"Wishes that exceed the power of Shenron''s creator (Kami/Dende)","isCorrect":true},{"text":"Wishes involving other universes","isCorrect":false},{"text":"Wishes that affect Saiyans","isCorrect":false}]'::jsonb,
  'Shenron cannot grant wishes that exceed the power of his creator. Originally created by Kami, and later maintained by Dende, Shenron''s power is limited. This is why he couldn''t kill certain villains or undo certain events directly — they exceeded Kami''s/Dende''s power level.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'How old was Gohan during the Cell Games?',
  'multiple_choice',
  'impossible',
  '[{"text":"11 years old","isCorrect":true},{"text":"9 years old","isCorrect":false},{"text":"13 years old","isCorrect":false},{"text":"10 years old","isCorrect":false}]'::jsonb,
  'Gohan was 11 years old (or 9 in some calculations depending on the Hyperbolic Time Chamber time) during the Cell Games. He spent a year in the Hyperbolic Time Chamber with Goku, so his physical/mental age was about 11-12, though chronologically he was about 10-11.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the gravity multiplier on King Kai''s planet compared to Earth?',
  'multiple_choice',
  'impossible',
  '[{"text":"50x Earth gravity","isCorrect":false},{"text":"20x Earth gravity","isCorrect":false},{"text":"100x Earth gravity","isCorrect":false},{"text":"10x Earth gravity","isCorrect":true}]'::jsonb,
  'King Kai''s planet has 10 times Earth''s normal gravity. This relatively modest increase (compared to the 100x Goku later trains under) was enough to make initial training very difficult for Goku. The small, round planet is at the end of Snake Way in Other World.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which animation studio produced Dragon Ball Z?',
  'multiple_choice',
  'impossible',
  '[{"text":"Madhouse","isCorrect":false},{"text":"Sunrise","isCorrect":false},{"text":"Toei Animation","isCorrect":true},{"text":"Studio Pierrot","isCorrect":false}]'::jsonb,
  'Toei Animation has produced all Dragon Ball anime series since the original Dragon Ball in 1986. DBZ ran from 1989 to 1996 for 291 episodes. Toei Animation is one of Japan''s oldest and largest animation studios.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the title of the first opening theme song for Dragon Ball Z?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dragon Ball Densetsu","isCorrect":false},{"text":"Makafushigi Adventure","isCorrect":false},{"text":"Cha-La Head-Cha-La","isCorrect":true},{"text":"We Gotta Power","isCorrect":false}]'::jsonb,
  '"Cha-La Head-Cha-La" by Hironobu Kageyama is the iconic first opening theme of Dragon Ball Z, used for the Saiyan and Namek sagas. "Makafushigi Adventure" is the original Dragon Ball opening, and "We Gotta Power" is the second DBZ opening.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Impossible questions: Jujutsu Kaisen + My Hero Academia (60 questions)

-- ============================================================
-- Jujutsu Kaisen — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who is the Japanese voice actor (seiyuu) for Gojo Satoru?',
  'multiple_choice',
  'impossible',
  '[{"text":"Takahiro Sakurai","isCorrect":false},{"text":"Yūichi Nakamura","isCorrect":true},{"text":"Jun Fukuyama","isCorrect":false},{"text":"Junichi Suwabe","isCorrect":false}]'::jsonb,
  'Yūichi Nakamura voices Gojo Satoru. He is also known for voicing Hawks in My Hero Academia and Gray Fullbuster in Fairy Tail. Junichi Suwabe voices Sukuna, and Takahiro Sakurai voices an unrelated character.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the Japanese name of Gojo Satoru''s Domain Expansion?',
  'multiple_choice',
  'impossible',
  '[{"text":"Fukuma Mizushi","isCorrect":false},{"text":"Chimera Shadow Garden","isCorrect":false},{"text":"Muryōkūsho","isCorrect":true},{"text":"Jigoku Rakuen","isCorrect":false}]'::jsonb,
  'Gojo''s Domain Expansion is Muryōkūsho (無量空処), translated as "Unlimited Void" or "Infinite Void." It overwhelms the target with infinite information, paralyzing them. Fukuma Mizushi is Megumi''s incomplete domain.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Sukuna''s full title and epithet?',
  'multiple_choice',
  'impossible',
  '[{"text":"Ryomen Sukuna, the King of Curses","isCorrect":true},{"text":"Sukuna, the Lord of Calamity","isCorrect":false},{"text":"Ryomen Sukuna, the Cursed Emperor","isCorrect":false},{"text":"Sukuna, the God of Malice","isCorrect":false}]'::jsonb,
  'Sukuna''s full title is Ryomen Sukuna, the King of Curses (Noroi no Ō). "Ryomen" means "two-faced," referring to his original form with four arms and two faces. He is based on the legendary figure Ryomen-sukuna from Japanese mythology.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'How many of Sukuna''s fingers exist in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"10","isCorrect":false},{"text":"20","isCorrect":true},{"text":"15","isCorrect":false},{"text":"24","isCorrect":false}]'::jsonb,
  'There are 20 of Sukuna''s fingers in total, as Sukuna''s original form had four arms (and thus 20 fingers). Each finger is an indestructible cursed object containing a portion of his power. Yuji Itadori consumed one, which started the main plot.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the binding vow/condition Sukuna imposed on Yuji during the fight with the finger-bearer?',
  'multiple_choice',
  'impossible',
  '[{"text":"Contract of Dominion","isCorrect":false},{"text":"Enchain","isCorrect":true},{"text":"Vow of Subjugation","isCorrect":false},{"text":"Pact of the King","isCorrect":false}]'::jsonb,
  'The binding vow is called "Enchain" — Sukuna proposed conditions where he could take over Yuji''s body for one minute when he chants "Enchain," and Yuji would forget this agreement. This happened after Sukuna let Yuji die and revived him.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What makes Toji Fushiguro unique among fighters in the Jujutsu Kaisen world?',
  'multiple_choice',
  'impossible',
  '[{"text":"He possesses the strongest cursed technique ever recorded","isCorrect":false},{"text":"He has absolutely zero cursed energy due to a Heavenly Restriction that gave him superhuman physical abilities","isCorrect":true},{"text":"He can absorb cursed energy from his opponents","isCorrect":false},{"text":"He was born with a Domain Expansion but no cursed technique","isCorrect":false}]'::jsonb,
  'Toji Fushiguro (born Toji Zenin) has a Heavenly Restriction that traded all of his cursed energy for extraordinary physical prowess. He has literally zero cursed energy, making him invisible to jujutsu sorcerers who sense opponents through cursed energy. This allowed him to nearly kill young Gojo.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What event is Suguru Geto infamous for committing that led to his expulsion and designation as a curse user?',
  'multiple_choice',
  'impossible',
  '[{"text":"He attempted to assassinate the higher-ups of Jujutsu society","isCorrect":false},{"text":"He massacred an entire village of over 100 civilians","isCorrect":true},{"text":"He released all the curses sealed in the barrier of Tokyo","isCorrect":false},{"text":"He killed his own parents to absorb their cursed energy","isCorrect":false}]'::jsonb,
  'Geto massacred over 100 civilians in a village in September 2007, an event known as the "Star Plasma Vessel Incident" aftermath. Disillusioned with protecting non-sorcerers, he killed the entire village (including his own parents) and was expelled from Jujutsu High, becoming a wanted curse user.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the most powerful shikigami in Megumi''s Ten Shadows Technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Nue","isCorrect":false},{"text":"Max Elephant","isCorrect":false},{"text":"Mahoraga","isCorrect":true},{"text":"Divine Dog: Totality","isCorrect":false}]'::jsonb,
  'Mahoraga (Eight-Handled Sword Divergent Sila Divine General) is the most powerful shikigami of the Ten Shadows Technique. No user in the history of the Zenin clan has ever successfully tamed it. It has the ability to adapt to any phenomenon after being hit by it.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What are the four grades of cursed spirits and sorcerers in the Jujutsu classification system, from weakest to strongest?',
  'multiple_choice',
  'impossible',
  '[{"text":"Grade 4, Grade 3, Grade 2, Grade 1, Special Grade","isCorrect":true},{"text":"D-Rank, C-Rank, B-Rank, A-Rank, S-Rank","isCorrect":false},{"text":"Apprentice, Journeyman, Expert, Master, Grand Master","isCorrect":false},{"text":"Bronze, Silver, Gold, Platinum, Diamond","isCorrect":false}]'::jsonb,
  'The grading system from weakest to strongest is: Grade 4, Grade 3, Grade 2, Semi-Grade 1, Grade 1, and Special Grade. Special Grade is the highest and most dangerous classification, reserved for entities like Gojo, Yuta, Sukuna, and the disaster curses.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who is Kenjaku, and whose body did he possess before taking over Geto''s corpse?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is an ancient sorcerer who previously inhabited Yuji''s mother, Kaori Itadori","isCorrect":true},{"text":"He is a curse spirit who previously inhabited Mechamaru","isCorrect":false},{"text":"He is Sukuna''s twin who previously inhabited Toji Fushiguro","isCorrect":false},{"text":"He is a Heian-era sorcerer who only ever possessed Geto","isCorrect":false}]'::jsonb,
  'Kenjaku is an ancient sorcerer whose cursed technique allows him to transplant his brain into other bodies. Before possessing Geto''s corpse, he inhabited the body of Yuji''s mother (shown with the characteristic stitched forehead), making Kenjaku technically Yuji''s "parent."'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'In which manga chapter is Gojo Satoru sealed in the Prison Realm?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 85","isCorrect":false},{"text":"Chapter 91","isCorrect":true},{"text":"Chapter 100","isCorrect":false},{"text":"Chapter 78","isCorrect":false}]'::jsonb,
  'Gojo is sealed inside the Prison Realm in Chapter 91 of the manga, during the Shibuya Incident arc. Kenjaku (in Geto''s body) exploited Gojo''s emotional reaction to seeing his dead friend''s face, freezing him for the required amount of time.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who directed the first season of the Jujutsu Kaisen anime, and which studio produced it?',
  'multiple_choice',
  'impossible',
  '[{"text":"Haruo Sotozaki at Ufotable","isCorrect":false},{"text":"Sunghoo Park at MAPPA","isCorrect":true},{"text":"Tetsurō Araki at WIT Studio","isCorrect":false},{"text":"Takeshi Obata at Bones","isCorrect":false}]'::jsonb,
  'Sunghoo Park directed JJK Season 1 at MAPPA studio. His dynamic action direction, particularly in fights like Yuji and Todo vs. Hanami, earned widespread acclaim. Shōta Goshozono took over directing duties for Season 2.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the specific name of Nobara Kugisaki''s jujutsu technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Straw Doll Technique","isCorrect":true},{"text":"Voodoo Binding","isCorrect":false},{"text":"Resonance Needle Art","isCorrect":false},{"text":"Cursed Nail Formation","isCorrect":false}]'::jsonb,
  'Nobara''s technique is the Straw Doll Technique (Sutorō Dōru). It allows her to damage opponents through a voodoo-like resonance by using nails, a hammer, and a straw effigy. Her signature moves include "Resonance" and "Hairpin," which channel cursed energy through nails.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What was the name of Yuji Itadori''s high school before he transferred to Tokyo Jujutsu High?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sugisawa Third High School","isCorrect":true},{"text":"Kunimi Municipal High School","isCorrect":false},{"text":"Sendai First High School","isCorrect":false},{"text":"Miyagi Prefectural High School","isCorrect":false}]'::jsonb,
  'Yuji attended Sugisawa Third High School in Sendai, Miyagi Prefecture. He was a member of the Occult Research Club there, which is how he and his clubmates ended up finding one of Sukuna''s fingers sealed at the school.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Todo''s Boogie Woogie technique''s specific activation requirement?',
  'multiple_choice',
  'impossible',
  '[{"text":"He must snap his fingers","isCorrect":false},{"text":"He must clap his hands together","isCorrect":true},{"text":"He must stomp the ground","isCorrect":false},{"text":"He must make eye contact with both targets","isCorrect":false}]'::jsonb,
  'Todo''s Boogie Woogie activates when he claps his hands together, allowing him to swap the positions of any two things within his range that contain cursed energy (including himself). The speed of the swap and the ability to chain multiple swaps makes it devastatingly effective in combat.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of Mahito''s cursed technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Body Reprogramming","isCorrect":false},{"text":"Soul Multiplication","isCorrect":false},{"text":"Idle Transfiguration","isCorrect":true},{"text":"Cursed Metamorphosis","isCorrect":false}]'::jsonb,
  'Mahito''s cursed technique is Idle Transfiguration (Mukui Tenpen). It allows him to reshape souls, which in turn reshapes the body. He can distort humans into grotesque shapes, shrink them, or even merge multiple people together. It can also be used on his own body for combat adaptation.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Why was Yuta Okkotsu classified as Special Grade upon entering Jujutsu High?',
  'multiple_choice',
  'impossible',
  '[{"text":"He could use Reverse Cursed Technique from birth","isCorrect":false},{"text":"He was haunted by the immensely powerful cursed spirit of his childhood friend Rika Orimoto","isCorrect":true},{"text":"He possessed a natural Domain Expansion","isCorrect":false},{"text":"He had inherited the Six Eyes like Gojo","isCorrect":false}]'::jsonb,
  'Yuta was classified as Special Grade because he was connected to the extremely powerful cursed spirit Rika Orimoto — his childhood friend who died and became a vengeful curse bound to him. Rika was called the "Queen of Curses" and possessed near-infinite cursed energy.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What are the three great vengeful spirits of Japan referenced in Jujutsu Kaisen lore?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sukuna, Kenjaku, and Tengen","isCorrect":false},{"text":"Sugawara Michizane, Taira no Masakado, and Emperor Sutoku","isCorrect":true},{"text":"Amaterasu, Tsukuyomi, and Susanoo","isCorrect":false},{"text":"Izanagi, Izanami, and Raijin","isCorrect":false}]'::jsonb,
  'The three great vengeful spirits of Japan are Sugawara Michizane, Taira no Masakado, and Emperor Sutoku. In JJK, Yuta Okkotsu is a descendant of Sugawara Michizane, which partly explains his enormous cursed energy reserves.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'How is Choso related to Yuji Itadori?',
  'multiple_choice',
  'impossible',
  '[{"text":"They are completely unrelated — Choso is delusional","isCorrect":false},{"text":"They share the same mother through Kenjaku, who possessed both Choso''s and Yuji''s mothers","isCorrect":true},{"text":"Yuji is a reincarnation of one of Choso''s brothers","isCorrect":false},{"text":"They were both created by Sukuna in the Heian era","isCorrect":false}]'::jsonb,
  'Choso and Yuji are half-brothers through Kenjaku. Kenjaku (the brain-transplanting sorcerer) possessed a woman 150 years ago and mixed her blood with cursed spirits to create the Death Painting Wombs (Choso and his brothers). Kenjaku later possessed Yuji''s mother to give birth to Yuji. Thus Kenjaku is the "parent" of both.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the barrier technique used to trap civilians during the Shibuya Incident?',
  'multiple_choice',
  'impossible',
  '[{"text":"Curtain","isCorrect":true},{"text":"Veil","isCorrect":false},{"text":"Domain Shield","isCorrect":false},{"text":"Hollow Barrier","isCorrect":false}]'::jsonb,
  'The barrier technique used is called a "Curtain" (Tobari). During the Shibuya Incident, multiple Curtains were deployed to trap non-sorcerers in Shibuya Station and prevent jujutsu sorcerers from easily entering or leaving specific areas.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'How does the Reverse Cursed Technique work mechanically?',
  'multiple_choice',
  'impossible',
  '[{"text":"It reverses time on injured tissue","isCorrect":false},{"text":"It multiplies negative cursed energy by itself to create positive energy, which heals","isCorrect":true},{"text":"It absorbs cursed energy from the environment to restore cells","isCorrect":false},{"text":"It converts physical pain into healing factor","isCorrect":false}]'::jsonb,
  'Reverse Cursed Technique works by multiplying negative cursed energy by negative cursed energy, producing positive energy (a negative times a negative equals a positive). This positive energy can heal injuries. Very few sorcerers can perform this — Gojo and Shoko Ieiri being notable exceptions.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Mechamaru''s real name, and what is his Heavenly Restriction?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kokichi Muta — born with a fragile body but can control cursed energy puppets from vast distances","isCorrect":true},{"text":"Takuma Ino — born blind but can see through cursed energy","isCorrect":false},{"text":"Arata Nitta — born mute but can communicate through barriers","isCorrect":false},{"text":"Panda — an artificial being with no human body at all","isCorrect":false}]'::jsonb,
  'Mechamaru''s real name is Kokichi Muta. His Heavenly Restriction gave him an immobile, sickly body (he''s bedridden and covered in bandages) but in exchange, his cursed energy output covers the entire country of Japan, allowing him to control the puppet "Mechamaru" from anywhere.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the origin of the Simple Domain technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"It was created by Gojo''s ancestor","isCorrect":false},{"text":"New Shadow Style — a school of swordsmanship that developed it as a counter to Domain Expansions","isCorrect":true},{"text":"It is a natural ability that all Grade 1 sorcerers develop","isCorrect":false},{"text":"It was stolen from the cursed spirits of the Heian era","isCorrect":false}]'::jsonb,
  'Simple Domain (Ryuiki Tenkai) originates from the New Shadow Style school of swordsmanship. It was developed as a counter to Domain Expansions, creating a small domain around the user that neutralizes the guaranteed-hit effect of an enemy''s domain. Miwa''s swordsmanship comes from this school.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the title of the first opening theme song for Jujutsu Kaisen Season 1?',
  'multiple_choice',
  'impossible',
  '[{"text":"Vivid Vice","isCorrect":false},{"text":"Specialz","isCorrect":false},{"text":"Kaikai Kitan","isCorrect":true},{"text":"Where Our Blue Is","isCorrect":false}]'::jsonb,
  '"Kaikai Kitan" by Eve is the first opening for JJK Season 1. The song became massively popular worldwide. "Vivid Vice" is the second cour opening of Season 1, and "Specialz" by King Gnu is the Season 2 Shibuya Incident opening.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Naobito Zenin''s cursed technique, and what is its unique mechanic?',
  'multiple_choice',
  'impossible',
  '[{"text":"Projection Sorcery — divides one second into 24 frames and allows pre-set movements within that timeframe","isCorrect":true},{"text":"Time Freeze — stops time for everyone except himself for 3 seconds","isCorrect":false},{"text":"Speed Demon — doubles his movement speed for each consecutive hit","isCorrect":false},{"text":"Flash Step — teleports short distances by burning cursed energy","isCorrect":false}]'::jsonb,
  'Naobito''s Projection Sorcery divides one second into 24 frames (like animation), and he can trace a predetermined set of movements within that 1/24th of a second. Anyone who cannot keep up with this frame rate when touched by him gets frozen for one second in an animation frame.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'In which manga magazine is Jujutsu Kaisen serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Monthly Shōnen Gangan","isCorrect":false},{"text":"Weekly Shōnen Magazine","isCorrect":false},{"text":"Weekly Shōnen Jump","isCorrect":true},{"text":"Bessatsu Shōnen Magazine","isCorrect":false}]'::jsonb,
  'Jujutsu Kaisen by Gege Akutami is serialized in Weekly Shōnen Jump (Shueisha) since March 2018. It is one of the magazine''s flagship titles alongside One Piece. Akutami previously published "Tokyo Metropolitan Curse Technical School" (JJK 0) in Jump GIGA.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the exact multiplier applied to a Black Flash attack compared to a normal cursed energy attack?',
  'multiple_choice',
  'impossible',
  '[{"text":"2.0x the normal impact","isCorrect":false},{"text":"3.5x the normal impact","isCorrect":false},{"text":"2.5x the normal impact (to the power of 2.5)","isCorrect":true},{"text":"5.0x the normal impact","isCorrect":false}]'::jsonb,
  'A Black Flash creates a spatial distortion when cursed energy is applied within 0.000001 seconds of a physical hit. The resulting impact is equal to the normal hit raised to the power of 2.5 (not simply multiplied by 2.5). This makes Black Flash exponentially more powerful than normal attacks.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What self-estimated temperature does Jogo claim his Domain Expansion can reach?',
  'multiple_choice',
  'impossible',
  '[{"text":"The surface of the sun","isCorrect":false},{"text":"Over 1,000 degrees Celsius","isCorrect":false},{"text":"He never specified a temperature","isCorrect":false},{"text":"Hot enough to instantly burn a normal human to ash","isCorrect":true}]'::jsonb,
  'Jogo''s Domain Expansion "Coffin of the Iron Mountain" creates a volcanic environment so hot that any normal human caught inside would be instantly incinerated. Gojo was the only one to survive it unscathed due to his Infinity technique. Jogo boasted his domain''s heat was unmatched.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- ============================================================
-- My Hero Academia — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who is the Japanese voice actor (seiyuu) for All Might?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hiroshi Kamiya","isCorrect":false},{"text":"Kenta Miyake","isCorrect":true},{"text":"Tomokazu Sugita","isCorrect":false},{"text":"Katsuyuki Konishi","isCorrect":false}]'::jsonb,
  'Kenta Miyake voices All Might in both his muscular and true (deflated) forms. He brings enormous energy to the role, making All Might''s "Plus Ultra!" battle cries iconic in the anime community.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What exact percentage of the global population is born with a Quirk in the MHA world?',
  'multiple_choice',
  'impossible',
  '[{"text":"About 70%","isCorrect":false},{"text":"About 80%","isCorrect":true},{"text":"About 90%","isCorrect":false},{"text":"About 60%","isCorrect":false}]'::jsonb,
  'Approximately 80% of the world''s population possesses a Quirk, leaving roughly 20% Quirkless. Deku was born into this 20% minority before receiving One For All from All Might. The first Quirk manifested in a luminescent baby in Qingqing, China.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What generation number of One For All user is Izuku Midoriya?',
  'multiple_choice',
  'impossible',
  '[{"text":"The 8th user","isCorrect":false},{"text":"The 10th user","isCorrect":false},{"text":"The 9th user","isCorrect":true},{"text":"The 7th user","isCorrect":false}]'::jsonb,
  'Deku is the 9th user of One For All. The lineage goes: 1st - Yoichi Shigaraki, 2nd and 3rd - unnamed resistance fighters, 4th - Hikage Shinomori, 5th - Daigoro Banjo, 6th - En, 7th - Nana Shimura, 8th - All Might (Toshinori Yagi), 9th - Izuku Midoriya.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the real name of All For One''s personal doctor who helps him create Nomu?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dr. Tsubasa","isCorrect":false},{"text":"Dr. Kyudai Garaki","isCorrect":true},{"text":"Dr. Shiga Maruta","isCorrect":false},{"text":"Dr. Ujiko Daruma","isCorrect":false}]'::jsonb,
  'The doctor''s real name is Dr. Kyudai Garaki. He was previously known as "Daruma Ujiko" before a name change by the author. He has been All For One''s loyal follower for over a century, using his Quirk research to create the Nomu and duplicate Quirks.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who was the original first user of One For All?',
  'multiple_choice',
  'impossible',
  '[{"text":"Nana Shimura","isCorrect":false},{"text":"All Might","isCorrect":false},{"text":"Yoichi Shigaraki, All For One''s younger brother","isCorrect":true},{"text":"Hikage Shinomori","isCorrect":false}]'::jsonb,
  'The first user of One For All was Yoichi Shigaraki, the younger brother of All For One. He was thought to be Quirkless, but he actually had a power-stockpiling Quirk. When AFO forcibly gave him a power-transfer Quirk, it merged with his existing Quirk to create One For All.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Endeavor''s real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Todoroki Shoto","isCorrect":false},{"text":"Todoroki Natsuo","isCorrect":false},{"text":"Todoroki Enji","isCorrect":true},{"text":"Todoroki Toya","isCorrect":false}]'::jsonb,
  'Endeavor''s real name is Enji Todoroki. He is the No. 1 Hero after All Might''s retirement, and father to Shoto, Toya (Dabi), Fuyumi, and Natsuo. His obsession with surpassing All Might led to his abusive treatment of his family.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'How many students are in Class 1-A at U.A. High School?',
  'multiple_choice',
  'impossible',
  '[{"text":"15","isCorrect":false},{"text":"25","isCorrect":false},{"text":"20","isCorrect":true},{"text":"22","isCorrect":false}]'::jsonb,
  'There are exactly 20 students in Class 1-A. Notable members include Midoriya, Bakugo, Todoroki, Uraraka, Iida, Asui, Tokoyami, Yaoyorozu, Kirishima, Kaminari, Jiro, Ashido, Mineta, Aoyama, Sero, Ojiro, Sato, Koda, Shoji, and Hagakure.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the official name of the hero licensing exam that Class 1-A takes?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Hero Certification Trial","isCorrect":false},{"text":"The Provisional Hero License Exam","isCorrect":true},{"text":"The National Hero Assessment","isCorrect":false},{"text":"The Pro Hero Qualification Test","isCorrect":false}]'::jsonb,
  'The Provisional Hero License Exam is held annually and allows students to use their Quirks in emergency situations before graduating. The exam consists of thinning rounds and a rescue exercise. Bakugo and Todoroki famously failed their first attempt.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Mirio Togata''s hero name, and what is the specific mechanic of his Quirk "Permeation"?',
  'multiple_choice',
  'impossible',
  '[{"text":"Lemillion — he can phase through solid matter but loses all his senses while phased and falls through the ground if not careful","isCorrect":true},{"text":"Suneater — he can pass through walls but only for 3 seconds at a time","isCorrect":false},{"text":"Phantom — he becomes invisible and intangible simultaneously","isCorrect":false},{"text":"Lemillion — he teleports short distances through solid objects","isCorrect":false}]'::jsonb,
  'Mirio''s hero name is Lemillion (from his goal to save a million people). His Quirk "Permeation" lets him phase through matter, but while active, he can''t see, hear, or breathe since light, sound, and air also pass through him. He must constantly toggle it on body parts to fight, requiring immense training.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Hawks'' real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Takami Keigo","isCorrect":true},{"text":"Todoroki Toya","isCorrect":false},{"text":"Bubaigawara Jin","isCorrect":false},{"text":"Shimura Tenko","isCorrect":false}]'::jsonb,
  'Hawks'' real name is Keigo Takami. He became the No. 2 Hero at age 22 — the youngest top hero in history. His real name was kept secret for most of the series. Todoroki Toya is Dabi, Bubaigawara Jin is Twice, and Shimura Tenko is Shigaraki.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What mental condition affects Twice (Jin Bubaigawara), and how does it impact his Quirk?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dissociative identity disorder — his clones have different personalities he can''t control","isCorrect":false},{"text":"A trauma-induced identity crisis — he once cloned himself, his clones fought over who was the original, and the trauma left him unable to use his Quirk without a mental breakdown","isCorrect":true},{"text":"Amnesia — he forgets which clone is the real him","isCorrect":false},{"text":"Paranoia — he believes all his allies are secretly his clones","isCorrect":false}]'::jsonb,
  'Twice cloned himself to ease his loneliness, but his clones argued over who was real and killed each other. The trauma gave him a severe identity crisis, making him unable to clone himself without breaking down. He overcame this during the Meta Liberation Army arc, becoming extremely powerful before Hawks killed him.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the leader of the Meta Liberation Army?',
  'multiple_choice',
  'impossible',
  '[{"text":"Trumpet","isCorrect":false},{"text":"Skeptic","isCorrect":false},{"text":"Re-Destro (Rikiya Yotsubashi)","isCorrect":true},{"text":"Curious","isCorrect":false}]'::jsonb,
  'Re-Destro, real name Rikiya Yotsubashi, is the leader of the Meta Liberation Army and CEO of Detnerat. He is the son of Destro, the original Meta Liberation Army founder. After being defeated by Shigaraki, he submits and merges his army with the League of Villains to form the Paranormal Liberation Front.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Gigantomachia''s role and relationship to All For One?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is All For One''s bodyguard and most loyal servant, designed to only obey his master","isCorrect":true},{"text":"He is a Nomu prototype that went out of control","isCorrect":false},{"text":"He is All For One''s brother transformed into a giant","isCorrect":false},{"text":"He is a natural-born villain with no connection to All For One","isCorrect":false}]'::jsonb,
  'Gigantomachia is All For One''s most devoted bodyguard and servant. He possesses multiple Quirks given to him by AFO and was ordered to test and serve AFO''s successor, Shigaraki. He only submits to those he recognizes as his master, rampaging for 48 hours straight to test Shigaraki''s worthiness.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Eri''s Quirk called, and how specifically does it work?',
  'multiple_choice',
  'impossible',
  '[{"text":"Restore — it heals any injury by reversing cellular damage","isCorrect":false},{"text":"Rewind — it reverses a living being''s body to a previous state by rewinding their biological clock","isCorrect":true},{"text":"Reset — it returns objects and people to their original factory state","isCorrect":false},{"text":"Regress — it de-ages anyone she touches by exactly one year","isCorrect":false}]'::jsonb,
  'Eri''s Quirk is called Rewind. It can reverse a living being''s body to a previous state — she can heal injuries, remove Quirks (by rewinding to before the Quirk manifested), or even rewind someone out of existence entirely. Overhaul exploited her Quirk to create Quirk-destroying bullets.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Which animation studio produces My Hero Academia, and who is the series director?',
  'multiple_choice',
  'impossible',
  '[{"text":"MAPPA, directed by Sunghoo Park","isCorrect":false},{"text":"Bones, directed by Kenji Nagasaki","isCorrect":true},{"text":"Ufotable, directed by Haruo Sotozaki","isCorrect":false},{"text":"Toei Animation, directed by Tatsuya Nagamine","isCorrect":false}]'::jsonb,
  'My Hero Academia is produced by Bones (known for Fullmetal Alchemist: Brotherhood and Mob Psycho 100). The series director is Kenji Nagasaki, who has directed the show since its first season in 2016.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What was Shigaraki''s original name before All For One took him in?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tenko Shimura","isCorrect":true},{"text":"Tomura Shimura","isCorrect":false},{"text":"Tenko Shigaraki","isCorrect":false},{"text":"Kotaro Shimura","isCorrect":false}]'::jsonb,
  'Shigaraki''s birth name was Tenko Shimura. He is the grandson of Nana Shimura (the 7th One For All user). After his Quirk "Decay" accidentally killed his entire family, All For One found him and renamed him Tomura Shigaraki, raising him as his successor. Kotaro was his father''s name.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'How many Quirks are stockpiled within One For All that Deku can access?',
  'multiple_choice',
  'impossible',
  '[{"text":"5 Quirks from previous users","isCorrect":false},{"text":"8 Quirks from all previous users","isCorrect":false},{"text":"7 Quirks — 6 from previous users plus the base power-stockpiling Quirk","isCorrect":true},{"text":"9 Quirks — one from each user","isCorrect":false}]'::jsonb,
  'One For All contains 7 Quirks total: the base stockpiling Quirk, plus 6 Quirks from the 2nd through 7th users. All Might (8th) was Quirkless, so he didn''t add a Quirk. The 6 additional Quirks include Blackwhip, Float, Danger Sense, Smokescreen, Fa Jin, and the 2nd user''s Quirk (Gearshift).'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the Japanese name for U.A. High School?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yūei Kōkō","isCorrect":true},{"text":"Hīrō Gakuen","isCorrect":false},{"text":"Boku no Kōkō","isCorrect":false},{"text":"Akademī Kōtōgakkō","isCorrect":false}]'::jsonb,
  'U.A. High School is called Yūei Kōkō (雄英高校) in Japanese. "Yūei" is a play on words — it sounds like the English letters "U.A." but the kanji characters mean "heroic" or "outstanding." The school''s acceptance rate is less than 1 in 300.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Stain''s real name, and what is his core ideology?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chizome Akaguro — he believes only All Might is a true hero, and all others are fakes motivated by fame and money","isCorrect":true},{"text":"Dabi — he believes heroes are hypocrites who hide their true nature","isCorrect":false},{"text":"Gentle Criminal — he believes heroism should be accessible to everyone","isCorrect":false},{"text":"Stendhal — he believes society itself is the true villain","isCorrect":false}]'::jsonb,
  'Stain''s real name is Chizome Akaguro (also known as "Hero Killer: Stain"). His ideology is that modern heroes are corrupt, motivated by fame and money rather than true heroism. He believes only All Might embodies real heroism. He previously went by "Stendhal" before becoming Stain.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What percentage of One For All''s power could Deku safely use at the very beginning of his training?',
  'multiple_choice',
  'impossible',
  '[{"text":"1%","isCorrect":false},{"text":"10%","isCorrect":false},{"text":"5%","isCorrect":true},{"text":"0% — any usage broke his bones","isCorrect":false}]'::jsonb,
  'Initially, Deku could not control One For All at all, with any usage at 100% shattering his bones. After training with Gran Torino, he learned "Full Cowl" and could safely sustain 5% of One For All throughout his body. He gradually increased this to 8%, then 20%, 30%, and eventually 45% during the story.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What shocking secret about Yuga Aoyama is revealed in the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is actually a Nomu in disguise","isCorrect":false},{"text":"He was the UA traitor, forced to spy for All For One who gave him his Quirk","isCorrect":true},{"text":"He is related to All For One by blood","isCorrect":false},{"text":"His Quirk is actually stolen from another hero","isCorrect":false}]'::jsonb,
  'Aoyama is revealed as the UA traitor. He was originally Quirkless, and his parents made a deal with All For One, who gave Aoyama the Navel Laser Quirk (which his body can''t fully handle). In exchange, Aoyama was forced to feed information about UA to All For One. He eventually turns against AFO with the help of his classmates.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'In the U.A. Sports Festival tournament, who defeats Shoto Todoroki?',
  'multiple_choice',
  'impossible',
  '[{"text":"Izuku Midoriya","isCorrect":false},{"text":"Katsuki Bakugo","isCorrect":true},{"text":"Fumikage Tokoyami","isCorrect":false},{"text":"Tenya Iida","isCorrect":false}]'::jsonb,
  'Bakugo defeats Todoroki in the finals of the Sports Festival. However, Todoroki refused to use his fire side during the match (despite Midoriya''s efforts to get him to accept it in their earlier fight), which frustrated Bakugo who wanted to win against Todoroki at full power.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the title of the first opening theme song for My Hero Academia?',
  'multiple_choice',
  'impossible',
  '[{"text":"Peace Sign","isCorrect":false},{"text":"The Day","isCorrect":true},{"text":"Odd Future","isCorrect":false},{"text":"Polaris","isCorrect":false}]'::jsonb,
  '"The Day" by Porno Graffitti is the first opening theme for MHA Season 1. "Peace Sign" by Kenshi Yonezu is the Season 2 opening, "Odd Future" by UVERworld is Season 3''s first opening, and "Polaris" by BLUE ENCOUNT is Season 4''s opening.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Gran Torino''s connection to the previous One For All user?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was Nana Shimura''s close friend and sworn protector who helped train All Might","isCorrect":true},{"text":"He was the 6th user of One For All","isCorrect":false},{"text":"He was All Might''s father","isCorrect":false},{"text":"He was All For One''s former ally who defected","isCorrect":false}]'::jsonb,
  'Gran Torino (Sorahiko Torino) was close friends with Nana Shimura, the 7th One For All user. After Nana''s death at All For One''s hands, Gran Torino took on the role of training the young Toshinori Yagi (All Might) and later helped train Deku as well.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the official name of Bakugo''s ultimate super move?',
  'multiple_choice',
  'impossible',
  '[{"text":"Explosion God Dynamite","isCorrect":false},{"text":"AP Shot: Auto Cannon","isCorrect":false},{"text":"Howitzer Impact","isCorrect":true},{"text":"Stun Grenade Maximum","isCorrect":false}]'::jsonb,
  'Bakugo''s ultimate move is Howitzer Impact. He spins in the air to build up sweat (nitroglycerin), then releases it all in a massive explosion. He first uses it in the Sports Festival finals against Todoroki. AP Shot is a focused blast technique, not his ultimate move.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Overhaul''s real name, and how does his Quirk work specifically?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kai Chisaki — his Quirk lets him disassemble and reassemble matter with a touch","isCorrect":true},{"text":"Hari Kurono — his Quirk lets him fuse with anything he touches","isCorrect":false},{"text":"Shin Nemoto — his Quirk lets him destroy anything within a 10-meter radius","isCorrect":false},{"text":"Joi Irinaka — his Quirk lets him control the molecular structure of his environment","isCorrect":false}]'::jsonb,
  'Overhaul''s real name is Kai Chisaki. His Quirk allows him to disassemble anything he touches and reassemble it in any configuration. He can destroy people instantly, heal injuries, fuse with others, and reshape his environment. He used it to repeatedly kill and restore Eri to harvest her Quirk factor.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Impossible questions: Naruto + One Piece (60 questions)

-- ============================================================
-- Naruto — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who is the Japanese voice actress (seiyuu) for Naruto Uzumaki?',
  'multiple_choice',
  'impossible',
  '[{"text":"Nana Mizuki","isCorrect":false},{"text":"Junko Takeuchi","isCorrect":true},{"text":"Chie Nakamura","isCorrect":false},{"text":"Romi Park","isCorrect":false}]'::jsonb,
  'Junko Takeuchi has voiced Naruto Uzumaki since the original series in 2002 through Naruto Shippuden and Boruto. Nana Mizuki voices Hinata Hyuga, and Chie Nakamura voices Sakura Haruno.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How many hand signs are required to perform the Shadow Clone Jutsu?',
  'multiple_choice',
  'impossible',
  '[{"text":"Three hand signs","isCorrect":false},{"text":"Twelve hand signs","isCorrect":false},{"text":"One — a single cross-shaped hand sign","isCorrect":true},{"text":"Five hand signs","isCorrect":false}]'::jsonb,
  'The Shadow Clone Jutsu (Kage Bunshin no Jutsu) requires only a single hand sign — the cross-shaped seal where the user crosses their index and middle fingers from both hands. Despite its simplicity, it is classified as a forbidden technique due to its massive chakra cost.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How old was Itachi Uchiha when he carried out the Uchiha clan massacre?',
  'multiple_choice',
  'impossible',
  '[{"text":"15 years old","isCorrect":false},{"text":"11 years old","isCorrect":false},{"text":"13 years old","isCorrect":true},{"text":"16 years old","isCorrect":false}]'::jsonb,
  'Itachi was 13 years old when he massacred the Uchiha clan on orders from the Konoha leadership. He had already been an ANBU captain by that age. He spared only his younger brother Sasuke, who was 8 at the time.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific Mangekyō Sharingan ability unique to Itachi''s left eye?',
  'multiple_choice',
  'impossible',
  '[{"text":"Amaterasu","isCorrect":false},{"text":"Kamui","isCorrect":false},{"text":"Tsukuyomi","isCorrect":true},{"text":"Kotoamatsukami","isCorrect":false}]'::jsonb,
  'Tsukuyomi is the genjutsu ability of Itachi''s left Mangekyō Sharingan. It traps the victim in an illusory world where Itachi controls space, time, and mass, allowing him to inflict what feels like days of torture in mere seconds. His right eye controls Amaterasu. Kamui is Obito''s ability, and Kotoamatsukami is Shisui''s.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the forbidden scroll Naruto steals in the very first episode?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Scroll of Forbidden Seals","isCorrect":false},{"text":"The Scroll of Seals (Fūin no Sho)","isCorrect":true},{"text":"The Sacred Hokage Scroll","isCorrect":false},{"text":"The Forbidden Jutsu Archive","isCorrect":false}]'::jsonb,
  'The Scroll of Seals (Fūin no Sho), also called the Forbidden Scroll, is a large scroll containing dangerous jutsu compiled by the First Hokage. Naruto stole it after being tricked by Mizuki, and from it he learned the Multi Shadow Clone Jutsu that became his signature technique.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific mechanism of Minato''s Flying Thunder God technique (Hiraishin)?',
  'multiple_choice',
  'impossible',
  '[{"text":"He moves at the speed of light between two points","isCorrect":false},{"text":"He teleports instantly to special seal markers he has placed on objects or people","isCorrect":true},{"text":"He creates shadow clones at distant locations and switches consciousness","isCorrect":false},{"text":"He bends space-time in a radius around himself","isCorrect":false}]'::jsonb,
  'The Flying Thunder God Technique (Hiraishin no Jutsu) allows Minato to teleport instantly to any location where he has placed his special seal formula/marker. He places these markers on kunai, people, and locations. The technique was originally created by the Second Hokage Tobirama Senju.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How many tailed beasts (Bijū) exist in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"7","isCorrect":false},{"text":"10","isCorrect":false},{"text":"9","isCorrect":true},{"text":"12","isCorrect":false}]'::jsonb,
  'There are exactly 9 tailed beasts, numbered by their tail count: Shukaku (1-tail), Matatabi (2-tails), Isobu (3-tails), Son Gokū (4-tails), Kokuō (5-tails), Saiken (6-tails), Chōmei (7-tails), Gyūki (8-tails), and Kurama (9-tails). They were all created by the Sage of Six Paths splitting the Ten-Tails'' chakra.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What alias did Obito Uchiha use before his identity was revealed?',
  'multiple_choice',
  'impossible',
  '[{"text":"Madara","isCorrect":false},{"text":"Tobi","isCorrect":true},{"text":"Zetsu","isCorrect":false},{"text":"Pain","isCorrect":false}]'::jsonb,
  'Obito used the alias "Tobi" and wore an orange spiral mask. He initially posed as a goofy Akatsuki member before revealing himself as the mastermind behind the organization, claiming to be Madara Uchiha. His true identity as Obito was confirmed during the Fourth Great Ninja War.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What are the names of Pain''s Six Paths bodies?',
  'multiple_choice',
  'impossible',
  '[{"text":"Deva, Asura, Human, Animal, Preta, and Naraka Paths","isCorrect":true},{"text":"Fire, Water, Wind, Earth, Lightning, and Shadow Paths","isCorrect":false},{"text":"Heaven, Earth, Void, Light, Dark, and Chaos Paths","isCorrect":false},{"text":"Strength, Speed, Defense, Sight, Soul, and Death Paths","isCorrect":false}]'::jsonb,
  'The Six Paths of Pain are: Deva Path (gravity manipulation, Yahiko''s body), Asura Path (mechanized weapons), Human Path (soul reading/extraction), Animal Path (summoning), Preta Path (chakra absorption), and Naraka Path (interrogation/restoration via the King of Hell). All were controlled remotely by Nagato.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What was the name of Jiraiya''s spy network?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Toad Network","isCorrect":false},{"text":"He didn''t have a formal name for it — it was simply his intelligence network","isCorrect":true},{"text":"The Shadow Web","isCorrect":false},{"text":"The Sage''s Eyes","isCorrect":false}]'::jsonb,
  'Jiraiya''s spy network was never given a formal name in the series. It was simply referred to as his "intelligence network" or "spy network." He built it during his decades of traveling across the ninja world, gathering informants in various villages and organizations.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'In which manga magazine was Naruto originally serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Weekly Shōnen Magazine","isCorrect":false},{"text":"Monthly Shōnen Jump","isCorrect":false},{"text":"Weekly Shōnen Sunday","isCorrect":false},{"text":"Weekly Shōnen Jump","isCorrect":true}]'::jsonb,
  'Naruto was serialized in Weekly Shōnen Jump (Shueisha) from September 1999 to November 2014, running for 700 chapters across 72 volumes. It was created by Masashi Kishimoto and became one of the magazine''s best-selling series of all time.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Whose eyes did Madara Uchiha take to awaken his Eternal Mangekyō Sharingan?',
  'multiple_choice',
  'impossible',
  '[{"text":"Obito Uchiha''s eyes","isCorrect":false},{"text":"Shisui Uchiha''s eyes","isCorrect":false},{"text":"His brother Izuna Uchiha''s eyes","isCorrect":true},{"text":"Fugaku Uchiha''s eyes","isCorrect":false}]'::jsonb,
  'Madara transplanted his younger brother Izuna Uchiha''s Mangekyō Sharingan to awaken the Eternal Mangekyō Sharingan, which halted his blindness. Izuna gave his eyes either willingly (Madara''s version) or by force (Itachi''s retelling), depending on which account is believed.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How many gates are there in the Eight Gates technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"6 gates","isCorrect":false},{"text":"8 gates","isCorrect":true},{"text":"10 gates","isCorrect":false},{"text":"7 gates","isCorrect":false}]'::jsonb,
  'There are exactly 8 gates: Gate of Opening, Gate of Healing, Gate of Life, Gate of Pain, Gate of Limit, Gate of View, Gate of Wonder, and Gate of Death. Opening all 8 gates grants power surpassing even the Five Kage, but the 8th gate kills the user. Guy opened all 8 against Madara.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'In which specific arc does Rock Lee first use his Drunken Fist fighting style?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Chūnin Exams arc","isCorrect":false},{"text":"The Sasuke Recovery Mission arc (the Kimimaro fight)","isCorrect":true},{"text":"The Pain Invasion arc","isCorrect":false},{"text":"The Fourth Great Ninja War arc","isCorrect":false}]'::jsonb,
  'Rock Lee first uses the Drunken Fist (Suiken) during the Sasuke Recovery Mission arc, specifically in his fight against Kimimaro. Lee accidentally drank sake thinking it was his medicine, activating his natural talent for the unpredictable drunken fighting style.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Which animation studio produced the Naruto anime series?',
  'multiple_choice',
  'impossible',
  '[{"text":"Toei Animation","isCorrect":false},{"text":"Madhouse","isCorrect":false},{"text":"Studio Pierrot","isCorrect":true},{"text":"Bones","isCorrect":false}]'::jsonb,
  'Studio Pierrot produced both Naruto and Naruto Shippuden. The studio is also known for Bleach, Tokyo Ghoul, and Black Clover. The character designer was Tetsuya Nishio, who adapted Kishimoto''s manga designs for animation.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What animal does the Third Hokage (Hiruzen Sarutobi) summon in battle?',
  'multiple_choice',
  'impossible',
  '[{"text":"A hawk","isCorrect":false},{"text":"A monkey (Monkey King Enma)","isCorrect":true},{"text":"A tiger","isCorrect":false},{"text":"A snake","isCorrect":false}]'::jsonb,
  'Hiruzen Sarutobi summons Monkey King Enma, who can transform into an adamantine staff called the Vajra Nyoi. Enma is one of the most powerful summon animals and fought alongside Hiruzen during his final battle against Orochimaru during the Konoha Crush arc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'According to the official Naruto databook, what is Shikamaru Nara''s IQ?',
  'multiple_choice',
  'impossible',
  '[{"text":"Over 250","isCorrect":false},{"text":"Over 300","isCorrect":false},{"text":"Over 200","isCorrect":true},{"text":"Exactly 180","isCorrect":false}]'::jsonb,
  'According to the official Naruto databook, Shikamaru has an IQ of over 200. Asuma Sarutobi tested him using shogi and found his strategic thinking to be at genius level, despite his lazy demeanor and poor academic grades.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What unorthodox technique does Naruto use to distract Kaguya during the final battle?',
  'multiple_choice',
  'impossible',
  '[{"text":"Multi Shadow Clone Barrage","isCorrect":false},{"text":"Sexy: Reverse Harem Jutsu","isCorrect":true},{"text":"Talk no Jutsu","isCorrect":false},{"text":"Giant Rasengan","isCorrect":false}]'::jsonb,
  'Naruto uses the Sexy: Reverse Harem Jutsu (Oiroke: Gyaku Hāremu no Jutsu) against Kaguya Ōtsutsuki, creating multiple handsome male clones. This actually worked momentarily, shocking Kaguya enough to create an opening. Even the goddess wasn''t immune to Naruto''s most ridiculous technique.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the Japanese name for the First Hokage''s unique kekkei genkai?',
  'multiple_choice',
  'impossible',
  '[{"text":"Shakuton (Scorch Release)","isCorrect":false},{"text":"Mokuton (Wood Release)","isCorrect":true},{"text":"Hyōton (Ice Release)","isCorrect":false},{"text":"Jinton (Dust Release)","isCorrect":false}]'::jsonb,
  'Hashirama Senju''s unique kekkei genkai is Mokuton (木遁, Wood Release), which combines Earth and Water nature chakra. It is so rare that only Hashirama naturally possessed it. Yamato/Tenzō gained it through Orochimaru''s experiments with Hashirama''s cells.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'At what age did Kakashi Hatake become a Jōnin?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 years old","isCorrect":false},{"text":"14 years old","isCorrect":false},{"text":"13 years old","isCorrect":true},{"text":"12 years old","isCorrect":false}]'::jsonb,
  'Kakashi became a Jōnin at age 13 during the Third Great Ninja War era. He graduated the Academy at 5, became a Chūnin at 6, and Jōnin at 13. He is one of the youngest shinobi to achieve Jōnin rank in Konoha''s history.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who was Dan Katō, and why is he significant to Tsunade?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was Tsunade''s teacher who died in the First Great Ninja War","isCorrect":false},{"text":"He was Tsunade''s lover who dreamed of becoming Hokage but died in the Second Great Ninja War","isCorrect":true},{"text":"He was Tsunade''s brother who was killed by Orochimaru","isCorrect":false},{"text":"He was Tsunade''s father and the previous Hokage","isCorrect":false}]'::jsonb,
  'Dan Katō was Tsunade''s lover and Shizune''s uncle. He dreamed of becoming Hokage to protect the village but died during the Second Great Ninja War. His death, combined with her younger brother Nawaki''s death, caused Tsunade''s hemophobia (fear of blood) and her reluctance to return to Konoha.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific name of the forbidden jutsu Orochimaru uses to reanimate the dead?',
  'multiple_choice',
  'impossible',
  '[{"text":"Shinigami Summoning","isCorrect":false},{"text":"Cursed Resurrection Technique","isCorrect":false},{"text":"Edo Tensei (Reanimation Jutsu)","isCorrect":true},{"text":"Forbidden Soul Return","isCorrect":false}]'::jsonb,
  'The Edo Tensei (Summoning: Impure World Reincarnation) was originally created by the Second Hokage Tobirama Senju and later perfected by Orochimaru and Kabuto. It requires a living human sacrifice and the DNA of the deceased to reanimate them with near-unlimited chakra and regeneration.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name and tail count of Killer Bee''s tailed beast?',
  'multiple_choice',
  'impossible',
  '[{"text":"Saiken, the Six-Tails","isCorrect":false},{"text":"Chōmei, the Seven-Tails","isCorrect":false},{"text":"Gyūki, the Eight-Tails","isCorrect":true},{"text":"Kurama, the Nine-Tails","isCorrect":false}]'::jsonb,
  'Killer Bee is the jinchūriki of Gyūki, the Eight-Tails, also known as the Eight-Tailed Ox (Hachibi). Bee has a perfect relationship with Gyūki, making him one of the few perfect jinchūriki. Gyūki resembles a giant ox-octopus hybrid with eight tentacle tails.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the title of the first opening theme song for the original Naruto anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Haruka Kanata","isCorrect":false},{"text":"GO!!!","isCorrect":false},{"text":"R★O★C★K★S","isCorrect":true},{"text":"Kanashimi wo Yasashisa ni","isCorrect":false}]'::jsonb,
  '"R★O★C★K★S" (also written as "ROCKS") by Hound Dog is the first opening theme of the original Naruto anime, used for episodes 1-25. "Haruka Kanata" by Asian Kung-Fu Generation is the second opening, and "GO!!!" by FLOW is the fourth.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Naruto''s intelligence rating in the official Part 1 databook (out of 5)?',
  'multiple_choice',
  'impossible',
  '[{"text":"3 out of 5","isCorrect":false},{"text":"2 out of 5","isCorrect":false},{"text":"1.5 out of 5","isCorrect":true},{"text":"1 out of 5","isCorrect":false}]'::jsonb,
  'In the first official Naruto databook, Naruto''s intelligence is rated at 1.5 out of 5, one of his lowest stats. His highest stats are stamina (4) and his nine-tails chakra potential. His low intelligence rating reflects his poor academic performance and impulsive nature in Part 1.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific origin of Kabuto Yakushi? How did he end up at Konoha''s orphanage?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was found as a baby on the battlefield by Nonō, a nun who ran the orphanage, and raised there","isCorrect":true},{"text":"He was Orochimaru''s experiment who was placed in the orphanage as a sleeper agent","isCorrect":false},{"text":"He was the son of a rogue ninja who was killed, and the Third Hokage placed him in care","isCorrect":false},{"text":"He was born in the orphanage to one of the caretakers","isCorrect":false}]'::jsonb,
  'Kabuto was found as an injured child on a battlefield by Nonō Yakushi, the Mother Superior of the Konoha orphanage. She healed him and gave him the name Kabuto and her surname. He was later recruited by Danzō''s Root and sent on spy missions, eventually being manipulated into attacking Nonō, which drove him to Orochimaru.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'In which specific chapter of the manga does Naruto meet his mother Kushina Uzumaki inside his subconscious?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 497","isCorrect":true},{"text":"Chapter 440","isCorrect":false},{"text":"Chapter 520","isCorrect":false},{"text":"Chapter 465","isCorrect":false}]'::jsonb,
  'Naruto meets his mother Kushina Uzumaki in Chapter 497 of the manga, during his training to control the Nine-Tails'' chakra at the Falls of Truth on Turtle Island. Kushina tells him the story of her life, how she became the Nine-Tails'' jinchūriki, and the night of his birth.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'At what age did Kakashi Hatake graduate from the Ninja Academy?',
  'multiple_choice',
  'impossible',
  '[{"text":"7 years old","isCorrect":false},{"text":"5 years old","isCorrect":true},{"text":"6 years old","isCorrect":false},{"text":"8 years old","isCorrect":false}]'::jsonb,
  'Kakashi graduated from the Ninja Academy at the age of 5, making him one of the youngest graduates in Konoha''s history. He then became a Chūnin at age 6 and a Jōnin at 13. His prodigious talent was a source of pride for his father, the White Fang.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- ============================================================
-- One Piece — Impossible (30 questions)
-- ============================================================

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who is the Japanese voice actor (seiyuu) for Monkey D. Luffy?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kazuya Nakai","isCorrect":false},{"text":"Mayumi Tanaka","isCorrect":true},{"text":"Akemi Okamura","isCorrect":false},{"text":"Kappei Yamaguchi","isCorrect":false}]'::jsonb,
  'Mayumi Tanaka has voiced Luffy since the anime began in 1999. Kazuya Nakai voices Zoro, Akemi Okamura voices Nami, and Kappei Yamaguchi voices Usopp.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was Luffy''s bounty after the Whole Cake Island arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"500,000,000 berries","isCorrect":false},{"text":"1,500,000,000 berries","isCorrect":true},{"text":"1,000,000,000 berries","isCorrect":false},{"text":"3,000,000,000 berries","isCorrect":false}]'::jsonb,
  'After the Whole Cake Island arc, Luffy''s bounty was raised to 1,500,000,000 (1.5 billion) berries, earning him the unofficial title of "Fifth Emperor." This was due to his confrontation with Big Mom and the events published by Morgans in the World Economy News Paper.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the true name of Luffy''s Devil Fruit as revealed in the Wano arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"Gomu Gomu no Mi (Rubber-Rubber Fruit)","isCorrect":false},{"text":"Hito Hito no Mi, Model: Nika","isCorrect":true},{"text":"Mythical Zoan: Model Sun God","isCorrect":false},{"text":"Nika Nika no Mi","isCorrect":false}]'::jsonb,
  'Luffy''s Devil Fruit is actually the Hito Hito no Mi, Model: Nika (Human-Human Fruit, Model: Nika), a Mythical Zoan type. The World Government renamed it the "Gomu Gomu no Mi" to hide its true nature. When awakened, it grants Luffy the powers of the Sun God Nika with rubber-like abilities and reality-bending freedom.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was the name of Gol D. Roger''s ship?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Thousand Sunny","isCorrect":false},{"text":"The Moby Dick","isCorrect":false},{"text":"The Oro Jackson","isCorrect":true},{"text":"The Red Force","isCorrect":false}]'::jsonb,
  'Roger''s ship was the Oro Jackson, built by the legendary shipwright Tom using wood from the Treasure Tree Adam (the same wood later used for the Thousand Sunny''s hull). The Moby Dick is Whitebeard''s ship, and the Red Force belongs to Shanks.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Including Luffy, how many members are there in the Straw Hat Pirates crew?',
  'multiple_choice',
  'impossible',
  '[{"text":"9","isCorrect":false},{"text":"10","isCorrect":true},{"text":"11","isCorrect":false},{"text":"8","isCorrect":false}]'::jsonb,
  'There are 10 Straw Hat Pirates including Luffy: Luffy (Captain), Zoro (Swordsman), Nami (Navigator), Usopp (Sniper), Sanji (Cook), Chopper (Doctor), Robin (Archaeologist), Franky (Shipwright), Brook (Musician), and Jinbe (Helmsman, who officially joined during Wano).'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the sword Zoro inherited from his childhood rival Kuina?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sandai Kitetsu","isCorrect":false},{"text":"Shusui","isCorrect":false},{"text":"Wado Ichimonji","isCorrect":true},{"text":"Enma","isCorrect":false}]'::jsonb,
  'Wado Ichimonji is the white-hilted sword Zoro received after Kuina''s death, which he carries in his mouth when using Three Sword Style. It is one of the 21 Great Grade Swords. Shusui was Ryuma''s blade he obtained in Thriller Bark, and Enma was Oden''s sword given to him in Wano.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'The Void Century refers to a specific 100-year gap in recorded history. Approximately how many years ago did it occur?',
  'multiple_choice',
  'impossible',
  '[{"text":"400-500 years ago","isCorrect":false},{"text":"800-900 years ago","isCorrect":true},{"text":"1,000-1,100 years ago","isCorrect":false},{"text":"200-300 years ago","isCorrect":false}]'::jsonb,
  'The Void Century occurred approximately 800-900 years before the current timeline. It is a century of history that was erased by the World Government (the Twenty Kingdoms that formed it). Only the Poneglyphs, indestructible stone tablets, preserve the truth of what happened during this era.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the three Ancient Weapons mentioned in One Piece?',
  'multiple_choice',
  'impossible',
  '[{"text":"Pluton, Poseidon, and Uranus","isCorrect":true},{"text":"Pluton, Neptune, and Zeus","isCorrect":false},{"text":"Mars, Jupiter, and Saturn","isCorrect":false},{"text":"Hades, Poseidon, and Athena","isCorrect":false}]'::jsonb,
  'The three Ancient Weapons are Pluton (a massive warship built in Water 7), Poseidon (the ability to communicate with Sea Kings, currently embodied by Princess Shirahoshi), and Uranus (whose nature remains largely mysterious). Each has the power to destroy the world.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was Nico Robin''s bounty immediately after the Enies Lobby arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"79,000,000 berries","isCorrect":false},{"text":"80,000,000 berries","isCorrect":true},{"text":"100,000,000 berries","isCorrect":false},{"text":"130,000,000 berries","isCorrect":false}]'::jsonb,
  'After the Enies Lobby arc, Robin''s bounty was raised to 80,000,000 berries, up from her childhood bounty of 79,000,000. Her bounty was notably high even as a child because she could read Poneglyphs, making her a threat to the World Government.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'How many Shichibukai (Warlords of the Sea) were there at the start of the series?',
  'multiple_choice',
  'impossible',
  '[{"text":"5","isCorrect":false},{"text":"9","isCorrect":false},{"text":"7","isCorrect":true},{"text":"10","isCorrect":false}]'::jsonb,
  'There were 7 Shichibukai at the start of the series: Dracule Mihawk, Crocodile, Donquixote Doflamingo, Bartholomew Kuma, Gecko Moria, Boa Hancock, and Jinbe. The system was eventually abolished after the Reverie arc, with the Marines deploying the SSG (Special Science Group) as replacements.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the three main classifications of Devil Fruit types?',
  'multiple_choice',
  'impossible',
  '[{"text":"Paramecia, Zoan, and Logia","isCorrect":true},{"text":"Elemental, Physical, and Spiritual","isCorrect":false},{"text":"Natural, Artificial, and Mythical","isCorrect":false},{"text":"Common, Rare, and Legendary","isCorrect":false}]'::jsonb,
  'The three Devil Fruit types are: Paramecia (superhuman abilities like rubber or string), Zoan (animal transformations, including Ancient and Mythical subtypes), and Logia (elemental transformation and intangibility like fire, ice, or light). Logia are generally considered the rarest and most powerful.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was Sanji''s original character name that creator Oda had to change?',
  'multiple_choice',
  'impossible',
  '[{"text":"Naruto","isCorrect":true},{"text":"Ichigo","isCorrect":false},{"text":"Vinsmoke","isCorrect":false},{"text":"Sangoro","isCorrect":false}]'::jsonb,
  'Oda originally planned to name Sanji "Naruto" (meaning a type of fish cake with a spiral pattern, fitting his cook role). However, Masashi Kishimoto''s "Naruto" manga began serialization in Shōnen Jump around the same time, so Oda changed the name to Sanji to avoid confusion.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Brook''s Devil Fruit?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kage Kage no Mi","isCorrect":false},{"text":"Horo Horo no Mi","isCorrect":false},{"text":"Yomi Yomi no Mi","isCorrect":true},{"text":"Suke Suke no Mi","isCorrect":false}]'::jsonb,
  'Brook ate the Yomi Yomi no Mi (Revive-Revive Fruit), which allowed his soul to return to his body after death. Because his body had decomposed to a skeleton by the time his soul found it, he remains a living skeleton. The fruit also grants him soul-based powers like astral projection and ice attacks.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Which animation studio produces the One Piece anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Madhouse","isCorrect":false},{"text":"Toei Animation","isCorrect":true},{"text":"Studio Pierrot","isCorrect":false},{"text":"MAPPA","isCorrect":false}]'::jsonb,
  'Toei Animation has produced the One Piece anime since its premiere on October 20, 1999. It is one of the longest-running anime series in history with over 1,100 episodes. The anime was originally directed by Konosuke Uda, with Munehisa Sakai and others directing later arcs.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What specific type of Haki can only one in several million people use?',
  'multiple_choice',
  'impossible',
  '[{"text":"Armament Haki (Busoshoku)","isCorrect":false},{"text":"Observation Haki (Kenbunshoku)","isCorrect":false},{"text":"Conqueror''s Haki (Haoshoku)","isCorrect":true},{"text":"Voice of All Things","isCorrect":false}]'::jsonb,
  'Conqueror''s Haki (Haoshoku Haki) is possessed by only one in several million people. It allows the user to exert their willpower to overwhelm others, knocking out weak-willed opponents. Only a handful of characters have it: Luffy, Shanks, Whitebeard, Roger, Big Mom, Kaido, Zoro, and a few others.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is Trafalgar Law''s full name including his hidden middle initial?',
  'multiple_choice',
  'impossible',
  '[{"text":"Trafalgar D. Water Law","isCorrect":true},{"text":"Trafalgar D. Wano Law","isCorrect":false},{"text":"Trafalgar De Water Law","isCorrect":false},{"text":"Trafalgar Law D. Water","isCorrect":false}]'::jsonb,
  'Law''s full name is Trafalgar D. Water Law. The "D." is hidden in his name, as "Water" was the true name of his family (from the hidden "D" lineage). His family hid the "D." to avoid persecution by the World Government, who fear the "Will of D."'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'How many Road Poneglyphs exist, and what is their purpose?',
  'multiple_choice',
  'impossible',
  '[{"text":"4 — each reveals a coordinate, and together they pinpoint the location of Laugh Tale","isCorrect":true},{"text":"7 — one for each sea route on the Grand Line","isCorrect":false},{"text":"3 — they form a triangle pointing to the One Piece","isCorrect":false},{"text":"2 — one at the beginning and one at the end of the Grand Line","isCorrect":false}]'::jsonb,
  'There are exactly 4 Road Poneglyphs, each revealing a specific geographic coordinate. When all four coordinates are plotted together, they form an intersection point that reveals the location of Laugh Tale — the final island where the One Piece is located. Roger''s crew was the only known crew to find all four.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the recurring gag amount of Chopper''s bounty?',
  'multiple_choice',
  'impossible',
  '[{"text":"1,000 berries","isCorrect":false},{"text":"50 berries","isCorrect":false},{"text":"100 berries","isCorrect":true},{"text":"10 berries","isCorrect":false}]'::jsonb,
  'Chopper''s bounty is hilariously low at 100 berries because the Marines mistake him for the Straw Hats'' pet rather than a crew member. This has been a running gag throughout the series. Even after major arcs, his bounty remains absurdly low compared to his crewmates.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Portgas D. Ace''s mother?',
  'multiple_choice',
  'impossible',
  '[{"text":"Portgas D. Ann","isCorrect":false},{"text":"Portgas D. Rouge","isCorrect":true},{"text":"Monkey D. Dragon","isCorrect":false},{"text":"Gol D. Maria","isCorrect":false}]'::jsonb,
  'Ace''s mother was Portgas D. Rouge. She held Ace in her womb for 20 months through sheer willpower to protect him from the World Government, who were hunting for Roger''s child. She died shortly after giving birth due to the strain. Ace took her surname to honor her.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the specific name of Whitebeard''s Devil Fruit?',
  'multiple_choice',
  'impossible',
  '[{"text":"Magu Magu no Mi","isCorrect":false},{"text":"Gura Gura no Mi","isCorrect":true},{"text":"Yami Yami no Mi","isCorrect":false},{"text":"Mera Mera no Mi","isCorrect":false}]'::jsonb,
  'Whitebeard (Edward Newgate) possessed the Gura Gura no Mi (Tremor-Tremor Fruit), considered the strongest Paramecia-type Devil Fruit with the power to destroy the world. It creates devastating shockwaves and earthquakes. After his death, Blackbeard somehow stole this power. Magu Magu is Akainu''s Magma fruit, Yami Yami is Blackbeard''s Dark fruit.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the title of the first opening theme song for One Piece?',
  'multiple_choice',
  'impossible',
  '[{"text":"Bon Voyage!","isCorrect":false},{"text":"Hikari e","isCorrect":false},{"text":"We Are!","isCorrect":true},{"text":"Believe","isCorrect":false}]'::jsonb,
  '"We Are!" by Hiroshi Kitadani is the iconic first opening theme of One Piece. It has been used multiple times throughout the series for special episodes and milestones. "Believe" is the second opening, "Hikari e" is the third, and "Bon Voyage!" is the fourth.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who or what is Joy Boy, and what is his significance to the One Piece world?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was a figure from the Void Century who left a promise on the Poneglyph at Fish-Man Island and is connected to the treasure at Laugh Tale","isCorrect":true},{"text":"He is the name of Roger''s treasure at the end of the Grand Line","isCorrect":false},{"text":"He was the first King of the World Government","isCorrect":false},{"text":"He is a myth with no historical basis","isCorrect":false}]'::jsonb,
  'Joy Boy was a figure from the Void Century (800+ years ago) who left a message of apology on the Poneglyph at Fish-Man Island, promising to fulfill a covenant with the Fish-Men. He is connected to the treasure at Laugh Tale (which made Roger laugh) and to the Sun God Nika. Zunesha states that Luffy''s Gear 5 awakening is the "return of Joy Boy."'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the Revolutionary Army''s base of operations?',
  'multiple_choice',
  'impossible',
  '[{"text":"Marineford","isCorrect":false},{"text":"Baltigo","isCorrect":true},{"text":"Enies Lobby","isCorrect":false},{"text":"Kamabakka Kingdom","isCorrect":false}]'::jsonb,
  'Baltigo is the island that served as the Revolutionary Army''s headquarters for years. It was eventually discovered and destroyed by the Blackbeard Pirates and the Marines. Monkey D. Dragon is the leader of the Revolutionary Army and Luffy''s father.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was the name of Oda''s original one-shot manga that eventually became One Piece?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wanted!","isCorrect":false},{"text":"Romance Dawn","isCorrect":true},{"text":"Pirate King","isCorrect":false},{"text":"East Blue","isCorrect":false}]'::jsonb,
  'Eiichiro Oda created two one-shot versions of "Romance Dawn" (in 1996 and 1997) before One Piece was serialized. These featured an early version of Luffy with similar rubber powers. The name "Romance Dawn" was later used as the title of One Piece''s first chapter and first arc.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'In which chapter of the manga did the mysterious figure Imu first appear?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 906","isCorrect":true},{"text":"Chapter 800","isCorrect":false},{"text":"Chapter 957","isCorrect":false},{"text":"Chapter 1000","isCorrect":false}]'::jsonb,
  'Imu first appeared in Chapter 906, during the Reverie arc. Imu is shown sitting on the Empty Throne in Mary Geoise — a throne that all World Government kings swore no one would sit upon. Imu''s existence is one of the greatest secrets of the World Government.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'In which chapter does Luffy first use Gear 2 in the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 387","isCorrect":false},{"text":"Chapter 388","isCorrect":true},{"text":"Chapter 400","isCorrect":false},{"text":"Chapter 375","isCorrect":false}]'::jsonb,
  'Luffy first uses Gear 2 (Gear Second) in Chapter 388 of the manga during the Enies Lobby arc, specifically in his fight against Blueno of CP9. He pumps his blood faster using his rubber blood vessels, dramatically increasing his speed and power at the cost of stamina.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'In which episode of the anime does the Sea King bite off Shanks'' left arm to save young Luffy?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 1","isCorrect":false},{"text":"Episode 4","isCorrect":true},{"text":"Episode 10","isCorrect":false},{"text":"Episode 2","isCorrect":false}]'::jsonb,
  'The scene where Shanks sacrifices his left arm to save Luffy from the Lord of the Coast (a Sea King) occurs in Episode 4 of the anime. In the manga, this happens in Chapter 1. This pivotal moment inspired Luffy to become a pirate and eventually become King of the Pirates.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Extra impossible questions to bring each anime to exactly 30

-- Attack on Titan (+1)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What was the in-universe name of the operation to retake Wall Maria led by Erwin Smith?',
  'multiple_choice',
  'impossible',
  '[{"text":"Operation Reclaim","isCorrect":false},{"text":"The Return to Shiganshina Operation","isCorrect":true},{"text":"Operation Wall Maria","isCorrect":false},{"text":"The 58th Expedition Beyond the Walls","isCorrect":false}]'::jsonb,
  'The operation to retake Wall Maria was known as the Return to Shiganshina Operation. It took place in the year 850 and resulted in both a victory (sealing the wall) and enormous casualties, including Commander Erwin Smith''s death in the charge against the Beast Titan.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Death Note (+1)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'In the pilot chapter/one-shot of Death Note, what was different about the notebook''s design compared to the final series?',
  'multiple_choice',
  'impossible',
  '[{"text":"It was called the Death Eraser instead","isCorrect":false},{"text":"The pilot featured a \"Death Eraser\" that could undo the Death Note''s effect, which was removed from the final series","isCorrect":true},{"text":"The notebook was red instead of black","isCorrect":false},{"text":"There were two notebooks from the start","isCorrect":false}]'::jsonb,
  'In the original Death Note pilot one-shot by Ohba and Obata (published in 2003), there was a "Death Eraser" that could bring people back to life if used before they were cremated or fully decomposed. This concept was scrapped for the serialized manga to maintain higher dramatic stakes.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Demon Slayer (+3)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the creator/mangaka of Demon Slayer: Kimetsu no Yaiba?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hajime Isayama","isCorrect":false},{"text":"Gege Akutami","isCorrect":false},{"text":"Koyoharu Gotouge","isCorrect":true},{"text":"Eiichiro Oda","isCorrect":false}]'::jsonb,
  'Koyoharu Gotouge is the creator of Demon Slayer. They are notably private, using a crocodile wearing glasses as their author avatar. Demon Slayer was their first serialized work, beginning in Weekly Shōnen Jump in 2016 and becoming one of the best-selling manga of all time.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the exact name of Shinobu Kocho''s unique fighting style as the Insect Hashira?',
  'multiple_choice',
  'impossible',
  '[{"text":"She uses standard Insect Breathing sword strikes to cut demon necks","isCorrect":false},{"text":"She uses a modified katana with a thin stinger-like blade to inject wisteria-based poison into demons since she lacks the physical strength to behead them","isCorrect":true},{"text":"She summons poisonous insects to fight for her","isCorrect":false},{"text":"She coats her entire body in wisteria poison and fights bare-handed","isCorrect":false}]'::jsonb,
  'Shinobu is the only Hashira who cannot cut a demon''s head off due to her small stature and lack of raw strength. Instead, she uses a specially modified katana with a thin, needle-like tip to stab demons and inject lethal doses of wisteria-derived poison. She created this fighting method herself.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the swordsmith who forges Tanjiro''s Nichirin sword?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kozo Kanamori","isCorrect":false},{"text":"Hotaru Haganezuka","isCorrect":true},{"text":"Kotetsu","isCorrect":false},{"text":"Tecchikawahara Tekkotsuchi","isCorrect":false}]'::jsonb,
  'Hotaru Haganezuka is the swordsmith who forges Tanjiro''s Nichirin swords. He is extremely passionate about his craft and becomes furiously angry whenever Tanjiro breaks his swords. He wears a hyottoko mask and is known for his violent temper and single-minded dedication to sword-making.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Dragon Ball Z (+1)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the planet where Goku learned the Instant Transmission technique after the Frieza saga?',
  'multiple_choice',
  'impossible',
  '[{"text":"Planet Kanassa","isCorrect":false},{"text":"Planet Yardrat","isCorrect":true},{"text":"Planet Arlia","isCorrect":false},{"text":"New Planet Vegeta","isCorrect":false}]'::jsonb,
  'After Namek''s explosion, Goku landed on Planet Yardrat, where the native Yardratians taught him the Instant Transmission technique (Shunkan Idō). Despite their small and unassuming appearance, the Yardratians possess advanced techniques involving spirit control and teleportation.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Jujutsu Kaisen (+2)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the cursed tool that Toji Fushiguro uses to bypass cursed energy defenses?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Playful Cloud","isCorrect":false},{"text":"The Inverted Spear of Heaven","isCorrect":true},{"text":"The Black Rope","isCorrect":false},{"text":"Dragon-Bone","isCorrect":false}]'::jsonb,
  'The Inverted Spear of Heaven (Tengyoku) is a cursed tool that can nullify any cursed technique it touches. Toji used it to bypass Gojo''s Infinity during their fight in the Hidden Inventory arc. It is one of the most powerful anti-sorcery weapons in existence.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Panda''s true nature? He is not actually a panda bear.',
  'multiple_choice',
  'impossible',
  '[{"text":"He is a cursed spirit shaped like a panda","isCorrect":false},{"text":"He is an Abrupt Mutated Cursed Corpse created by Principal Yaga with three cores","isCorrect":true},{"text":"He is a transformed shikigami bound to Yaga","isCorrect":false},{"text":"He is a real panda that gained sentience from cursed energy exposure","isCorrect":false}]'::jsonb,
  'Panda is an Abrupt Mutated Cursed Corpse, a puppet created by Tokyo Jujutsu High''s principal Masamichi Yaga. Unlike normal cursed corpses, Panda has his own will and three cores: Panda (balanced), Gorilla (power), and a third triceratops-like core. Each core gives him different fighting abilities.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- My Hero Academia (+4)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the support course student who frequently builds gadgets for Deku?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mei Hatsume","isCorrect":true},{"text":"Ibara Shiozaki","isCorrect":false},{"text":"Momo Yaoyorozu","isCorrect":false},{"text":"Melissa Shield","isCorrect":false}]'::jsonb,
  'Mei Hatsume is a support course student at UA known for her eccentric personality and obsession with creating inventions she calls her "babies." She developed several support items for Deku, including his upgraded gloves and air force boots that help him fight without destroying his body.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the specific name of Todoroki Shoto''s ultimate move that combines both his fire and ice sides?',
  'multiple_choice',
  'impossible',
  '[{"text":"Flashfire Fist — Hell Spider","isCorrect":false},{"text":"Half-Cold Half-Hot Maximum","isCorrect":false},{"text":"Flashfreeze Heatwave","isCorrect":true},{"text":"Absolute Zero Flame","isCorrect":false}]'::jsonb,
  'Flashfreeze Heatwave is Todoroki''s technique that rapidly shifts between extreme cold and extreme heat. By cooling the air to its limit with his ice side and then instantly superheating it with his fire side, he creates a devastating shockwave. This represents his acceptance of both sides of his power.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Dabi''s true identity as revealed in the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is a clone of Endeavor created by Dr. Garaki","isCorrect":false},{"text":"He is Toya Todoroki, Endeavor''s eldest son who was presumed dead","isCorrect":true},{"text":"He is an escaped Nomu with fire powers","isCorrect":false},{"text":"He is Natsuo Todoroki with a disguise Quirk","isCorrect":false}]'::jsonb,
  'Dabi is Toya Todoroki, Endeavor''s eldest son who was believed to have died in a training accident. He survived with severe burn scars covering his body and spent years plotting revenge against Endeavor. He revealed his identity publicly during the Paranormal Liberation War to destroy Endeavor''s reputation.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Toga Himiko''s Quirk called, and what does it require to activate?',
  'multiple_choice',
  'impossible',
  '[{"text":"Transform — she must consume the target''s blood to take their appearance and, when awakened, their Quirk","isCorrect":true},{"text":"Mimic — she copies anyone she sees for up to one hour","isCorrect":false},{"text":"Shapeshift — she can become anyone at will with no requirements","isCorrect":false},{"text":"Blood Clone — she creates duplicates from blood samples","isCorrect":false}]'::jsonb,
  'Toga''s Quirk is called Transform. She must ingest a target''s blood to take on their physical appearance. The duration depends on how much blood she consumes. After her Quirk awakened during the Meta Liberation Army arc, she gained the ability to also copy the Quirks of people she transforms into.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- Naruto (+2)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of Naruto''s signature technique that combines a Rasengan with his Wind chakra nature?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wind Style: Rasengan","isCorrect":false},{"text":"Rasenshuriken","isCorrect":true},{"text":"Rasen-Tarengan","isCorrect":false},{"text":"Oodama Rasengan","isCorrect":false}]'::jsonb,
  'The Rasenshuriken (Wind Release: Rasenshuriken) combines the Rasengan with Wind chakra nature, creating microscopic wind blades that sever chakra pathways at the cellular level. Tsunade initially forbade its use because it also damaged Naruto''s arm. He later learned to throw it using Sage Mode, solving the self-damage problem.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the location where Naruto trained to control the Nine-Tails'' chakra?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mount Myōboku","isCorrect":false},{"text":"The Falls of Truth on the Island Turtle","isCorrect":true},{"text":"The Forest of Death","isCorrect":false},{"text":"The Valley of the End","isCorrect":false}]'::jsonb,
  'Naruto trained to control Kurama''s chakra at the Falls of Truth, located on a giant moving island turtle (Genbu). Killer Bee guided him through the process. At the Falls of Truth, Naruto first had to confront and accept his inner darkness (Dark Naruto) before he could challenge the Nine-Tails for its chakra.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

-- One Piece (+3)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the island where the Straw Hat Pirates'' ship Thousand Sunny was built?',
  'multiple_choice',
  'impossible',
  '[{"text":"Enies Lobby","isCorrect":false},{"text":"Water 7","isCorrect":true},{"text":"Sabaody Archipelago","isCorrect":false},{"text":"Thriller Bark","isCorrect":false}]'::jsonb,
  'The Thousand Sunny was built at Water 7 by Franky (with help from the Galley-La Company shipwrights) using wood from the Treasure Tree Adam. It replaced the Going Merry, which was given a Viking funeral after the Enies Lobby arc. Water 7 is the world''s premier shipbuilding island.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Franky''s signature attack that he charges using cola?',
  'multiple_choice',
  'impossible',
  '[{"text":"Franky Fireball","isCorrect":false},{"text":"Radical Beam","isCorrect":false},{"text":"Coup de Burst","isCorrect":false},{"text":"Coup de Vent","isCorrect":true}]'::jsonb,
  'Coup de Vent is Franky''s powerful air cannon attack fired from his arms, powered by cola stored in his body. Coup de Burst is the Thousand Sunny''s cannon system that launches the ship through the air. After his timeskip upgrades, Franky gained the Radical Beam (a laser like Kizaru''s).'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Zoro''s strongest Three Sword Style technique before the timeskip?',
  'multiple_choice',
  'impossible',
  '[{"text":"Oni Giri","isCorrect":false},{"text":"Sanzen Sekai (Three Thousand Worlds)","isCorrect":true},{"text":"Tatsumaki","isCorrect":false},{"text":"Shishi Sonson","isCorrect":false}]'::jsonb,
  'Sanzen Sekai (Three Thousand Worlds) is Zoro''s strongest pre-timeskip Three Sword Style technique, where he spins his two hand swords in a helicopter-like motion while charging. He first uses it against Mihawk at the Baratie. Oni Giri is his basic three-sword attack, and Shishi Sonson is a one-sword technique.'
)
ON CONFLICT (anime_id, question_text) DO NOTHING;

