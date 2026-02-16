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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is the Japanese voice actor (seiyuu) for Levi Ackerman?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yūki Kaji","isCorrect":false},{"text":"Hiroshi Kamiya","isCorrect":true},{"text":"Daisuke Ono","isCorrect":false},{"text":"Takehito Koyasu","isCorrect":false}]'::jsonb,
  'Hiroshi Kamiya voices Levi Ackerman. Yūki Kaji voices Eren, Daisuke Ono voices Erwin, and Takehito Koyasu voices Zeke.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'During which numbered expedition does Commander Erwin Smith lose his right arm?',
  'multiple_choice',
  'impossible',
  '[{"text":"The 56th Expedition","isCorrect":false},{"text":"The 58th Expedition","isCorrect":false},{"text":"The 55th Expedition","isCorrect":false},{"text":"The 57th Expedition","isCorrect":true}]'::jsonb,
  'Erwin loses his right arm during the 57th Expedition Outside the Walls, which was the operation to capture the Female Titan. A Titan bit off his arm as he led a charge.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the official name of the scouting formation Erwin devised for expeditions outside the walls?',
  'multiple_choice',
  'impossible',
  '[{"text":"Long-Distance Enemy Scouting Formation","isCorrect":true},{"text":"Diamond Defensive Formation","isCorrect":false},{"text":"Wide-Range Titan Detection Array","isCorrect":false},{"text":"Expedition Relay Communication Formation","isCorrect":false}]'::jsonb,
  'The Long-Distance Enemy Scouting Formation uses smoke signals and spread-out ranks to detect and avoid Titans, minimizing casualties during expeditions beyond the walls.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What was Kenny Ackerman''s notorious title within the Interior Police?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kenny the Blade","isCorrect":false},{"text":"Kenny the Slasher","isCorrect":false},{"text":"Kenny the Ripper","isCorrect":true},{"text":"Kenny the Shadow","isCorrect":false}]'::jsonb,
  'Kenny Ackerman was known as "Kenny the Ripper" for his notorious killing spree in the capital. He murdered over 100 members of the Military Police before being recruited by Uri Reiss.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the exact height of the Colossal Titan in meters?',
  'multiple_choice',
  'impossible',
  '[{"text":"50 meters","isCorrect":false},{"text":"60 meters","isCorrect":true},{"text":"45 meters","isCorrect":false},{"text":"55 meters","isCorrect":false}]'::jsonb,
  'The Colossal Titan stands at approximately 60 meters tall, making it the tallest of the Nine Titans. The walls themselves are 50 meters tall, and the Colossal Titan''s head peeks over them.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the title of the OVA episode that focuses on Levi''s backstory in the Underground City?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wings of Freedom","isCorrect":false},{"text":"No Regrets","isCorrect":true},{"text":"Wall Sina, Goodbye","isCorrect":false},{"text":"Lost Girls","isCorrect":false}]'::jsonb,
  'The OVA "No Regrets" (Kuinaki Sentaku) is a two-part story that adapts the manga spin-off about Levi''s life as a thug in the Underground City and how Erwin recruited him into the Survey Corps.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which of the Nine Titans possesses the unique ability of skin hardening as its primary specialization?',
  'multiple_choice',
  'impossible',
  '[{"text":"The War Hammer Titan","isCorrect":false},{"text":"The Armored Titan","isCorrect":true},{"text":"The Female Titan","isCorrect":false},{"text":"The Attack Titan","isCorrect":false}]'::jsonb,
  'The Armored Titan, held by Reiner Braun, specializes in hardening — its entire body is covered in hardened Titan skin like armor plating. While other Titans can use hardening to a degree, it is the Armored Titan''s defining trait.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'In which year (in-universe) did Wall Maria fall to the Titans?',
  'multiple_choice',
  'impossible',
  '[{"text":"Year 850","isCorrect":false},{"text":"Year 844","isCorrect":false},{"text":"Year 845","isCorrect":true},{"text":"Year 847","isCorrect":false}]'::jsonb,
  'Wall Maria fell in the year 845 when the Colossal Titan and Armored Titan breached the Shiganshina District gate. The main story of the series picks up five years later in 850.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the full name of Grisha Yeager''s first wife from Marley?',
  'multiple_choice',
  'impossible',
  '[{"text":"Faye Yeager","isCorrect":false},{"text":"Dina Fritz","isCorrect":true},{"text":"Alma Reiss","isCorrect":false},{"text":"Karina Braun","isCorrect":false}]'::jsonb,
  'Dina Fritz was Grisha''s first wife and a descendant of the royal Fritz family living in Marley. She was turned into a Pure Titan and later became the Smiling Titan that ate Eren''s mother Carla.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'How many years can a Titan shifter live after inheriting their power, according to the Curse of Ymir?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 years","isCorrect":false},{"text":"15 years","isCorrect":false},{"text":"9 years","isCorrect":false},{"text":"13 years","isCorrect":true}]'::jsonb,
  'The Curse of Ymir limits all Titan shifters to 13 years of life after inheriting their power, mirroring the 13 years that the original Ymir Fritz lived after gaining the Power of the Titans.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the Japanese name for the Survey Corps?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chōsa Heidan","isCorrect":true},{"text":"Kenpei Heidan","isCorrect":false},{"text":"Chūō Heidan","isCorrect":false},{"text":"Shubiheitai","isCorrect":false}]'::jsonb,
  'The Survey Corps is called Chōsa Heidan (調査兵団) in Japanese. Chōsa means "investigation/survey" and Heidan means "military corps/regiment."'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who directed Seasons 1 through 3 of the Attack on Titan anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Masashi Koizuka","isCorrect":false},{"text":"Tetsurō Araki","isCorrect":true},{"text":"Jun Shishido","isCorrect":false},{"text":"Yuichiro Hayashi","isCorrect":false}]'::jsonb,
  'Tetsurō Araki directed the anime from Season 1 through Season 3 at WIT Studio. Yuichiro Hayashi took over as director for The Final Season at MAPPA.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which animation studio produced Attack on Titan: The Final Season?',
  'multiple_choice',
  'impossible',
  '[{"text":"WIT Studio","isCorrect":false},{"text":"Bones","isCorrect":false},{"text":"MAPPA","isCorrect":true},{"text":"Ufotable","isCorrect":false}]'::jsonb,
  'MAPPA took over production of Attack on Titan starting with The Final Season (Season 4). WIT Studio animated Seasons 1-3 but did not continue with the series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What unique ability does the Attack Titan possess that no other Titan has?',
  'multiple_choice',
  'impossible',
  '[{"text":"The ability to regenerate faster than all other Titans","isCorrect":false},{"text":"The ability to copy other Titan powers temporarily","isCorrect":false},{"text":"The ability to receive memories from future inheritors","isCorrect":true},{"text":"The ability to harden without the need for a serum","isCorrect":false}]'::jsonb,
  'The Attack Titan can receive memories from its future inheritors, effectively seeing the future. This ability is what allowed Eren to manipulate events across time and is central to the plot of the final arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What are the names of the two Titans that Hange Zoë captured for research?',
  'multiple_choice',
  'impossible',
  '[{"text":"Albert and Bean","isCorrect":false},{"text":"Sawney and Bean","isCorrect":true},{"text":"Sunny and Beane","isCorrect":false},{"text":"Sawyer and Bane","isCorrect":false}]'::jsonb,
  'Hange captured two Titans and named them Sawney and Bean, after the legendary Scottish cannibal Sawney Bean. They were killed by Annie Leonhart in her attempt to sabotage the Survey Corps'' research.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which numbered Training Corps did Eren, Mikasa, and Armin graduate from?',
  'multiple_choice',
  'impossible',
  '[{"text":"The 103rd Training Corps","isCorrect":false},{"text":"The 105th Training Corps","isCorrect":false},{"text":"The 104th Training Corps","isCorrect":true},{"text":"The 106th Training Corps","isCorrect":false}]'::jsonb,
  'Eren, Mikasa, Armin, and their classmates were all members of the 104th Training Corps (sometimes called the 104th Cadet Corps). This is also the class that included Reiner, Bertholdt, Annie, Jean, Sasha, and Connie.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'In which manga magazine was Attack on Titan originally serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Weekly Shōnen Jump","isCorrect":false},{"text":"Bessatsu Shōnen Magazine","isCorrect":true},{"text":"Monthly Shōnen Gangan","isCorrect":false},{"text":"Weekly Shōnen Magazine","isCorrect":false}]'::jsonb,
  'Attack on Titan was serialized in Bessatsu Shōnen Magazine (a monthly publication by Kodansha) from September 2009 to April 2021. Creator Hajime Isayama was famously rejected by Weekly Shōnen Jump.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is Falco Grice''s full first and last name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Falco Braun","isCorrect":false},{"text":"Falco Galliard","isCorrect":false},{"text":"Falco Grice","isCorrect":true},{"text":"Falco Kruger","isCorrect":false}]'::jsonb,
  'Falco Grice is his full name. His older brother is Colt Grice. He is a Warrior Candidate from Marley who eventually inherits the Jaw Titan from Porco Galliard.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What was Zeke Yeager''s secret plan when he conspired with Eren to use the Founding Titan?',
  'multiple_choice',
  'impossible',
  '[{"text":"To use the Rumbling to destroy the entire world outside Paradis","isCorrect":false},{"text":"To euthanize all Eldians by making them unable to reproduce","isCorrect":true},{"text":"To remove Titan powers from all Eldians permanently","isCorrect":false},{"text":"To rewrite Eldian memories to forget the history of Titans","isCorrect":false}]'::jsonb,
  'Zeke''s secret plan was the Euthanasia Plan: using the Founding Titan to alter the biology of all Subjects of Ymir so they could no longer reproduce, causing the Eldian race to peacefully die out within a generation. Eren pretended to agree but had his own plan.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What specific ability did King Karl Fritz use on the Eldians inside the walls?',
  'multiple_choice',
  'impossible',
  '[{"text":"He removed their ability to transform into Titans","isCorrect":false},{"text":"He implanted false memories of a peaceful history","isCorrect":false},{"text":"He erased their memories of the world outside the walls","isCorrect":true},{"text":"He altered their bloodline to prevent royal succession","isCorrect":false}]'::jsonb,
  'Karl Fritz used the Founding Titan''s power to erase the memories of all Subjects of Ymir within the walls, making them forget the outside world, the existence of Marley, and the true history of the Eldian Empire.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What specific condition must be met for the Founding Titan to use its full power?',
  'multiple_choice',
  'impossible',
  '[{"text":"The user must be within the Coordinate dimension","isCorrect":false},{"text":"The user must possess all Nine Titan powers simultaneously","isCorrect":false},{"text":"The user must make physical contact with a Titan of royal blood","isCorrect":true},{"text":"The user must consume a serum derived from spinal fluid","isCorrect":false}]'::jsonb,
  'A non-royal Founding Titan holder must make physical contact with a Titan who has royal blood to access the Founding Titan''s full power. This is why Eren needed Zeke (who has royal blood through Dina Fritz) and why touching Dina''s Titan temporarily activated his power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the title of the first opening theme song for Attack on Titan Season 1?',
  'multiple_choice',
  'impossible',
  '[{"text":"Shinzou wo Sasageyo!","isCorrect":false},{"text":"Jiyuu no Tsubasa","isCorrect":false},{"text":"Guren no Yumiya","isCorrect":true},{"text":"Red Swan","isCorrect":false}]'::jsonb,
  'The first opening song is "Guren no Yumiya" (Crimson Bow and Arrow) by Linked Horizon. "Shinzou wo Sasageyo!" is the Season 2 opening, "Jiyuu no Tsubasa" is the second Season 1 opening, and "Red Swan" is from Season 3.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Approximately how tall was Rod Reiss''s abnormal Titan form compared to the walls?',
  'multiple_choice',
  'impossible',
  '[{"text":"About 80 meters, taller than Wall Maria","isCorrect":false},{"text":"About 120 meters, more than twice the wall height","isCorrect":true},{"text":"About 60 meters, the same as the Colossal Titan","isCorrect":false},{"text":"About 200 meters, the tallest Titan ever recorded","isCorrect":false}]'::jsonb,
  'Rod Reiss''s abnormal Titan was approximately 120 meters tall, over twice the height of the 50-meter walls and twice the size of the Colossal Titan. It was the largest Titan ever seen, though it could only crawl due to its deformed body.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who designed and created the anti-personnel vertical maneuvering equipment used by Kenny''s squad?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hange Zoë","isCorrect":false},{"text":"Angel Aaltonen","isCorrect":true},{"text":"Moblit Berner","isCorrect":false},{"text":"Dimo Reeves","isCorrect":false}]'::jsonb,
  'Angel Aaltonen is credited as the inventor and developer of the anti-personnel ODM gear. This modified version replaced the sword blades with firearms, specifically designed for combat against humans rather than Titans.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which district of Wall Maria was breached in the initial Titan attack?',
  'multiple_choice',
  'impossible',
  '[{"text":"Trost District","isCorrect":false},{"text":"Karanes District","isCorrect":false},{"text":"Shiganshina District","isCorrect":true},{"text":"Stohess District","isCorrect":false}]'::jsonb,
  'Shiganshina District, on the southern edge of Wall Maria, was the first district breached by the Colossal and Armored Titans in 845. Trost is a district of Wall Rose, and Stohess is a district of Wall Sheena.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'How many distinct Titan shifter powers (the Nine Titans) exist in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"Seven","isCorrect":false},{"text":"Eight","isCorrect":false},{"text":"Nine","isCorrect":true},{"text":"Thirteen","isCorrect":false}]'::jsonb,
  'There are exactly Nine Titans: the Founding Titan, Attack Titan, Colossal Titan, Armored Titan, Female Titan, Beast Titan, Jaw Titan, Cart Titan, and War Hammer Titan. They originate from Ymir Fritz''s power splitting among her descendants.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which Titan shifter has the specific ability to call and control Pure Titans using a scream, but only due to royal blood?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Founding Titan only","isCorrect":false},{"text":"The Female Titan","isCorrect":false},{"text":"Any Beast Titan holder","isCorrect":false},{"text":"Zeke Yeager''s Beast Titan, due to his royal blood","isCorrect":true}]'::jsonb,
  'While the Beast Titan does not inherently control Pure Titans, Zeke Yeager''s royal blood (through his mother Dina Fritz) gives his Beast Titan the ability to create and command Pure Titans through his spinal fluid and scream. This is unique to Zeke, not the Beast Titan itself.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the Marleyan military commander who leads the initial assault on Liberio during the raid?',
  'multiple_choice',
  'impossible',
  '[{"text":"General Calvi","isCorrect":false},{"text":"Sergeant Major Gross","isCorrect":false},{"text":"Commander Magath","isCorrect":true},{"text":"Officer Koslow","isCorrect":false}]'::jsonb,
  'Commander Theo Magath is the Marleyan military officer who oversees the Warrior program and commands Marley''s forces. He later becomes a key figure in the alliance against Eren during the Rumbling arc.'
);

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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is L''s real full name as revealed in supplementary materials?',
  'multiple_choice',
  'impossible',
  '[{"text":"L Lawliet","isCorrect":true},{"text":"L Lind Taylor","isCorrect":false},{"text":"L Liam Riviere","isCorrect":false},{"text":"L Lucian Wammy","isCorrect":false}]'::jsonb,
  'L''s real name is L Lawliet (pronounced "Law-light"), as confirmed in the Death Note 13: How to Read companion book. His first name is literally the letter L.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Who is the Japanese voice actor (seiyuu) for Light Yagami?',
  'multiple_choice',
  'impossible',
  '[{"text":"Jun Fukuyama","isCorrect":false},{"text":"Mamoru Miyano","isCorrect":true},{"text":"Kappei Yamaguchi","isCorrect":false},{"text":"Takahiro Sakurai","isCorrect":false}]'::jsonb,
  'Mamoru Miyano voices Light Yagami. He is also well known for voicing Rintaro Okabe in Steins;Gate and Tamaki Suoh in Ouran High School Host Club.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of Misa Amane''s Shinigami who follows her?',
  'multiple_choice',
  'impossible',
  '[{"text":"Ryuk","isCorrect":false},{"text":"Sidoh","isCorrect":false},{"text":"Rem","isCorrect":true},{"text":"Gelus","isCorrect":false}]'::jsonb,
  'Rem is the Shinigami who accompanies Misa Amane. Rem inherited the Death Note from Gelus, who died saving Misa''s life out of love. Rem develops similar protective feelings for Misa, which Light exploits.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the fake rule that Light had Ryuk write into the Death Note to protect himself?',
  'multiple_choice',
  'impossible',
  '[{"text":"A Death Note becomes inactive if not used for 30 days","isCorrect":false},{"text":"If the owner does not write a name within 13 days, they will die","isCorrect":true},{"text":"A Death Note can only be destroyed by fire from the Shinigami Realm","isCorrect":false},{"text":"The owner cannot kill someone whose name they learned through the Shinigami Eyes","isCorrect":false}]'::jsonb,
  'The fake "13-day rule" states that if the owner of a Death Note does not write a name within 13 days of their last entry, they will die. Light had this rule added to prevent the investigation team from testing the notebook by having him and Misa stop using it.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Which member of the Kira Investigation Task Force is killed during the raid on the Sakura TV station?',
  'multiple_choice',
  'impossible',
  '[{"text":"Aizawa","isCorrect":false},{"text":"Mogi","isCorrect":false},{"text":"Matsuda","isCorrect":false},{"text":"Ukita","isCorrect":true}]'::jsonb,
  'Kanzo Ukita rushed to the Sakura TV station to stop the Kira broadcast tapes and was killed by the Second Kira (Misa Amane), who was waiting outside with Shinigami Eyes and a Death Note.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What signature habit does Near display during his investigation sessions?',
  'multiple_choice',
  'impossible',
  '[{"text":"Eating sweets constantly","isCorrect":false},{"text":"Stacking and playing with toys, dice, and finger puppets","isCorrect":true},{"text":"Biting his thumbnail while thinking","isCorrect":false},{"text":"Drawing diagrams on the floor","isCorrect":false}]'::jsonb,
  'Near habitually plays with toys, stacks dice, builds card towers, and uses finger puppets during his investigations. This is his thinking method and a character trait that contrasts with L''s sweet-eating habits.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the Shinigami who originally owned the Death Note before Ryuk dropped it in the human world?',
  'multiple_choice',
  'impossible',
  '[{"text":"Gelus","isCorrect":false},{"text":"Ryuk always owned it — he stole a second notebook","isCorrect":true},{"text":"Sidoh","isCorrect":false},{"text":"Nu","isCorrect":false}]'::jsonb,
  'Ryuk actually stole the second Death Note from Sidoh, another Shinigami who was too lazy to retrieve it. Ryuk tricked the Shinigami King into giving him a second notebook, but it was actually Sidoh''s stolen one that he dropped to Earth.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What fraction of their remaining lifespan does a person give up when making the Shinigami Eye deal?',
  'multiple_choice',
  'impossible',
  '[{"text":"One third","isCorrect":false},{"text":"One quarter","isCorrect":false},{"text":"Half","isCorrect":true},{"text":"Two thirds","isCorrect":false}]'::jsonb,
  'The Shinigami Eye deal costs exactly half of the user''s remaining lifespan. In exchange, they gain the ability to see any human''s real name and remaining lifespan by looking at their face. Both Misa and Mikami made this deal.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the title of the first opening theme song for the Death Note anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Alumina","isCorrect":false},{"text":"What''s up, people?!","isCorrect":false},{"text":"the WORLD","isCorrect":true},{"text":"Zetsubou Billy","isCorrect":false}]'::jsonb,
  '"the WORLD" by Nightmare is the first opening song of Death Note, used for episodes 1-19. The second opening is "What''s up, people?!" by Maximum the Hormone. "Alumina" and "Zetsubou Billy" are ending themes.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Matt''s real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mihael Keehl","isCorrect":false},{"text":"Nate River","isCorrect":false},{"text":"Mail Jeevas","isCorrect":true},{"text":"Quilsh Wammy","isCorrect":false}]'::jsonb,
  'Matt''s real name is Mail Jeevas. He is the third-ranked successor at Wammy''s House and Mello''s closest friend and accomplice. Despite his limited screen time, he is a fan-favorite character.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How many FBI agents does Light Yagami kill to remove the surveillance on him?',
  'multiple_choice',
  'impossible',
  '[{"text":"8","isCorrect":false},{"text":"12","isCorrect":true},{"text":"16","isCorrect":false},{"text":"6","isCorrect":false}]'::jsonb,
  'Light killed all 12 FBI agents who were sent to Japan to investigate the Kira case. He manipulated agent Raye Penber into revealing all their names on a bus hijacking, then used the Death Note to kill all of them simultaneously.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What was Naomi Misora''s specific connection to L before the Kira case?',
  'multiple_choice',
  'impossible',
  '[{"text":"She was L''s personal bodyguard","isCorrect":false},{"text":"She was an FBI agent who worked with L on the Los Angeles BB Murder Cases","isCorrect":true},{"text":"She was a childhood friend from Wammy''s House","isCorrect":false},{"text":"She was a former Interpol liaison to L","isCorrect":false}]'::jsonb,
  'Naomi Misora was an FBI agent who previously collaborated with L on the Los Angeles BB (Beyond Birthday) Murder Cases, as detailed in the novel "Death Note: Another Note." Her investigative skills impressed L greatly.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Which member of the Yotsuba Group is chosen to temporarily wield the Death Note during the Yotsuba arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"Reiji Namikawa","isCorrect":false},{"text":"Shingo Mido","isCorrect":false},{"text":"Kyosuke Higuchi","isCorrect":true},{"text":"Takeshi Ooi","isCorrect":false}]'::jsonb,
  'Kyosuke Higuchi of the Yotsuba Group was the one who received the Death Note and acted as the third Kira. He used it for corporate murders to benefit Yotsuba. His capture by the task force was orchestrated by Light to regain the notebook.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Which animation studio produced the Death Note anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Bones","isCorrect":false},{"text":"Madhouse","isCorrect":true},{"text":"Sunrise","isCorrect":false},{"text":"Production I.G","isCorrect":false}]'::jsonb,
  'Madhouse produced the Death Note anime, which aired from October 2006 to June 2007 for 37 episodes. Madhouse is also known for producing Hunter x Hunter (2011), One Punch Man Season 1, and Parasyte.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Who directed the Death Note anime series?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tetsurou Araki","isCorrect":true},{"text":"Mamoru Hosoda","isCorrect":false},{"text":"Satoshi Kon","isCorrect":false},{"text":"Takeshi Obata","isCorrect":false}]'::jsonb,
  'Tetsurō Araki directed the Death Note anime at Madhouse. He later went on to direct Attack on Titan at WIT Studio. Takeshi Obata is the manga artist, not the anime director.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Watari''s real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Roger Ruvie","isCorrect":false},{"text":"Quillsh Wammy","isCorrect":true},{"text":"Backyard Bottomslash","isCorrect":false},{"text":"Watari Yagami","isCorrect":false}]'::jsonb,
  'Watari''s real name is Quillsh Wammy. He is L''s handler, the founder of Wammy''s House orphanage for gifted children, and a wealthy inventor who funds L''s detective operations.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'In which country was L raised at Wammy''s House orphanage?',
  'multiple_choice',
  'impossible',
  '[{"text":"France","isCorrect":false},{"text":"Japan","isCorrect":false},{"text":"United States","isCorrect":false},{"text":"England","isCorrect":true}]'::jsonb,
  'Wammy''s House is located in Winchester, England. It is an orphanage for extraordinarily gifted children, founded by Quillsh Wammy (Watari), where L, Near, Mello, and Matt were all raised.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What does the Shinigami Rem do to save Misa from being caught by L?',
  'multiple_choice',
  'impossible',
  '[{"text":"Rem threatens to kill L directly using her Shinigami powers","isCorrect":false},{"text":"Rem writes L''s and Watari''s names in her Death Note, killing herself in the process","isCorrect":true},{"text":"Rem erases Misa''s memories of the Death Note","isCorrect":false},{"text":"Rem hides the Death Note in the Shinigami Realm","isCorrect":false}]'::jsonb,
  'Rem writes both Watari''s and L''s real names in her Death Note to protect Misa from L''s investigation. Because a Shinigami who extends a human''s life by killing for them will die, Rem turns to dust. Light manipulated this outcome as part of his plan to eliminate L.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Teru Mikami''s repeated catchphrase when judging criminals?',
  'multiple_choice',
  'impossible',
  '[{"text":"Justice!","isCorrect":false},{"text":"Kira is God!","isCorrect":false},{"text":"Delete!","isCorrect":true},{"text":"Cleanse!","isCorrect":false}]'::jsonb,
  'Mikami''s signature catchphrase is "Sakujo!" which translates to "Delete!" He repeats it obsessively while writing names in the Death Note, reflecting his zealous devotion to Kira''s cause and his belief in absolute justice.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the King of the Shinigami Realm?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Great Shinigami","isCorrect":false},{"text":"The Shinigami King","isCorrect":true},{"text":"Yama","isCorrect":false},{"text":"The Death Lord","isCorrect":false}]'::jsonb,
  'The ruler of the Shinigami Realm is simply known as the Shinigami King (or King of Death). He is mentioned but never fully shown in the main series. He is the one who makes the rules governing Death Notes and the Shinigami Eye deals.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How does Light Yagami''s death differ between the manga and the anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"In the manga Light escapes; in the anime Ryuk kills him","isCorrect":false},{"text":"In both versions Ryuk writes Light''s name in his Death Note","isCorrect":false},{"text":"In the manga Light dies in a warehouse after being shot; in the anime he dies on a staircase after fleeing","isCorrect":true},{"text":"In the manga Near shoots Light; in the anime Matsuda does","isCorrect":false}]'::jsonb,
  'In the manga, after being exposed, Matsuda shoots Light and he bleeds out in the warehouse while begging Ryuk for help, and Ryuk writes his name. In the anime, Light flees and runs through the city, eventually collapsing on a staircase where he sees a vision of his younger self before Ryuk writes his name.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the Shinigami who sacrificed himself to save Misa Amane''s life before the events of the main story?',
  'multiple_choice',
  'impossible',
  '[{"text":"Rem","isCorrect":false},{"text":"Sidoh","isCorrect":false},{"text":"Armonia Justin Beyondormason","isCorrect":false},{"text":"Gelus","isCorrect":true}]'::jsonb,
  'Gelus was a Shinigami who fell in love with Misa Amane while watching her from the Shinigami Realm. When a stalker was about to kill her, Gelus wrote the stalker''s name in his Death Note to save her, which is forbidden for Shinigami. He crumbled to dust, and his notebook was passed to Rem.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How many days after finding the Death Note does L make his first televised broadcast challenging Kira?',
  'multiple_choice',
  'impossible',
  '[{"text":"3 days","isCorrect":false},{"text":"5 days","isCorrect":true},{"text":"7 days","isCorrect":false},{"text":"10 days","isCorrect":false}]'::jsonb,
  'L makes his first broadcast (using Lind L. Tailor as a decoy) approximately 5 days after Light first uses the Death Note. This broadcast was specifically targeted at the Kanto region of Japan, which allowed L to narrow down Kira''s location.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What specific piece of the Death Note did Light hide on his person as a backup?',
  'multiple_choice',
  'impossible',
  '[{"text":"A full page hidden in his wallet","isCorrect":false},{"text":"A small piece hidden inside his watch","isCorrect":true},{"text":"A torn corner tucked into his belt buckle","isCorrect":false},{"text":"A folded piece sewn into his jacket lining","isCorrect":false}]'::jsonb,
  'Light hid a small piece of the Death Note inside a secret compartment in his wristwatch. The watch had a mechanism where a tiny piece of paper could be accessed by pulling the crown pin and inserting a pin from the other side. He used this as a last resort backup.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What hotel does L use as his first headquarters when investigating the Kira case in Japan?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Imperial Hotel Tokyo","isCorrect":false},{"text":"The Ritz Kanto","isCorrect":false},{"text":"A suite in a luxury hotel in the Kanto region (unnamed in early episodes)","isCorrect":false},{"text":"The Teito Hotel","isCorrect":true}]'::jsonb,
  'L initially operates from the Teito Hotel before the task force establishes its dedicated headquarters. L uses hotel rooms as temporary bases, frequently changing locations for security purposes.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What was L doing when he famously demonstrated his physical abilities against Light in a one-on-one encounter at the university?',
  'multiple_choice',
  'impossible',
  '[{"text":"Playing chess","isCorrect":false},{"text":"Arm wrestling","isCorrect":false},{"text":"Playing tennis","isCorrect":true},{"text":"Running a race","isCorrect":false}]'::jsonb,
  'L and Light played a tennis match at To-Oh University, where both showed their competitive nature and physical prowess. L revealed he was once the British junior tennis champion, and the match served as an intellectual and physical battle between the two.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'According to the Death Note rules, what happens if the cause of death is not specified within 40 seconds of writing a name?',
  'multiple_choice',
  'impossible',
  '[{"text":"The person dies of a heart attack","isCorrect":true},{"text":"The death is cancelled and the name becomes void","isCorrect":false},{"text":"The person dies within 23 days of natural causes","isCorrect":false},{"text":"The Death Note''s owner loses a year of their lifespan","isCorrect":false}]'::jsonb,
  'If the cause of death is not specified within 40 seconds, the victim will simply die of a heart attack. This is the default cause of death for the Death Note, which is why Kira''s victims are predominantly reported as dying from heart attacks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'In the manga, what specific number of volumes does the Death Note series span?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 volumes","isCorrect":false},{"text":"12 volumes","isCorrect":true},{"text":"14 volumes","isCorrect":false},{"text":"8 volumes","isCorrect":false}]'::jsonb,
  'The Death Note manga spans 12 volumes (108 chapters), serialized in Weekly Shōnen Jump from December 2003 to May 2006. The 13th book, "How to Read," is a supplementary guidebook, not a story volume.'
);
