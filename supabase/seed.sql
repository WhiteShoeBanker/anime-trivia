-- OtakuQuiz Seed Data
-- 8 anime series with 240 total questions
-- Generated from src/data/questions/ JSON files
-- Paste into Supabase SQL Editor to seed the database

-- ============================================================
-- Attack on Titan
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'attack-on-titan',
  'Attack on Titan',
  'Humanity fights for survival against giant Titans behind massive walls, uncovering dark secrets about their world.',
  '{"Shonen","Action","Dark Fantasy"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the main character in Attack on Titan?',
  'multiple_choice',
  'easy',
  '[{"text":"Eren Yeager","isCorrect":true},{"text":"Levi Ackerman","isCorrect":false},{"text":"Armin Arlert","isCorrect":false},{"text":"Reiner Braun","isCorrect":false}]'::jsonb,
  'Eren Yeager is the protagonist of Attack on Titan. After witnessing his mother''s death during the fall of Wall Maria, he vows to exterminate all Titans.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What are the giant humanoid creatures that threaten humanity called?',
  'multiple_choice',
  'easy',
  '[{"text":"Hollows","isCorrect":false},{"text":"Titans","isCorrect":true},{"text":"Kaiju","isCorrect":false},{"text":"Giants","isCorrect":false}]'::jsonb,
  'The giant humanoid creatures are called Titans. They range in size from 3 to 15 meters and instinctively attack and eat humans.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What protects humanity from the Titans at the start of the series?',
  'multiple_choice',
  'easy',
  '[{"text":"A vast ocean surrounding the land","isCorrect":false},{"text":"An army of elite soldiers","isCorrect":false},{"text":"Three massive walls — Wall Maria, Wall Rose, and Wall Sheena","isCorrect":true},{"text":"A magical barrier created by the king","isCorrect":false}]'::jsonb,
  'Humanity lives within three concentric walls: Wall Maria (outermost), Wall Rose (middle), and Wall Sheena (innermost). These walls are 50 meters tall and have protected humanity for over a century.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is Eren''s adopted sister?',
  'multiple_choice',
  'easy',
  '[{"text":"Annie Leonhart","isCorrect":false},{"text":"Historia Reiss","isCorrect":false},{"text":"Sasha Blouse","isCorrect":false},{"text":"Mikasa Ackerman","isCorrect":true}]'::jsonb,
  'Mikasa Ackerman was taken in by the Yeager family after Eren saved her from kidnappers as a child. She is fiercely protective of Eren and one of the most skilled soldiers in the series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is Eren''s best friend?',
  'multiple_choice',
  'easy',
  '[{"text":"Jean Kirstein","isCorrect":false},{"text":"Connie Springer","isCorrect":false},{"text":"Armin Arlert","isCorrect":true},{"text":"Reiner Braun","isCorrect":false}]'::jsonb,
  'Armin Arlert is Eren''s childhood best friend. Despite lacking physical strength, Armin''s intelligence and strategic thinking make him invaluable. He dreams of seeing the ocean beyond the walls.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What military branch do Eren, Mikasa, and Armin join after graduating from training?',
  'multiple_choice',
  'easy',
  '[{"text":"Military Police Brigade","isCorrect":false},{"text":"Garrison Regiment","isCorrect":false},{"text":"Survey Corps","isCorrect":true},{"text":"Training Corps","isCorrect":false}]'::jsonb,
  'Eren, Mikasa, and Armin join the Survey Corps (also known as the Scout Regiment), the branch that ventures beyond the walls to fight Titans and explore the outside world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the equipment soldiers use to fight Titans?',
  'multiple_choice',
  'easy',
  '[{"text":"Thunder Spears","isCorrect":false},{"text":"ODM Gear (Omni-Directional Mobility Gear)","isCorrect":true},{"text":"Anti-Titan Cannons","isCorrect":false},{"text":"Vertical Maneuvering Swords","isCorrect":false}]'::jsonb,
  'ODM Gear (Omni-Directional Mobility Gear), also called 3D Maneuver Gear, uses gas-powered grappling hooks and wires to allow soldiers to fly through the air and slash Titans with paired blades.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the weak spot on a Titan''s body that soldiers must strike to kill it?',
  'multiple_choice',
  'easy',
  '[{"text":"The heart","isCorrect":false},{"text":"The eyes","isCorrect":false},{"text":"The nape of the neck","isCorrect":true},{"text":"The top of the head","isCorrect":false}]'::jsonb,
  'The nape of the neck is the only weak spot on a Titan. A deep enough cut to the nape kills the Titan, because the human body of a Titan shifter (or the core of a Pure Titan) resides there.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Which wall falls first at the very beginning of the series?',
  'multiple_choice',
  'easy',
  '[{"text":"Wall Rose","isCorrect":false},{"text":"Wall Sheena","isCorrect":false},{"text":"Wall Maria","isCorrect":true},{"text":"All three walls fall at once","isCorrect":false}]'::jsonb,
  'Wall Maria, the outermost wall, is breached in the very first episode when the Colossal Titan kicks a hole in the gate of Shiganshina District. This forces humanity to retreat behind Wall Rose.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the enormous Titan that kicks a hole in the wall at the start of the story?',
  'multiple_choice',
  'easy',
  '[{"text":"Armored Titan","isCorrect":false},{"text":"Beast Titan","isCorrect":false},{"text":"Colossal Titan","isCorrect":true},{"text":"Attack Titan","isCorrect":false}]'::jsonb,
  'The Colossal Titan, standing at 60 meters tall, towers over the 50-meter walls. Its sudden appearance and destructive kick to the Shiganshina gate sets the entire story in motion.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What are the three military branches within the walls?',
  'multiple_choice',
  'medium',
  '[{"text":"Survey Corps, Garrison Regiment, and Military Police Brigade","isCorrect":true},{"text":"Survey Corps, Royal Guard, and Garrison Regiment","isCorrect":false},{"text":"Scout Regiment, Wall Guard, and King''s Brigade","isCorrect":false},{"text":"Attack Squad, Defense Corps, and Military Police","isCorrect":false}]'::jsonb,
  'The three branches are the Survey Corps (fights Titans beyond the walls), the Garrison Regiment (guards the walls), and the Military Police Brigade (maintains order in the interior near the king).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is known as humanity''s strongest soldier?',
  'multiple_choice',
  'medium',
  '[{"text":"Erwin Smith","isCorrect":false},{"text":"Mikasa Ackerman","isCorrect":false},{"text":"Captain Levi Ackerman","isCorrect":true},{"text":"Kenny Ackerman","isCorrect":false}]'::jsonb,
  'Captain Levi Ackerman of the Survey Corps is widely regarded as humanity''s strongest soldier. His combat skills are so exceptional that he is said to be worth an entire brigade on his own.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of Eren''s Titan form?',
  'multiple_choice',
  'medium',
  '[{"text":"Founding Titan","isCorrect":false},{"text":"War Hammer Titan","isCorrect":false},{"text":"Attack Titan","isCorrect":true},{"text":"Jaw Titan","isCorrect":false}]'::jsonb,
  'Eren possesses the Attack Titan (Shingeki no Kyojin), which is also the title of the series in Japanese. The Attack Titan has always moved forward seeking freedom, and it has the unique ability to see the memories of its future inheritors.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is revealed to be the Female Titan?',
  'multiple_choice',
  'medium',
  '[{"text":"Mikasa Ackerman","isCorrect":false},{"text":"Historia Reiss","isCorrect":false},{"text":"Annie Leonhart","isCorrect":true},{"text":"Ymir","isCorrect":false}]'::jsonb,
  'Annie Leonhart, a fellow graduate of the 104th Training Corps, is revealed to be the Female Titan. She was sent as a warrior from Marley to infiltrate the walls and retrieve the Founding Titan.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is the commander of the Survey Corps that leads the suicidal charge against the Beast Titan?',
  'multiple_choice',
  'medium',
  '[{"text":"Hange Zoe","isCorrect":false},{"text":"Erwin Smith","isCorrect":true},{"text":"Keith Shadis","isCorrect":false},{"text":"Dot Pixis","isCorrect":false}]'::jsonb,
  'Commander Erwin Smith leads the Survey Corps in a desperate charge against the Beast Titan during the Battle of Shiganshina. His courageous sacrifice allows Levi to close in on the Beast Titan.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the human identity of the Beast Titan?',
  'multiple_choice',
  'medium',
  '[{"text":"Reiner Braun","isCorrect":false},{"text":"Grisha Yeager","isCorrect":false},{"text":"Zeke Yeager","isCorrect":true},{"text":"Tom Ksaver","isCorrect":false}]'::jsonb,
  'The Beast Titan is Zeke Yeager, Eren''s older half-brother. Zeke is the son of Grisha Yeager and Dina Fritz, born and raised in Marley. He serves as the war chief of Marley''s Warrior Unit.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'How many Titan shifter types exist in total?',
  'multiple_choice',
  'medium',
  '[{"text":"Seven","isCorrect":false},{"text":"Nine","isCorrect":true},{"text":"Twelve","isCorrect":false},{"text":"Five","isCorrect":false}]'::jsonb,
  'There are Nine Titans in total: the Founding Titan, Attack Titan, Colossal Titan, Armored Titan, Female Titan, Beast Titan, Jaw Titan, Cart Titan, and War Hammer Titan. They all originate from Ymir Fritz''s power being split after her death.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the Founding Titan''s special ability?',
  'multiple_choice',
  'medium',
  '[{"text":"It can harden its skin to become indestructible","isCorrect":false},{"text":"It can see the future","isCorrect":false},{"text":"It can control all other Titans and alter the memories of Eldians","isCorrect":true},{"text":"It can regenerate faster than any other Titan","isCorrect":false}]'::jsonb,
  'The Founding Titan has the ability to control all Titans through the Coordinate and can alter or erase the memories of Subjects of Ymir (Eldians). This is how King Fritz erased humanity''s memories of the outside world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'Who is revealed to be the Armored Titan?',
  'multiple_choice',
  'medium',
  '[{"text":"Bertholdt Hoover","isCorrect":false},{"text":"Reiner Braun","isCorrect":true},{"text":"Porco Galliard","isCorrect":false},{"text":"Marcel Galliard","isCorrect":false}]'::jsonb,
  'Reiner Braun is the Armored Titan. He, along with Bertholdt (Colossal Titan) and Annie (Female Titan), infiltrated the walls as warriors from Marley. Reiner broke through the inner gate of Shiganshina after the Colossal Titan breached the outer wall.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the district where Eren grew up?',
  'multiple_choice',
  'medium',
  '[{"text":"Trost District","isCorrect":false},{"text":"Stohess District","isCorrect":false},{"text":"Shiganshina District","isCorrect":true},{"text":"Karanes District","isCorrect":false}]'::jsonb,
  'Shiganshina District is the southernmost town along Wall Maria where Eren, Mikasa, and Armin grew up. It is the first area to fall when the Colossal Titan breaches the gate.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the nation across the sea that sent warriors to infiltrate Paradis Island?',
  'multiple_choice',
  'hard',
  '[{"text":"Hizuru","isCorrect":false},{"text":"Eldia","isCorrect":false},{"text":"Marley","isCorrect":true},{"text":"Liberio","isCorrect":false}]'::jsonb,
  'Marley is the powerful nation across the sea that sent Reiner, Bertholdt, Annie, and Marcel to Paradis Island as warriors to retrieve the Founding Titan. Marley uses Titan powers as weapons of war and oppresses the Eldian people within its borders.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the name of the Eldian king who created the walls and erased humanity''s memories?',
  'multiple_choice',
  'hard',
  '[{"text":"Rod Reiss","isCorrect":false},{"text":"Karl Fritz, the 145th King","isCorrect":true},{"text":"Uri Reiss","isCorrect":false},{"text":"King Fritz the First","isCorrect":false}]'::jsonb,
  'Karl Fritz, the 145th King of Eldia, used the Founding Titan''s power to create the three walls from countless Colossal Titans. He then erased the memories of the Eldians within the walls and made a vow of pacifism renouncing war.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is Ymir Fritz''s (the Founder''s) connection to the origin of the Titans?',
  'multiple_choice',
  'hard',
  '[{"text":"She was a goddess who created Titans to punish humanity","isCorrect":false},{"text":"She was the first Titan, gaining her power from a mysterious creature in a tree, and after her death her power split into the Nine Titans","isCorrect":true},{"text":"She was a scientist who discovered Titan serum in an ancient laboratory","isCorrect":false},{"text":"She inherited the power from the Devil of All Earth through a blood pact","isCorrect":false}]'::jsonb,
  'Ymir Fritz was a slave who fell into a great tree and came into contact with a mysterious spine-like creature, which granted her the power of the Titans. She served King Fritz and bore his children. After her death, her power was split among her descendants into the Nine Titans.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is ''the Rumbling''?',
  'multiple_choice',
  'hard',
  '[{"text":"An earthquake caused by Titans emerging from underground","isCorrect":false},{"text":"The activation of millions of Colossal Titans within the walls to flatten the world outside Paradis","isCorrect":true},{"text":"A military operation by the Survey Corps to reclaim Wall Maria","isCorrect":false},{"text":"The sound made when a Titan shifter transforms","isCorrect":false}]'::jsonb,
  'The Rumbling is the ultimate weapon: millions of Colossal Titans that make up the three walls are unleashed to march across the world and trample everything in their path. Eren activates the Rumbling using the Founding Titan''s power to destroy the world beyond Paradis Island.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is Eren''s true motivation as revealed at the end of the series?',
  'multiple_choice',
  'hard',
  '[{"text":"He wanted to become the ruler of the entire world","isCorrect":false},{"text":"He wanted to make his friends into heroes who stopped him, ensuring Paradis''s freedom, while also fulfilling his desire to see a flat, empty world","isCorrect":true},{"text":"He was fully controlled by the Founding Titan and had no free will","isCorrect":false},{"text":"He wanted to eliminate all Titan powers from the world permanently","isCorrect":false}]'::jsonb,
  'Eren''s final reveal shows a complex motivation: he orchestrated events so his friends would stop him and be seen as heroes by the world, securing peace for Paradis. He also confessed to Armin that part of him simply wanted to reduce the world to a blank, empty landscape, echoing the freedom Armin''s book described.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the Ackerman clan''s special trait that sets them apart from other Eldians?',
  'multiple_choice',
  'hard',
  '[{"text":"They can transform into Titans at will without injections","isCorrect":false},{"text":"They can manifest the power of Titans in human form, granting extraordinary strength, and are immune to memory alteration by the Founding Titan","isCorrect":true},{"text":"They are the only bloodline that can use ODM Gear effectively","isCorrect":false},{"text":"They have a lifespan three times longer than normal humans","isCorrect":false}]'::jsonb,
  'The Ackerman clan is a byproduct of Titan science — they can access the power of Titans while remaining in human form, which gives them superhuman combat abilities. They are also immune to the Founding Titan''s memory manipulation, which is why the royal government persecuted them.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What was the name of Grisha Yeager''s first wife in Marley, and what became of her?',
  'multiple_choice',
  'hard',
  '[{"text":"Carla Yeager — she was killed during the fall of Wall Maria","isCorrect":false},{"text":"Dina Fritz — she was turned into a Pure Titan and became the Smiling Titan that ate Eren''s mother","isCorrect":true},{"text":"Faye Yeager — she was killed by Marleyan soldiers as a child","isCorrect":false},{"text":"Karina Braun — she raised Reiner in Marley''s internment zone","isCorrect":false}]'::jsonb,
  'Dina Fritz was Grisha''s first wife and a descendant of the royal Fritz family living in Marley. When their Eldian restorationist group was betrayed, she was turned into a Pure Titan. As the Smiling Titan, she killed Eren''s mother Carla during the fall of Shiganshina.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is ''the Coordinate'' in the context of Attack on Titan?',
  'multiple_choice',
  'hard',
  '[{"text":"The geographic center of the three walls","isCorrect":false},{"text":"The meeting point of the Paths where all Eldians are connected","isCorrect":false},{"text":"Another name for the Founding Titan''s power — the ability to command all Titans and Subjects of Ymir","isCorrect":true},{"text":"A secret weapon developed by the Marleyan military","isCorrect":false}]'::jsonb,
  'The Coordinate is another name for the Founding Titan''s power. It serves as the central point that connects all Subjects of Ymir through the Paths. Whoever holds the Coordinate can command all Titans and alter the biology and memories of all Eldians.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'How does a person inherit one of the Nine Titan powers?',
  'multiple_choice',
  'hard',
  '[{"text":"By being injected with a special serum created from Titan spinal fluid","isCorrect":false},{"text":"By touching the blood of a royal family member","isCorrect":false},{"text":"A mindless Titan must eat a Titan shifter in their human form to gain their power","isCorrect":true},{"text":"The power is passed down automatically to the eldest child upon the holder''s death","isCorrect":false}]'::jsonb,
  'To inherit a Titan power, a mindless (Pure) Titan must consume a Titan shifter while the shifter is in human form. The mindless Titan then reverts to human and gains the shifter''s power. If a shifter dies without being eaten, the power is passed to a random Eldian baby.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'attack-on-titan'),
  'What is the ''Curse of Ymir'' and how does it affect Titan shifters?',
  'multiple_choice',
  'hard',
  '[{"text":"Titan shifters slowly lose their humanity and become mindless Titans","isCorrect":false},{"text":"Titan shifters can never have children","isCorrect":false},{"text":"Titan shifters die exactly 13 years after inheriting their power, because Ymir Fritz died 13 years after she first gained the Titan power","isCorrect":true},{"text":"Titan shifters are cursed to obey whoever holds the Founding Titan","isCorrect":false}]'::jsonb,
  'The Curse of Ymir dictates that no Titan shifter can live longer than 13 years after inheriting their power. This is because Ymir Fritz, the original Titan, died 13 years after she first obtained the power. As the end of the 13 years approaches, the shifter''s body deteriorates.'
);

-- ============================================================
-- Death Note
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'death-note',
  'Death Note',
  'A high school genius finds a supernatural notebook that kills anyone whose name is written in it, sparking a cat-and-mouse game with a legendary detective.',
  '{"Shonen","Thriller","Psychological"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the main character who finds the Death Note?',
  'multiple_choice',
  'easy',
  '[{"text":"Light Yagami","isCorrect":true},{"text":"Teru Mikami","isCorrect":false},{"text":"Soichiro Yagami","isCorrect":false},{"text":"Touta Matsuda","isCorrect":false}]'::jsonb,
  'Light Yagami is the protagonist of Death Note. He is a high school student who discovers the Death Note in his school yard and begins using it to kill criminals.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is a Death Note?',
  'multiple_choice',
  'easy',
  '[{"text":"A cursed sword that steals souls","isCorrect":false},{"text":"A supernatural notebook — anyone whose name is written in it will die","isCorrect":true},{"text":"A list of people targeted by Shinigami","isCorrect":false},{"text":"A diary that predicts future deaths","isCorrect":false}]'::jsonb,
  'The Death Note is a supernatural notebook originally belonging to a Shinigami (god of death). Any human whose name is written in it will die.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the Shinigami who drops the Death Note into the human world?',
  'multiple_choice',
  'easy',
  '[{"text":"Rem","isCorrect":false},{"text":"Gelus","isCorrect":false},{"text":"Ryuk","isCorrect":true},{"text":"Sidoh","isCorrect":false}]'::jsonb,
  'Ryuk is the Shinigami who intentionally drops his Death Note into the human world because he is bored with the Shinigami Realm.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What alias does Light use as he kills criminals?',
  'multiple_choice',
  'easy',
  '[{"text":"Shinigami","isCorrect":false},{"text":"Kira","isCorrect":true},{"text":"Zero","isCorrect":false},{"text":"Justice","isCorrect":false}]'::jsonb,
  'Light becomes known as ''Kira,'' a name derived from the Japanese pronunciation of the English word ''killer.'' The public gives him this name.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Who is the genius detective trying to catch Kira?',
  'multiple_choice',
  'easy',
  '[{"text":"Near","isCorrect":false},{"text":"Mello","isCorrect":false},{"text":"L","isCorrect":true},{"text":"Watari","isCorrect":false}]'::jsonb,
  'L (also known as L Lawliet) is the world''s greatest detective. He is the primary antagonist to Light and leads the initial investigation to unmask Kira.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What does Ryuk love to eat?',
  'multiple_choice',
  'easy',
  '[{"text":"Strawberries","isCorrect":false},{"text":"Cake","isCorrect":false},{"text":"Apples","isCorrect":true},{"text":"Chocolate","isCorrect":false}]'::jsonb,
  'Ryuk is obsessed with apples from the human world. He describes them as being like cigarettes and alcohol for Shinigami, and he goes through withdrawal symptoms without them.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What must you know to kill someone with the Death Note?',
  'multiple_choice',
  'easy',
  '[{"text":"Their address and phone number","isCorrect":false},{"text":"Their real name and face","isCorrect":true},{"text":"Only their real name","isCorrect":false},{"text":"Their blood type and birthday","isCorrect":false}]'::jsonb,
  'To use the Death Note, the writer must know the target''s real name and have their face in mind while writing. This prevents people who share the same name from being accidentally killed.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Light''s father''s occupation?',
  'multiple_choice',
  'easy',
  '[{"text":"A university professor","isCorrect":false},{"text":"A private detective","isCorrect":false},{"text":"Chief of the NPA and head of the Kira investigation","isCorrect":true},{"text":"A lawyer for the Japanese government","isCorrect":false}]'::jsonb,
  'Soichiro Yagami is the chief of the National Police Agency (NPA) in Japan and leads the Kira investigation task force, which puts him directly at odds with his own son without knowing it.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is L''s signature sitting position?',
  'multiple_choice',
  'easy',
  '[{"text":"Cross-legged on the floor","isCorrect":false},{"text":"Crouched with his knees drawn up to his chest","isCorrect":true},{"text":"Lying on his side across the chair","isCorrect":false},{"text":"Standing at all times because he never sits","isCorrect":false}]'::jsonb,
  'L always sits in a crouched position with his knees pulled up to his chest. He claims that sitting normally would reduce his reasoning ability by approximately 40%.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What kind of student is Light Yagami?',
  'multiple_choice',
  'easy',
  '[{"text":"An average student who struggles in school","isCorrect":false},{"text":"A genius-level student who is ranked number one in Japan","isCorrect":true},{"text":"A talented athlete who gets by on sports scholarships","isCorrect":false},{"text":"A dropout who studies on his own","isCorrect":false}]'::jsonb,
  'Light Yagami is an exceptionally gifted student, scoring number one in national practice exams across all of Japan. His intelligence is a key part of his ability to evade detection as Kira.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What happens if you don''t specify a cause of death when writing a name in the Death Note?',
  'multiple_choice',
  'medium',
  '[{"text":"The person dies instantly from a brain aneurysm","isCorrect":false},{"text":"The person dies of a heart attack after 40 seconds","isCorrect":true},{"text":"The Death Note entry is invalid and nothing happens","isCorrect":false},{"text":"The person dies in their sleep that night","isCorrect":false}]'::jsonb,
  'If no cause of death is specified, the victim will die of a heart attack 40 seconds after their name is written. This is the default cause of death and is how L initially identifies a pattern in Kira''s killings.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the second Kira?',
  'multiple_choice',
  'medium',
  '[{"text":"Kiyomi Takada","isCorrect":false},{"text":"Naomi Misora","isCorrect":false},{"text":"Misa Amane","isCorrect":true},{"text":"Sayu Yagami","isCorrect":false}]'::jsonb,
  'Misa Amane is a popular model and actress who obtains a Death Note from the Shinigami Rem. She becomes the second Kira and is devoted to Light, whom she sees as her savior.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the Shinigami Eye deal?',
  'multiple_choice',
  'medium',
  '[{"text":"A human gains the ability to see through walls in exchange for their eyesight in one eye","isCorrect":false},{"text":"A human trades half their remaining lifespan to see any person''s real name and lifespan above their head","isCorrect":true},{"text":"A human can see Shinigami in exchange for ten years of their life","isCorrect":false},{"text":"A human gains future sight in exchange for giving up their Death Note","isCorrect":false}]'::jsonb,
  'The Shinigami Eye deal allows a human to see the real name and remaining lifespan of any person by looking at their face. The cost is half of the human''s remaining lifespan. Misa makes this deal twice.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the task force assembled to catch Kira?',
  'multiple_choice',
  'medium',
  '[{"text":"The SPK","isCorrect":false},{"text":"The Kira Investigation Team (Japanese Task Force)","isCorrect":true},{"text":"The Death Note Bureau","isCorrect":false},{"text":"Interpol Special Division","isCorrect":false}]'::jsonb,
  'The Kira Investigation Team, also known as the Japanese Task Force, is a small group of dedicated NPA officers who work directly with L to catch Kira. Most police officers quit due to fear of Kira.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is L''s real name?',
  'multiple_choice',
  'medium',
  '[{"text":"Nate River","isCorrect":false},{"text":"Mihael Keehl","isCorrect":false},{"text":"L Lawliet","isCorrect":true},{"text":"Quillsh Wammy","isCorrect":false}]'::jsonb,
  'L''s full real name is L Lawliet. He keeps this name a closely guarded secret because anyone with a Death Note who knows his name and face could kill him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Who is Misa Amane''s Shinigami?',
  'multiple_choice',
  'medium',
  '[{"text":"Ryuk","isCorrect":false},{"text":"Sidoh","isCorrect":false},{"text":"Rem","isCorrect":true},{"text":"Gelus","isCorrect":false}]'::jsonb,
  'Rem is the Shinigami who accompanies Misa Amane. Rem inherited the Death Note that originally belonged to Gelus after Gelus died saving Misa''s life, and Rem gave it to Misa.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What university do Light and L both attend?',
  'multiple_choice',
  'medium',
  '[{"text":"Tokyo University","isCorrect":false},{"text":"To-Oh University","isCorrect":true},{"text":"Keio University","isCorrect":false},{"text":"Waseda University","isCorrect":false}]'::jsonb,
  'Both Light and L attend To-Oh University, which is a fictional university in the series modeled after the University of Tokyo. They both score perfectly on the entrance exam and give the freshman address together.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What does Light do with the Death Note to temporarily clear his name during the investigation?',
  'multiple_choice',
  'medium',
  '[{"text":"He hides it in a secret compartment in his desk","isCorrect":false},{"text":"He burns it to destroy the evidence","isCorrect":false},{"text":"He gives up ownership of the Death Note, which erases his memories of it","isCorrect":true},{"text":"He passes it to Misa to hold temporarily","isCorrect":false}]'::jsonb,
  'Light voluntarily relinquishes ownership of his Death Note, which causes him to lose all memories related to it. This allows him to genuinely act innocent during confinement, as he truly no longer remembers being Kira.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of Light''s sister?',
  'multiple_choice',
  'medium',
  '[{"text":"Misa Yagami","isCorrect":false},{"text":"Sayu Yagami","isCorrect":true},{"text":"Yuri Yagami","isCorrect":false},{"text":"Naomi Yagami","isCorrect":false}]'::jsonb,
  'Sayu Yagami is Light''s younger sister. She is a normal, cheerful girl who is unaware of her brother''s secret life as Kira. She is later kidnapped by Mello''s group in the second arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What does L suspect about Light from very early in the investigation?',
  'multiple_choice',
  'medium',
  '[{"text":"That Light is secretly working with the police","isCorrect":false},{"text":"That Light is Kira","isCorrect":true},{"text":"That Light has Shinigami Eyes","isCorrect":false},{"text":"That Light is the second Kira","isCorrect":false}]'::jsonb,
  'L suspects Light of being Kira almost immediately after their first meeting. Despite lacking concrete proof, L''s intuition and deductive reasoning lead him to place Light as his prime suspect throughout the investigation.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Near''s real name?',
  'multiple_choice',
  'hard',
  '[{"text":"Mail Jeevas","isCorrect":false},{"text":"Mihael Keehl","isCorrect":false},{"text":"Nate River","isCorrect":true},{"text":"Quillsh Wammy","isCorrect":false}]'::jsonb,
  'Near''s real name is Nate River. He is one of L''s successors raised at Wammy''s House and ultimately becomes the one who exposes Light as Kira in the series finale.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Mello''s real name?',
  'multiple_choice',
  'hard',
  '[{"text":"Nate River","isCorrect":false},{"text":"Mail Jeevas","isCorrect":false},{"text":"Mihael Keehl","isCorrect":true},{"text":"Beyond Birthday","isCorrect":false}]'::jsonb,
  'Mello''s real name is Mihael Keehl. He is the second-ranked successor to L at Wammy''s House and takes a more aggressive, mafia-affiliated approach to catching Kira compared to Near''s methodical style.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What organization does Near lead to investigate Kira?',
  'multiple_choice',
  'hard',
  '[{"text":"The Kira Investigation Team","isCorrect":false},{"text":"The FBI Kira Division","isCorrect":false},{"text":"The SPK (Special Provision for Kira)","isCorrect":true},{"text":"Wammy''s Intelligence Network","isCorrect":false}]'::jsonb,
  'Near leads the SPK, which stands for Special Provision for Kira. It is a secret organization formed by the United States government specifically to investigate and apprehend Kira after L''s death.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What fake rule does Light write in the Death Note to trick the investigators?',
  'multiple_choice',
  'hard',
  '[{"text":"A rule stating the notebook cannot kill anyone under 18","isCorrect":false},{"text":"A rule stating burning the notebook kills its owner","isCorrect":false},{"text":"The 13-day rule: if the user fails to write names within 13 days, the user will die","isCorrect":true},{"text":"A rule stating only one name can be written per day","isCorrect":false}]'::jsonb,
  'Light had Ryuk write the fake 13-day rule into the Death Note''s rules. This rule states that if the user does not write a name every 13 days, they will die. It was used to clear Light''s suspicion since he was confined for over 13 days without dying.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'How does Light ultimately get exposed as Kira in the series finale?',
  'multiple_choice',
  'hard',
  '[{"text":"Ryuk betrays Light and reveals his identity to Near","isCorrect":false},{"text":"Misa confesses to the police and implicates Light","isCorrect":false},{"text":"Near replaces Mikami''s Death Note with a fake, so when Mikami writes the SPK members'' names and they don''t die, Light is exposed","isCorrect":true},{"text":"L left behind a secret recording that proved Light was Kira","isCorrect":false}]'::jsonb,
  'Near and his team replace Teru Mikami''s Death Note with a carefully crafted replica. At the final confrontation in the Yellow Box warehouse, Mikami writes everyone''s names but no one dies, proving the notebook is real and exposing Light as the one who orchestrated the killings.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the Shinigami King also known as?',
  'multiple_choice',
  'hard',
  '[{"text":"Ryuk the Elder","isCorrect":false},{"text":"The King of Death","isCorrect":true},{"text":"Lord Mu","isCorrect":false},{"text":"The Great Shinigami Overlord","isCorrect":false}]'::jsonb,
  'The Shinigami King, also referred to as the King of Death, is the ruler of all Shinigami in the Shinigami Realm. He is referenced throughout the series but rarely shown directly. He is the one who possesses the rules governing all Death Notes.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'Approximately how many individual rules govern how the Death Note works, as detailed throughout the manga?',
  'multiple_choice',
  'hard',
  '[{"text":"About 15 rules","isCorrect":false},{"text":"About 30 rules","isCorrect":false},{"text":"Over 60 rules","isCorrect":true},{"text":"Exactly 100 rules","isCorrect":false}]'::jsonb,
  'The Death Note has an extensive set of rules detailed across the manga volumes in the ''How to Use It'' sections. There are over 60 individual rules covering everything from causes of death, time limits, ownership transfers, the Shinigami Eye deal, and more.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is Watari''s real name?',
  'multiple_choice',
  'hard',
  '[{"text":"Roger Ruvie","isCorrect":false},{"text":"Quillsh Wammy","isCorrect":true},{"text":"Nate River","isCorrect":false},{"text":"Aiber Thierry","isCorrect":false}]'::jsonb,
  'Watari''s real name is Quillsh Wammy. He is L''s handler, assistant, and father figure. He is also the founder of Wammy''s House, the orphanage where L, Near, and Mello were raised.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What happens when a Shinigami uses the Death Note to extend a human''s life by killing someone who would have caused that human''s death?',
  'multiple_choice',
  'hard',
  '[{"text":"The Shinigami loses their Death Note permanently","isCorrect":false},{"text":"The Shinigami is banished to the human world forever","isCorrect":false},{"text":"The Shinigami dies, turning to dust","isCorrect":true},{"text":"The Shinigami becomes human","isCorrect":false}]'::jsonb,
  'If a Shinigami uses the Death Note to kill someone specifically to save a human''s life, that Shinigami will die. This happened to Gelus, who saved Misa Amane from a stalker, and to Rem, who killed L and Watari to protect Misa from being exposed.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'What is the name of the institution where L, Near, and Mello were raised?',
  'multiple_choice',
  'hard',
  '[{"text":"The Winchester Academy for the Gifted","isCorrect":false},{"text":"The Lawliet Foundation","isCorrect":false},{"text":"Wammy''s House","isCorrect":true},{"text":"The British Intelligence Youth Program","isCorrect":false}]'::jsonb,
  'Wammy''s House is an orphanage for extraordinarily gifted children located in Winchester, England. It was founded by Quillsh Wammy (Watari) and serves as a training ground for potential successors to L.'
);

-- ============================================================
-- Demon Slayer: Kimetsu no Yaiba
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'demon-slayer',
  'Demon Slayer: Kimetsu no Yaiba',
  'Tanjiro Kamado joins the Demon Slayer Corps to avenge his family and cure his sister Nezuko, who has been turned into a demon.',
  '{"Shonen","Action","Supernatural"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the main character in Demon Slayer: Kimetsu no Yaiba?',
  'multiple_choice',
  'easy',
  '[{"text":"Tanjiro Kamado","isCorrect":true},{"text":"Zenitsu Agatsuma","isCorrect":false},{"text":"Inosuke Hashibira","isCorrect":false},{"text":"Giyu Tomioka","isCorrect":false}]'::jsonb,
  'Tanjiro Kamado is the protagonist of Demon Slayer. He is a kind-hearted boy who becomes a Demon Slayer after his family is attacked by demons.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Why does Tanjiro decide to become a Demon Slayer?',
  'multiple_choice',
  'easy',
  '[{"text":"To become the strongest swordsman in Japan","isCorrect":false},{"text":"To avenge his family and find a cure for his sister Nezuko","isCorrect":true},{"text":"To earn money for his village","isCorrect":false},{"text":"To follow in his father''s footsteps","isCorrect":false}]'::jsonb,
  'After a demon slaughtered most of his family, Tanjiro set out to become a Demon Slayer to avenge them and find a way to turn his sister Nezuko, who was transformed into a demon, back into a human.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What happened to Tanjiro''s sister Nezuko?',
  'multiple_choice',
  'easy',
  '[{"text":"She was kidnapped by bandits","isCorrect":false},{"text":"She was turned into a demon","isCorrect":true},{"text":"She became a Hashira","isCorrect":false},{"text":"She ran away from home","isCorrect":false}]'::jsonb,
  'Nezuko was turned into a demon by Muzan Kibutsuji during the same attack that killed the rest of the Kamado family. Unlike other demons, she retains some of her human emotions and protects Tanjiro.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How does Tanjiro protect Nezuko from sunlight while traveling?',
  'multiple_choice',
  'easy',
  '[{"text":"He covers her with a special cloak","isCorrect":false},{"text":"She wears a bamboo muzzle and is carried in a wooden box on his back","isCorrect":true},{"text":"She hides underground during the day","isCorrect":false},{"text":"He uses a breathing technique to create shade","isCorrect":false}]'::jsonb,
  'Tanjiro carries Nezuko in a specially made wooden box on his back to shield her from sunlight. She also wears a bamboo muzzle to prevent her from biting anyone.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the organization that fights demons in the series?',
  'multiple_choice',
  'easy',
  '[{"text":"The Hashira Order","isCorrect":false},{"text":"The Demon Slayer Corps","isCorrect":true},{"text":"The Twelve Kizuki","isCorrect":false},{"text":"The Breathing Guild","isCorrect":false}]'::jsonb,
  'The Demon Slayer Corps is a centuries-old organization dedicated to protecting humanity from demons. It operates in secret and is not officially recognized by the government.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who is the main villain and king of all demons in Demon Slayer?',
  'multiple_choice',
  'easy',
  '[{"text":"Akaza","isCorrect":false},{"text":"Kokushibo","isCorrect":false},{"text":"Muzan Kibutsuji","isCorrect":true},{"text":"Enmu","isCorrect":false}]'::jsonb,
  'Muzan Kibutsuji is the first and most powerful demon, as well as the progenitor of almost all other demons. He is the one who killed Tanjiro''s family and turned Nezuko into a demon.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Which two companions regularly travel and fight alongside Tanjiro?',
  'multiple_choice',
  'easy',
  '[{"text":"Giyu Tomioka and Shinobu Kocho","isCorrect":false},{"text":"Zenitsu Agatsuma and Inosuke Hashibira","isCorrect":true},{"text":"Kanao Tsuyuri and Genya Shinazugawa","isCorrect":false},{"text":"Muichiro Tokito and Mitsuri Kanroji","isCorrect":false}]'::jsonb,
  'Zenitsu Agatsuma, a cowardly but surprisingly powerful Thunder Breathing user, and Inosuke Hashibira, a wild boar-mask-wearing Beast Breathing user, become Tanjiro''s closest companions throughout the series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What does Inosuke Hashibira wear on his head?',
  'multiple_choice',
  'easy',
  '[{"text":"A wolf pelt","isCorrect":false},{"text":"A boar''s head mask","isCorrect":true},{"text":"A demon skull helmet","isCorrect":false},{"text":"A straw hat","isCorrect":false}]'::jsonb,
  'Inosuke wears the hollowed-out head of a boar as a mask. He was raised by boars in the mountains after being abandoned as a baby, and the boar head belonged to his adoptive boar mother.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What color does Tanjiro''s Nichirin sword turn when he first wields it?',
  'multiple_choice',
  'easy',
  '[{"text":"Red","isCorrect":false},{"text":"Blue","isCorrect":false},{"text":"Black","isCorrect":true},{"text":"Green","isCorrect":false}]'::jsonb,
  'Tanjiro''s Nichirin sword turns black, which is considered a rare and mysterious color. Black blades are said to be unusual, and historically their wielders'' fates are largely unknown.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Zenitsu''s primary emotional state during battles?',
  'multiple_choice',
  'easy',
  '[{"text":"Uncontrollable rage","isCorrect":false},{"text":"Extreme fear — he often fights while asleep or unconscious","isCorrect":true},{"text":"Calm and collected focus","isCorrect":false},{"text":"Overconfident arrogance","isCorrect":false}]'::jsonb,
  'Zenitsu is overwhelmed by fear in battle and often passes out from sheer terror. Ironically, when unconscious, he unleashes his true power and executes his Thunder Breathing techniques with incredible speed and precision.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What Breathing Style does Tanjiro initially learn and use in combat?',
  'multiple_choice',
  'medium',
  '[{"text":"Flame Breathing","isCorrect":false},{"text":"Water Breathing","isCorrect":true},{"text":"Wind Breathing","isCorrect":false},{"text":"Sun Breathing","isCorrect":false}]'::jsonb,
  'Tanjiro first learns Water Breathing from his master Sakonji Urokodaki. He later discovers Hinokami Kagura (Sun Breathing), which was passed down through his family, and begins combining both styles in battle.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the signature technique that Zenitsu is best known for?',
  'multiple_choice',
  'medium',
  '[{"text":"Water Breathing, Second Form: Water Wheel","isCorrect":false},{"text":"Beast Breathing, First Fang: Pierce","isCorrect":false},{"text":"Thunder Breathing, First Form: Thunderclap and Flash","isCorrect":true},{"text":"Flame Breathing, First Form: Unknowing Fire","isCorrect":false}]'::jsonb,
  'Zenitsu mastered only the First Form of Thunder Breathing — Thunderclap and Flash — but refined it to an extraordinary degree. This lightning-fast technique allows him to close distances and strike with blinding speed.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What are the highest-ranked and most elite Demon Slayers called?',
  'multiple_choice',
  'medium',
  '[{"text":"The Twelve Kizuki","isCorrect":false},{"text":"The Kinoe","isCorrect":false},{"text":"The Hashira (Pillars)","isCorrect":true},{"text":"The Breathing Masters","isCorrect":false}]'::jsonb,
  'The Hashira, also known as the Pillars, are the nine most powerful swordsmen in the Demon Slayer Corps. Each Hashira specializes in a particular Breathing Style and serves as the Corps'' strongest line of defense against demons.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who is the Water Hashira that first encounters Tanjiro and Nezuko?',
  'multiple_choice',
  'medium',
  '[{"text":"Kyojuro Rengoku","isCorrect":false},{"text":"Tengen Uzui","isCorrect":false},{"text":"Giyu Tomioka","isCorrect":true},{"text":"Obanai Iguro","isCorrect":false}]'::jsonb,
  'Giyu Tomioka, the Water Hashira, is the first Hashira Tanjiro meets. He initially tries to kill Nezuko but is moved by the siblings'' bond and instead directs Tanjiro to his former master, Sakonji Urokodaki, to begin training.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the group of Muzan''s most powerful demons called?',
  'multiple_choice',
  'medium',
  '[{"text":"The Demon Moons","isCorrect":false},{"text":"The Twelve Kizuki (Twelve Demon Moons)","isCorrect":true},{"text":"The Shadow Demons","isCorrect":false},{"text":"The Blood Demons","isCorrect":false}]'::jsonb,
  'The Twelve Kizuki are Muzan''s twelve most powerful demons, divided into six Upper Ranks (Upper Moons) and six Lower Ranks (Lower Moons). The Upper Ranks are significantly more powerful and have killed many Hashira over the centuries.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who is the Flame Hashira that battles Upper Rank Three Akaza aboard the Mugen Train?',
  'multiple_choice',
  'medium',
  '[{"text":"Giyu Tomioka","isCorrect":false},{"text":"Sanemi Shinazugawa","isCorrect":false},{"text":"Kyojuro Rengoku","isCorrect":true},{"text":"Gyomei Himejima","isCorrect":false}]'::jsonb,
  'Kyojuro Rengoku, the passionate and honorable Flame Hashira, fights Upper Rank Three Akaza in a fierce battle aboard and beside the Mugen Train. His bravery and dedication left a lasting impact on Tanjiro and his companions.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What makes Nezuko unique compared to other demons?',
  'multiple_choice',
  'medium',
  '[{"text":"She can use Breathing techniques like a Demon Slayer","isCorrect":false},{"text":"She doesn''t need to eat humans and recovers energy by sleeping instead","isCorrect":true},{"text":"She can speak fluently despite being a demon","isCorrect":false},{"text":"She was born as a demon rather than turned into one","isCorrect":false}]'::jsonb,
  'Unlike other demons who must consume human flesh or blood to sustain themselves and grow stronger, Nezuko recovers her energy through sleep. This is extraordinarily rare and is one reason Tanjiro believes she can be turned back into a human.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the hidden village where Demon Slayers'' swords are forged?',
  'multiple_choice',
  'medium',
  '[{"text":"The Butterfly Mansion","isCorrect":false},{"text":"The Swordsmith Village","isCorrect":true},{"text":"The Ubuyashiki Estate","isCorrect":false},{"text":"The Infinity Castle","isCorrect":false}]'::jsonb,
  'The Swordsmith Village is a secret, hidden location where skilled artisans forge the Nichirin swords used by the Demon Slayer Corps. Its location is kept highly confidential to protect the swordsmiths from demon attacks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How many forms does standard Water Breathing have?',
  'multiple_choice',
  'medium',
  '[{"text":"7 forms","isCorrect":false},{"text":"10 forms","isCorrect":true},{"text":"12 forms","isCorrect":false},{"text":"9 forms","isCorrect":false}]'::jsonb,
  'Water Breathing has 10 established forms. Tanjiro''s former master Sakonji Urokodaki and the Water Hashira Giyu Tomioka both know all 10 forms. Giyu also created an original 11th Form: Dead Calm, which is unique to him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who is the Love Hashira in the Demon Slayer Corps?',
  'multiple_choice',
  'medium',
  '[{"text":"Shinobu Kocho","isCorrect":false},{"text":"Kanao Tsuyuri","isCorrect":false},{"text":"Mitsuri Kanroji","isCorrect":true},{"text":"Nezuko Kamado","isCorrect":false}]'::jsonb,
  'Mitsuri Kanroji is the Love Hashira. She uses Love Breathing, a style she derived from Flame Breathing. She possesses a unique muscular composition eight times denser than a normal person''s, giving her incredible strength and flexibility.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of Upper Moon One, the strongest of the Twelve Kizuki?',
  'multiple_choice',
  'hard',
  '[{"text":"Akaza","isCorrect":false},{"text":"Doma","isCorrect":false},{"text":"Kokushibo","isCorrect":true},{"text":"Hantengu","isCorrect":false}]'::jsonb,
  'Kokushibo holds the position of Upper Moon One, making him the most powerful demon under Muzan Kibutsuji. He is an ancient demon who has lived for over 400 years and uses Moon Breathing, a combat style he developed from his human days as a swordsman.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What was Kokushibo''s human name, and what is his relation to the legendary Demon Slayer Yoriichi Tsugikuni?',
  'multiple_choice',
  'hard',
  '[{"text":"Michikatsu Tsugikuni — he was Yoriichi''s twin brother","isCorrect":true},{"text":"Hakuji — he was Yoriichi''s student","isCorrect":false},{"text":"Sumiyoshi — he was Yoriichi''s son","isCorrect":false},{"text":"Kaigaku — he was Yoriichi''s rival from another clan","isCorrect":false}]'::jsonb,
  'Kokushibo was born as Michikatsu Tsugikuni, the twin brother of Yoriichi Tsugikuni, the strongest Demon Slayer in history. Consumed by jealousy of his brother''s unmatched talent, Michikatsu eventually accepted Muzan''s blood and became a demon to surpass the limits of human life.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the original Breathing Style from which all other Breathing Styles are derived?',
  'multiple_choice',
  'hard',
  '[{"text":"Water Breathing","isCorrect":false},{"text":"Flame Breathing","isCorrect":false},{"text":"Moon Breathing","isCorrect":false},{"text":"Sun Breathing, created by Yoriichi Tsugikuni","isCorrect":true}]'::jsonb,
  'Sun Breathing (Hinokami Kagura) is the first and most powerful Breathing Style, created by Yoriichi Tsugikuni during the Sengoku era. All other Breathing Styles — Water, Flame, Wind, Thunder, and Stone — are derived from Sun Breathing, adapted by swordsmen who couldn''t master the original.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Which Hashira and Demon Slayers fought together against Upper Moon One Kokushibo?',
  'multiple_choice',
  'hard',
  '[{"text":"Giyu Tomioka, Shinobu Kocho, Mitsuri Kanroji, and Obanai Iguro","isCorrect":false},{"text":"Gyomei Himejima, Sanemi Shinazugawa, Muichiro Tokito, and Genya Shinazugawa","isCorrect":true},{"text":"Tengen Uzui, Kyojuro Rengoku, Tanjiro Kamado, and Zenitsu Agatsuma","isCorrect":false},{"text":"Obanai Iguro, Mitsuri Kanroji, Tanjiro Kamado, and Inosuke Hashibira","isCorrect":false}]'::jsonb,
  'The battle against Upper Moon One Kokushibo required four fighters: Stone Hashira Gyomei Himejima, Wind Hashira Sanemi Shinazugawa, Mist Hashira Muichiro Tokito, and Genya Shinazugawa. It was one of the most devastating battles, showcasing Kokushibo''s overwhelming power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the correct order of the Demon Slayer Corps ranking system from lowest to highest?',
  'multiple_choice',
  'hard',
  '[{"text":"Kinoe, Kinoto, Hinoe, Hinoto, Tsuchinoe, Tsuchinoto, Kanoe, Kanoto, Mizunoe, Mizunoto","isCorrect":false},{"text":"Mizunoto, Mizunoe, Kanoto, Kanoe, Tsuchinoto, Tsuchinoe, Hinoto, Hinoe, Kinoto, Kinoe","isCorrect":true},{"text":"Mizunoe, Mizunoto, Kanoe, Kanoto, Tsuchinoe, Tsuchinoto, Hinoe, Hinoto, Kinoe, Kinoto","isCorrect":false},{"text":"Kinoto, Kinoe, Hinoto, Hinoe, Tsuchinoto, Tsuchinoe, Kanoto, Kanoe, Mizunoto, Mizunoe","isCorrect":false}]'::jsonb,
  'The Demon Slayer Corps uses a ten-level ranking system based on the Heavenly Stems (Jikkan). From lowest to highest: Mizunoto, Mizunoe, Kanoto, Kanoe, Tsuchinoto, Tsuchinoe, Hinoto, Hinoe, Kinoto, and Kinoe. New slayers start at Mizunoto after passing Final Selection.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Muzan''s blood curse and how does it control demons?',
  'multiple_choice',
  'hard',
  '[{"text":"It allows him to read all demons'' minds at any time","isCorrect":false},{"text":"Demons who speak Muzan''s name or reveal information about him can be destroyed by the curse in his blood","isCorrect":true},{"text":"It forces demons to return to Muzan every full moon","isCorrect":false},{"text":"It gives Muzan the ability to control demons like puppets at will","isCorrect":false}]'::jsonb,
  'Muzan''s blood contains a powerful curse. Demons who have received his blood are unable to speak his name or divulge critical information about him to others — doing so triggers the curse, which can destroy the demon from within. This is how Muzan maintains control and secrecy over his demon army.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the Demon Slayer Mark, and what is the major drawback of manifesting one?',
  'multiple_choice',
  'hard',
  '[{"text":"A mark that makes the wielder immune to demon poison, but causes blindness over time","isCorrect":false},{"text":"A mark that greatly enhances physical abilities, but bearers typically die before reaching the age of 25","isCorrect":true},{"text":"A mark that allows communication with other slayers, but slowly erases memories","isCorrect":false},{"text":"A mark that increases sword sharpness, but causes the wielder''s sword to eventually shatter","isCorrect":false}]'::jsonb,
  'The Demon Slayer Mark is a special marking that appears on talented Demon Slayers, dramatically boosting their physical abilities, reaction speed, and strength. However, it comes at a terrible cost — every known bearer of the mark has died before turning 25, with Yoriichi Tsugikuni being the sole exception.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What special materials are Nichirin swords forged from, and why are they effective against demons?',
  'multiple_choice',
  'hard',
  '[{"text":"Scarlet Crimson Iron Sand and Scarlet Crimson Ore from mountains closest to the sun, which absorb sunlight","isCorrect":true},{"text":"Meteoric iron blessed by shrine priests during a solar eclipse","isCorrect":false},{"text":"Steel mixed with the blood of ancient Hashira warriors","isCorrect":false},{"text":"Enchanted copper mined from caves where demons were first sealed away","isCorrect":false}]'::jsonb,
  'Nichirin swords are forged from Scarlet Crimson Iron Sand and Scarlet Crimson Ore, materials found on high-altitude mountains that receive enormous amounts of sunlight year-round. Because these ores have absorbed sunlight, the blades are one of the few weapons capable of killing demons, essentially channeling the power of the sun.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the true origin of the Hinokami Kagura (Dance of the Fire God) that Tanjiro''s family passed down for generations?',
  'multiple_choice',
  'hard',
  '[{"text":"It was a Fire Breathing technique taught to charcoal burners by the Flame Hashira","isCorrect":false},{"text":"It is a corrupted form of Sun Breathing, passed from Yoriichi to the Kamado family ancestor and preserved as a ritual dance","isCorrect":true},{"text":"It was created by Tanjiro''s great-grandfather who was once a Demon Slayer","isCorrect":false},{"text":"It is an entirely original technique developed by the Kamado family''s charcoal-burning practice","isCorrect":false}]'::jsonb,
  'The Hinokami Kagura is actually a form of Sun Breathing, the original and most powerful Breathing Style. Yoriichi Tsugikuni befriended Tanjiro''s ancestor Sumiyoshi and showed him the forms of Sun Breathing. The Kamado family preserved these techniques across generations as a ceremonial dance performed each New Year, unknowingly keeping the lost art of Sun Breathing alive.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How does Nezuko eventually conquer the sun, and why does this make her so important to Muzan?',
  'multiple_choice',
  'hard',
  '[{"text":"She uses a special breathing technique to filter sunlight, making Muzan want to learn it","isCorrect":false},{"text":"She develops natural immunity to sunlight, making Muzan obsessed with devouring her to gain the same ability","isCorrect":true},{"text":"She wears enchanted armor forged from Nichirin ore that blocks sunlight","isCorrect":false},{"text":"She merges with a Hashira''s blood to neutralize sunlight, which Muzan wants to replicate","isCorrect":false}]'::jsonb,
  'Nezuko spontaneously develops complete immunity to sunlight, becoming the first demon in history to conquer the sun. This makes her Muzan''s ultimate target — for over a thousand years, Muzan has desperately sought a way to overcome his vulnerability to sunlight, and devouring Nezuko could grant him that ability, making him truly invincible.'
);

-- ============================================================
-- Dragon Ball Z
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'dragon-ball-z',
  'Dragon Ball Z',
  'Goku and his allies defend Earth against powerful villains, from Saiyans to gods, in the legendary martial arts anime.',
  '{"Shonen","Action","Martial Arts"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the main character in Dragon Ball Z?',
  'multiple_choice',
  'easy',
  '[{"text":"Vegeta","isCorrect":false},{"text":"Goku","isCorrect":true},{"text":"Piccolo","isCorrect":false},{"text":"Gohan","isCorrect":false}]'::jsonb,
  'Goku (also known as Son Goku) is the main protagonist of the entire Dragon Ball franchise, following his journey from childhood through adulthood.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What alien race does Goku belong to?',
  'multiple_choice',
  'easy',
  '[{"text":"Namekian","isCorrect":false},{"text":"Saiyan","isCorrect":true},{"text":"Frieza Race","isCorrect":false},{"text":"Human","isCorrect":false}]'::jsonb,
  'Goku is a Saiyan, a warrior race from Planet Vegeta. He was sent to Earth as a baby, which is why he grew up thinking he was human.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What are the magical orbs that grant wishes called?',
  'multiple_choice',
  'easy',
  '[{"text":"Chaos Emeralds","isCorrect":false},{"text":"Spirit Orbs","isCorrect":false},{"text":"Dragon Balls","isCorrect":true},{"text":"Wishing Stones","isCorrect":false}]'::jsonb,
  'The Dragon Balls are seven magical orbs that, when gathered together, summon a wish-granting dragon. They are the namesake of the entire series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Goku''s signature energy attack?',
  'multiple_choice',
  'easy',
  '[{"text":"Final Flash","isCorrect":false},{"text":"Special Beam Cannon","isCorrect":false},{"text":"Kamehameha","isCorrect":true},{"text":"Spirit Bomb","isCorrect":false}]'::jsonb,
  'The Kamehameha is Goku''s iconic energy wave attack, originally invented by Master Roshi. Goku learned it by watching Roshi perform it just once.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is Goku''s lifelong rival?',
  'multiple_choice',
  'easy',
  '[{"text":"Piccolo","isCorrect":false},{"text":"Frieza","isCorrect":false},{"text":"Tien","isCorrect":false},{"text":"Vegeta","isCorrect":true}]'::jsonb,
  'Vegeta, the Prince of all Saiyans, starts as a villain but becomes Goku''s greatest rival and eventual ally. Their rivalry is one of the most iconic in anime history.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What transformation makes a Saiyan''s hair turn golden?',
  'multiple_choice',
  'easy',
  '[{"text":"Kaioken","isCorrect":false},{"text":"Ultra Instinct","isCorrect":false},{"text":"Super Saiyan","isCorrect":true},{"text":"Great Ape","isCorrect":false}]'::jsonb,
  'The Super Saiyan transformation turns a Saiyan''s hair golden and their eyes green. Goku was the first to achieve this form in over a thousand years, triggered by Frieza''s actions on Planet Namek.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Goku''s oldest son?',
  'multiple_choice',
  'easy',
  '[{"text":"Goten","isCorrect":false},{"text":"Trunks","isCorrect":false},{"text":"Gohan","isCorrect":true},{"text":"Pan","isCorrect":false}]'::jsonb,
  'Gohan is Goku''s first son, named after Goku''s adoptive grandfather. He is one of the most powerful characters in the series and plays a pivotal role in the Cell Saga.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the dragon summoned by the Dragon Balls on Earth?',
  'multiple_choice',
  'easy',
  '[{"text":"Porunga","isCorrect":false},{"text":"Shenron","isCorrect":true},{"text":"Super Shenron","isCorrect":false},{"text":"Omega Shenron","isCorrect":false}]'::jsonb,
  'Shenron is the magical dragon summoned by Earth''s Dragon Balls. He can grant wishes within his power, which is limited by the abilities of his creator, Dende (and formerly Kami).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is the galactic Emperor who destroyed Planet Vegeta?',
  'multiple_choice',
  'easy',
  '[{"text":"Cell","isCorrect":false},{"text":"Beerus","isCorrect":false},{"text":"Frieza","isCorrect":true},{"text":"Majin Buu","isCorrect":false}]'::jsonb,
  'Frieza is the tyrannical Emperor of the Universe who destroyed Planet Vegeta and nearly wiped out the entire Saiyan race out of fear that a Super Saiyan would one day rise to challenge him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Vegeta''s royal status?',
  'multiple_choice',
  'easy',
  '[{"text":"King of all Saiyans","isCorrect":false},{"text":"Prince of all Saiyans","isCorrect":true},{"text":"Emperor of all Saiyans","isCorrect":false},{"text":"General of all Saiyans","isCorrect":false}]'::jsonb,
  'Vegeta is the Prince of all Saiyans, son of King Vegeta. He frequently reminds others of his royal heritage, and his pride as a Saiyan prince is central to his character.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the technique Goku uses to teleport instantly?',
  'multiple_choice',
  'medium',
  '[{"text":"Solar Flare","isCorrect":false},{"text":"Instant Transmission","isCorrect":true},{"text":"Afterimage Technique","isCorrect":false},{"text":"Kai Kai","isCorrect":false}]'::jsonb,
  'Instant Transmission (Shunkan Ido) allows Goku to teleport anywhere instantly by locking onto a person''s energy signature (ki). He learned it from the Yardrats after escaping Planet Namek.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who defeats Cell in the Cell Games?',
  'multiple_choice',
  'medium',
  '[{"text":"Goku","isCorrect":false},{"text":"Vegeta","isCorrect":false},{"text":"Gohan","isCorrect":true},{"text":"Trunks","isCorrect":false}]'::jsonb,
  'Gohan defeats Cell after ascending to Super Saiyan 2. His rage was triggered when Cell crushed Android 16, and he ultimately destroyed Cell with a one-handed Father-Son Kamehameha.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Vegeta''s most iconic signature attack?',
  'multiple_choice',
  'medium',
  '[{"text":"Big Bang Attack","isCorrect":false},{"text":"Final Flash","isCorrect":true},{"text":"Destructo Disc","isCorrect":false},{"text":"Masenko","isCorrect":false}]'::jsonb,
  'The Final Flash is Vegeta''s most powerful and iconic attack. He famously used it against Perfect Cell during the Cell Saga, unleashing a massive beam of energy after a dramatic charge-up.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is unique about the Hyperbolic Time Chamber?',
  'multiple_choice',
  'medium',
  '[{"text":"It multiplies gravity by 100 times","isCorrect":false},{"text":"One day outside equals one year inside","isCorrect":true},{"text":"It can only be used by Saiyans","isCorrect":false},{"text":"It heals all injuries instantly","isCorrect":false}]'::jsonb,
  'The Hyperbolic Time Chamber (Room of Spirit and Time) is a special dimension where one day in the outside world equals a full year inside. The Z Fighters use it to train intensively before major battles.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the fusion technique that uses special earrings?',
  'multiple_choice',
  'medium',
  '[{"text":"Fusion Dance","isCorrect":false},{"text":"Metamoran Fusion","isCorrect":false},{"text":"Potara Fusion","isCorrect":true},{"text":"Namekian Fusion","isCorrect":false}]'::jsonb,
  'Potara Fusion uses the Potara earrings worn by the Supreme Kais. When two people each wear one earring on opposite ears, they fuse together. Goku and Vegeta used this to become Vegito.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is the Supreme Kai of Universe 7?',
  'multiple_choice',
  'medium',
  '[{"text":"Old Kai","isCorrect":false},{"text":"Shin","isCorrect":true},{"text":"Zamasu","isCorrect":false},{"text":"Kibito","isCorrect":false}]'::jsonb,
  'Shin is the Supreme Kai of Universe 7. He first appears during the Buu Saga, initially in disguise as a contestant in the World Martial Arts Tournament, and reveals the threat of Majin Buu.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Goku and Vegeta''s fusion when they use the Fusion Dance?',
  'multiple_choice',
  'medium',
  '[{"text":"Vegito","isCorrect":false},{"text":"Gotenks","isCorrect":false},{"text":"Gogeta","isCorrect":true},{"text":"Kefla","isCorrect":false}]'::jsonb,
  'Gogeta is the fusion of Goku and Vegeta using the Metamoran Fusion Dance technique. Unlike Vegito (Potara Fusion), Gogeta requires the two fighters to perform a perfectly synchronized dance.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which android becomes a member of the Z Fighters?',
  'multiple_choice',
  'medium',
  '[{"text":"Android 16","isCorrect":false},{"text":"Android 17","isCorrect":false},{"text":"Android 18","isCorrect":true},{"text":"Android 19","isCorrect":false}]'::jsonb,
  'Android 18 joins the Z Fighters after being freed from Cell. She marries Krillin and they have a daughter named Marron. She also competes in the Tournament of Power in Dragon Ball Super.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Piccolo''s home planet?',
  'multiple_choice',
  'medium',
  '[{"text":"Planet Vegeta","isCorrect":false},{"text":"Planet Yardrat","isCorrect":false},{"text":"Planet Namek","isCorrect":true},{"text":"Planet Kanassa","isCorrect":false}]'::jsonb,
  'Piccolo is a Namekian, originating from Planet Namek. The Namek Saga revolves around the Z Fighters traveling to Namek to use its Dragon Balls, created by the Namekian elder Guru.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who trained Goku in the afterlife and taught him the Spirit Bomb technique?',
  'multiple_choice',
  'medium',
  '[{"text":"Master Roshi","isCorrect":false},{"text":"Whis","isCorrect":false},{"text":"King Kai","isCorrect":true},{"text":"Kami","isCorrect":false}]'::jsonb,
  'King Kai (North Kai) trained Goku on his small planet at the end of Snake Way. He taught Goku the Kaioken technique and the Spirit Bomb (Genki Dama), which gathers energy from all living things.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Goku''s Saiyan birth name?',
  'multiple_choice',
  'hard',
  '[{"text":"Bardock","isCorrect":false},{"text":"Raditz","isCorrect":false},{"text":"Kakarot","isCorrect":true},{"text":"Turles","isCorrect":false}]'::jsonb,
  'Goku''s Saiyan birth name is Kakarot. He was given the name ''Son Goku'' by his adoptive grandfather Gohan on Earth. Vegeta almost exclusively calls him Kakarot throughout the series as a matter of Saiyan pride.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the multi-universe tournament in Dragon Ball Super?',
  'multiple_choice',
  'hard',
  '[{"text":"Cell Games","isCorrect":false},{"text":"World Martial Arts Tournament","isCorrect":false},{"text":"Tournament of Power","isCorrect":true},{"text":"Tournament of Destroyers","isCorrect":false}]'::jsonb,
  'The Tournament of Power is a battle royale between eight universes in Dragon Ball Super, organized by the Grand Zeno. The losing universes face erasure from existence, raising the stakes to the highest level in the series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What form does Goku achieve during the Tournament of Power in Dragon Ball Super?',
  'multiple_choice',
  'hard',
  '[{"text":"Super Saiyan Blue Evolution","isCorrect":false},{"text":"Super Saiyan 4","isCorrect":false},{"text":"Ultra Instinct","isCorrect":true},{"text":"Super Saiyan God","isCorrect":false}]'::jsonb,
  'Ultra Instinct is a technique that allows the body to react and fight independently of conscious thought. Goku first triggers it against Jiren and eventually masters it in the climax of the Tournament of Power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is the angel attendant of Universe 7''s God of Destruction?',
  'multiple_choice',
  'hard',
  '[{"text":"Vados","isCorrect":false},{"text":"Whis","isCorrect":true},{"text":"Merus","isCorrect":false},{"text":"Grand Priest","isCorrect":false}]'::jsonb,
  'Whis is the angel attendant and martial arts teacher of Beerus, the God of Destruction of Universe 7. He is the son of the Grand Priest and trained both Goku and Vegeta in god-level techniques.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the God of Destruction of Universe 7?',
  'multiple_choice',
  'hard',
  '[{"text":"Champa","isCorrect":false},{"text":"Beerus","isCorrect":true},{"text":"Belmod","isCorrect":false},{"text":"Sidra","isCorrect":false}]'::jsonb,
  'Beerus is the God of Destruction of Universe 7, introduced in Dragon Ball Super. He is modeled after an Egyptian Sphynx cat and is one of the most powerful beings in the multiverse. His twin brother Champa is the God of Destruction of Universe 6.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'In his original appearance, what is Frieza''s final and most powerful transformation called?',
  'multiple_choice',
  'hard',
  '[{"text":"Second Form","isCorrect":false},{"text":"Mecha Frieza","isCorrect":false},{"text":"Final Form","isCorrect":true},{"text":"Golden Frieza","isCorrect":false}]'::jsonb,
  'Frieza''s Final Form (also called his True Form) is his fourth and original transformation on Planet Namek. Unlike his other forms, which suppress his power, his Final Form is his natural state. Golden Frieza came much later in Dragon Ball Super.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the technique Tien uses to hold Semi-Perfect Cell at bay?',
  'multiple_choice',
  'hard',
  '[{"text":"Dodon Ray","isCorrect":false},{"text":"Volleyball Fist","isCorrect":false},{"text":"Tri-Beam","isCorrect":true},{"text":"Solar Flare","isCorrect":false}]'::jsonb,
  'Tien uses the Tri-Beam (Kikoho) repeatedly to hold Semi-Perfect Cell in place, buying time for Android 18 to escape. This is one of Tien''s most heroic moments, as the technique drains his own life force with each use.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is the mortal from Universe 11 said to be so strong that even a God of Destruction cannot defeat him?',
  'multiple_choice',
  'hard',
  '[{"text":"Hit","isCorrect":false},{"text":"Toppo","isCorrect":false},{"text":"Jiren","isCorrect":true},{"text":"Broly","isCorrect":false}]'::jsonb,
  'Jiren from Universe 11 is described as a mortal whose strength surpasses that of a God of Destruction. He is the main antagonist of the Tournament of Power arc and pushes Goku to achieve Ultra Instinct.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Vegeta''s power-up form that serves as his counterpart to Goku''s Ultra Instinct?',
  'multiple_choice',
  'hard',
  '[{"text":"Super Saiyan Blue Evolution","isCorrect":false},{"text":"Ultra Ego","isCorrect":true},{"text":"Super Saiyan Royal Blue","isCorrect":false},{"text":"Mega Instinct","isCorrect":false}]'::jsonb,
  'Ultra Ego is Vegeta''s transformation achieved through training with Beerus, the God of Destruction. While Ultra Instinct focuses on dodging and defense, Ultra Ego grows stronger the more damage Vegeta takes, reflecting the mindset of a Destroyer.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What wish does Krillin make to Shenron regarding the androids after Cell''s defeat?',
  'multiple_choice',
  'hard',
  '[{"text":"To make the androids fully human","isCorrect":false},{"text":"To erase the androids from existence","isCorrect":false},{"text":"To remove the bombs inside Android 17 and 18","isCorrect":true},{"text":"To restore Android 16 back to life","isCorrect":false}]'::jsonb,
  'After Cell''s defeat, Krillin uses a wish on Shenron to remove the self-destruct bombs planted inside Android 17 and 18 by Dr. Gero. This act of kindness, driven by Krillin''s feelings for Android 18, eventually leads to their marriage.'
);

-- ============================================================
-- Jujutsu Kaisen
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'jujutsu-kaisen',
  'Jujutsu Kaisen',
  'Yuji Itadori joins a secret world of Jujutsu Sorcerers after swallowing a cursed finger of the King of Curses, Ryomen Sukuna.',
  '{"Shonen","Action","Supernatural"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the main character in Jujutsu Kaisen?',
  'multiple_choice',
  'easy',
  '[{"text":"Yuji Itadori","isCorrect":true},{"text":"Megumi Fushiguro","isCorrect":false},{"text":"Tanjiro Kamado","isCorrect":false},{"text":"Yuta Okkotsu","isCorrect":false}]'::jsonb,
  'Yuji Itadori is the protagonist of Jujutsu Kaisen. He is a high school student with superhuman physical abilities who becomes entangled in the world of jujutsu sorcerers after swallowing a cursed object.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What does Yuji swallow that completely changes his life?',
  'multiple_choice',
  'easy',
  '[{"text":"A cursed sword","isCorrect":false},{"text":"Sukuna''s finger","isCorrect":true},{"text":"A demon''s eye","isCorrect":false},{"text":"A spirit orb","isCorrect":false}]'::jsonb,
  'Yuji swallows one of Ryomen Sukuna''s fingers — a special grade cursed object — to save his friends from a cursed spirit. This causes Sukuna to incarnate within his body, setting the entire story in motion.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who is known as the King of Curses?',
  'multiple_choice',
  'easy',
  '[{"text":"Satoru Gojo","isCorrect":false},{"text":"Kenjaku","isCorrect":false},{"text":"Ryomen Sukuna","isCorrect":true},{"text":"Suguru Geto","isCorrect":false}]'::jsonb,
  'Ryomen Sukuna is the King of Curses, an ancient and overwhelmingly powerful cursed spirit from over a thousand years ago. He is considered the most powerful curse to have ever existed.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What school does Yuji attend for jujutsu training?',
  'multiple_choice',
  'easy',
  '[{"text":"Kyoto Jujutsu High","isCorrect":false},{"text":"Tokyo Jujutsu High","isCorrect":true},{"text":"U.A. High School","isCorrect":false},{"text":"Shinra Academy","isCorrect":false}]'::jsonb,
  'Yuji enrolls at Tokyo Jujutsu High (formally known as Tokyo Metropolitan Curse Technical College) to train as a jujutsu sorcerer under the guidance of Satoru Gojo while consuming all of Sukuna''s fingers before being executed.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who is Yuji''s blindfolded teacher?',
  'multiple_choice',
  'easy',
  '[{"text":"Kento Nanami","isCorrect":false},{"text":"Masamichi Yaga","isCorrect":false},{"text":"Suguru Geto","isCorrect":false},{"text":"Satoru Gojo","isCorrect":true}]'::jsonb,
  'Satoru Gojo is the blindfolded teacher of the first-year students at Tokyo Jujutsu High. He covers his eyes because his Six Eyes ability processes too much visual information otherwise. He is considered the strongest jujutsu sorcerer alive.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What are the evil supernatural beings in Jujutsu Kaisen called?',
  'multiple_choice',
  'easy',
  '[{"text":"Demons","isCorrect":false},{"text":"Hollows","isCorrect":false},{"text":"Cursed Spirits","isCorrect":true},{"text":"Titans","isCorrect":false}]'::jsonb,
  'The supernatural antagonists in Jujutsu Kaisen are called Cursed Spirits (or simply Curses). They are born from the negative emotions of humans such as fear, hatred, and sadness, and they manifest as dangerous creatures.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who are Yuji''s two classmates as first-year students at Tokyo Jujutsu High?',
  'multiple_choice',
  'easy',
  '[{"text":"Maki Zenin and Toge Inumaki","isCorrect":false},{"text":"Megumi Fushiguro and Nobara Kugisaki","isCorrect":true},{"text":"Panda and Yuta Okkotsu","isCorrect":false},{"text":"Aoi Todo and Mai Zenin","isCorrect":false}]'::jsonb,
  'Megumi Fushiguro and Nobara Kugisaki are Yuji''s fellow first-year students at Tokyo Jujutsu High. Together, the three form the core trio of the series, each with distinct personalities and fighting styles.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the energy source that jujutsu sorcerers use to fuel their abilities?',
  'multiple_choice',
  'easy',
  '[{"text":"Chakra","isCorrect":false},{"text":"Nen","isCorrect":false},{"text":"Reiatsu","isCorrect":false},{"text":"Cursed Energy","isCorrect":true}]'::jsonb,
  'Cursed Energy is the fundamental power source in Jujutsu Kaisen. It flows from negative emotions and is harnessed by jujutsu sorcerers to perform cursed techniques and combat cursed spirits.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Why is Yuji sentenced to death by the jujutsu higher-ups?',
  'multiple_choice',
  'easy',
  '[{"text":"He destroyed a sacred temple","isCorrect":false},{"text":"He is the vessel of Sukuna","isCorrect":true},{"text":"He refused to follow orders","isCorrect":false},{"text":"He attacked another sorcerer","isCorrect":false}]'::jsonb,
  'The jujutsu higher-ups sentence Yuji to death because he became the host/vessel of Ryomen Sukuna after swallowing his finger. Harboring the King of Curses inside his body makes him an existential threat in their eyes.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Yuji Itadori''s primary fighting style?',
  'multiple_choice',
  'easy',
  '[{"text":"Swordsmanship","isCorrect":false},{"text":"Long-range cursed energy blasts","isCorrect":false},{"text":"Close combat martial arts enhanced with cursed energy","isCorrect":true},{"text":"Shikigami summoning","isCorrect":false}]'::jsonb,
  'Yuji primarily fights using martial arts and close-quarters combat enhanced with cursed energy. His exceptional physical strength and speed, combined with the ability to infuse his punches with cursed energy (Divergent Fist), make him a formidable hand-to-hand fighter.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Satoru Gojo''s cursed technique called?',
  'multiple_choice',
  'medium',
  '[{"text":"Ten Shadows Technique","isCorrect":false},{"text":"Limitless","isCorrect":true},{"text":"Straw Doll Technique","isCorrect":false},{"text":"Boogie Woogie","isCorrect":false}]'::jsonb,
  'Gojo''s cursed technique is called Limitless (Mukagen). It grants him control over space at an atomic level, with Infinity being its neutral application that creates an infinite distance between him and anything that tries to touch him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of Megumi Fushiguro''s inherited cursed technique?',
  'multiple_choice',
  'medium',
  '[{"text":"Cursed Speech","isCorrect":false},{"text":"Blood Manipulation","isCorrect":false},{"text":"Ten Shadows Technique","isCorrect":true},{"text":"Projection Sorcery","isCorrect":false}]'::jsonb,
  'Megumi uses the Ten Shadows Technique, an inherited technique of the Zenin family that allows him to summon up to ten different shikigami using shadows. It is considered one of the most powerful inherited techniques in the jujutsu world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is a Domain Expansion in Jujutsu Kaisen?',
  'multiple_choice',
  'medium',
  '[{"text":"A barrier that heals all allies inside it","isCorrect":false},{"text":"A technique that doubles the user''s cursed energy","isCorrect":false},{"text":"The pinnacle technique that manifests the user''s innate domain as a real space with guaranteed-hit attacks","isCorrect":true},{"text":"A method to permanently seal a cursed spirit","isCorrect":false}]'::jsonb,
  'A Domain Expansion is the most advanced and powerful technique a jujutsu sorcerer can perform. It constructs the user''s innate domain as an actual physical space, trapping opponents inside where the user''s attacks become unavoidable guaranteed hits.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Which cursed spirit is most closely associated with manipulating human emotions and transfiguring souls during the Shibuya Incident arc?',
  'multiple_choice',
  'medium',
  '[{"text":"Jogo","isCorrect":false},{"text":"Hanami","isCorrect":false},{"text":"Dagon","isCorrect":false},{"text":"Mahito","isCorrect":true}]'::jsonb,
  'Mahito is the special grade cursed spirit born from human hatred toward other humans. His Idle Transfiguration technique allows him to reshape souls (and therefore bodies), making him one of the most dangerous and personally antagonistic cursed spirits in the Shibuya Incident arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Nobara Kugisaki''s cursed technique?',
  'multiple_choice',
  'medium',
  '[{"text":"Cursed Speech","isCorrect":false},{"text":"Straw Doll Technique","isCorrect":true},{"text":"Construction","isCorrect":false},{"text":"Star Rage","isCorrect":false}]'::jsonb,
  'Nobara''s cursed technique is the Straw Doll Technique (Shinso Sojutsu). She uses a hammer, nails, and a straw doll to attack opponents through resonance — driving nails into a doll linked to the target to inflict damage from any distance.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is a Binding Vow in Jujutsu Kaisen?',
  'multiple_choice',
  'medium',
  '[{"text":"A vow to never use cursed energy again","isCorrect":false},{"text":"A pact that exchanges one condition for another to increase power or impose restrictions","isCorrect":true},{"text":"A ritual to summon a shikigami permanently","isCorrect":false},{"text":"A contract between a sorcerer and a cursed spirit to share power","isCorrect":false}]'::jsonb,
  'A Binding Vow is a pact or contract in jujutsu that trades one thing for another. By accepting a restriction or disadvantage, a sorcerer can gain increased power elsewhere. They are enforced by cursed energy itself and breaking one has severe consequences.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who is the true identity of the person inhabiting Suguru Geto''s body and leading the cursed spirits?',
  'multiple_choice',
  'medium',
  '[{"text":"Ryomen Sukuna","isCorrect":false},{"text":"Tengen","isCorrect":false},{"text":"Kenjaku","isCorrect":true},{"text":"Toji Fushiguro","isCorrect":false}]'::jsonb,
  'Kenjaku is an ancient sorcerer who has survived for over a thousand years by transferring his brain into other people''s bodies. He took over the body of Suguru Geto after Geto''s death and uses it to orchestrate his plans, appearing as ''Pseudo-Geto'' to those who know the truth.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What happens to Gojo during the Shibuya Incident?',
  'multiple_choice',
  'medium',
  '[{"text":"He loses his Six Eyes","isCorrect":false},{"text":"He is sealed inside the Prison Realm","isCorrect":true},{"text":"He is killed by Sukuna","isCorrect":false},{"text":"He is exiled to the cursed spirit realm","isCorrect":false}]'::jsonb,
  'During the Shibuya Incident, Kenjaku (in Geto''s body) successfully seals Gojo inside the Prison Realm, a special grade cursed object that traps its target in an inescapable dimension. This was the primary objective of the entire Shibuya Incident.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the highest and most powerful classification grade for sorcerers and cursed spirits?',
  'multiple_choice',
  'medium',
  '[{"text":"Grade 1","isCorrect":false},{"text":"Supreme Grade","isCorrect":false},{"text":"Special Grade","isCorrect":true},{"text":"S-Rank","isCorrect":false}]'::jsonb,
  'Special Grade is the highest classification for both jujutsu sorcerers and cursed spirits. It denotes power that exceeds the standard grading scale entirely. Special grade entities like Gojo, Yuta, Sukuna, and Mahito are considered catastrophically powerful.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Aoi Todo''s cursed technique called, and what does it do?',
  'multiple_choice',
  'medium',
  '[{"text":"Boogie Woogie — swaps the positions of two targets by clapping","isCorrect":true},{"text":"Black Flash — concentrates cursed energy into a devastating punch","isCorrect":false},{"text":"Ratio Technique — creates a weak point on any target he touches","isCorrect":false},{"text":"Star Rage — launches explosive cursed energy projectiles","isCorrect":false}]'::jsonb,
  'Todo''s cursed technique is Boogie Woogie. By clapping his hands, he can instantly swap the positions of two objects or people that have sufficient cursed energy. This makes him unpredictable in combat and an exceptional tactical fighter.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of Gojo''s Domain Expansion?',
  'multiple_choice',
  'hard',
  '[{"text":"Chimera Shadow Garden","isCorrect":false},{"text":"Malevolent Shrine","isCorrect":false},{"text":"Unlimited Void","isCorrect":true},{"text":"Horizon of the Captivating Skandha","isCorrect":false}]'::jsonb,
  'Gojo''s Domain Expansion is called Unlimited Void (Muryokusho). It floods the target''s mind with infinite information and stimuli simultaneously, effectively paralyzing them as their brain tries to process everything and nothing at the same time.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What are the names of Sukuna''s primary slashing cursed techniques?',
  'multiple_choice',
  'hard',
  '[{"text":"Piercing Blood and Supernova","isCorrect":false},{"text":"Dismantle and Cleave","isCorrect":true},{"text":"Blade Dance and Cross Slash","isCorrect":false},{"text":"Razor Edge and Split","isCorrect":false}]'::jsonb,
  'Sukuna''s cursed technique includes two primary slashing attacks: Dismantle, which cuts through objects without cursed energy, and Cleave, which adapts to the toughness and cursed energy of the target to cut them in one strike. He also possesses a fire-based technique called Open (Fuga).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Kenjaku''s ultimate goal involving Tengen and the population of Japan?',
  'multiple_choice',
  'hard',
  '[{"text":"To absorb Tengen''s immortality and become a god","isCorrect":false},{"text":"To merge all of Japan''s population with Tengen to force humanity''s evolution","isCorrect":true},{"text":"To use Tengen to resurrect Sukuna at full power","isCorrect":false},{"text":"To destroy Tengen''s barriers and flood the world with cursed spirits","isCorrect":false}]'::jsonb,
  'Kenjaku''s ultimate goal is to merge the entire non-sorcerer population of Japan with the immortal being Tengen, creating a new form of evolved humanity. The Culling Game serves as a necessary step in this plan by optimizing cursed energy across the population.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the Culling Game?',
  'multiple_choice',
  'hard',
  '[{"text":"A tournament between jujutsu schools to determine the strongest sorcerer","isCorrect":false},{"text":"A deadly competition orchestrated by Kenjaku where awakened sorcerers must fight and earn points or die","isCorrect":true},{"text":"A ritual to determine the next vessel for Sukuna","isCorrect":false},{"text":"A series of exorcism missions assigned by the jujutsu higher-ups","isCorrect":false}]'::jsonb,
  'The Culling Game is a deadly battle royale set up by Kenjaku across multiple colonies in Japan. Awakened sorcerers — both modern and reincarnated ancient ones — are forced to fight and accumulate points. Failure to earn points within a set period results in the removal of the participant''s cursed technique, which effectively means death.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of Megumi Fushiguro''s Domain Expansion?',
  'multiple_choice',
  'hard',
  '[{"text":"Unlimited Void","isCorrect":false},{"text":"Self-Embodiment of Perfection","isCorrect":false},{"text":"Chimera Shadow Garden","isCorrect":true},{"text":"Coffin of the Iron Mountain","isCorrect":false}]'::jsonb,
  'Megumi''s Domain Expansion is Chimera Shadow Garden. It floods the surrounding area with dense shadows, allowing Megumi to summon multiple shikigami simultaneously and use the shadows themselves as weapons. Though incomplete for much of the series, it remains a powerful technique.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the Six Eyes ability that Gojo possesses, and what does it enable?',
  'multiple_choice',
  'hard',
  '[{"text":"It lets him see the future and predict attacks","isCorrect":false},{"text":"It allows him to perceive cursed energy at an atomic level and use Limitless with virtually zero energy cost","isCorrect":true},{"text":"It grants him six additional cursed techniques from past sorcerers","isCorrect":false},{"text":"It enables him to see through any barrier or concealment technique","isCorrect":false}]'::jsonb,
  'The Six Eyes (Rikugan) is an ocular jujutsu trait that allows Gojo to perceive cursed energy at an atomic level with extraordinary precision. Combined with the Limitless technique, the Six Eyes reduce the cursed energy cost to near zero, effectively giving Gojo limitless stamina for his abilities.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who was Gojo''s best friend who later became a curse user and was eventually killed?',
  'multiple_choice',
  'hard',
  '[{"text":"Kento Nanami","isCorrect":false},{"text":"Aoi Todo","isCorrect":false},{"text":"Suguru Geto","isCorrect":true},{"text":"Toji Fushiguro","isCorrect":false}]'::jsonb,
  'Suguru Geto was Gojo''s best friend and fellow student at Tokyo Jujutsu High. They were once considered the strongest duo. However, Geto grew disillusioned with protecting non-sorcerers and defected, becoming a curse user who sought to eliminate all non-sorcerers. He was eventually killed, and his body was later taken over by Kenjaku.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is a Reverse Cursed Technique?',
  'multiple_choice',
  'hard',
  '[{"text":"A technique that reverses the effect of an opponent''s cursed technique","isCorrect":false},{"text":"A technique that multiplies cursed energy by itself to create positive energy for healing","isCorrect":true},{"text":"A technique that reverses time within a localized area","isCorrect":false},{"text":"A technique that converts cursed spirits back into human souls","isCorrect":false}]'::jsonb,
  'Reverse Cursed Technique works by multiplying negative cursed energy by itself (negative times negative equals positive) to generate positive energy. This positive energy can be used for healing, which normal cursed energy cannot do. Very few sorcerers can use it — notably Gojo and Sukuna can use it instinctively.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of Sukuna''s Domain Expansion?',
  'multiple_choice',
  'hard',
  '[{"text":"Unlimited Void","isCorrect":false},{"text":"Chimera Shadow Garden","isCorrect":false},{"text":"Womb Profusion","isCorrect":false},{"text":"Malevolent Shrine","isCorrect":true}]'::jsonb,
  'Sukuna''s Domain Expansion is Malevolent Shrine (Fukuma Mizushi). Uniquely among Domain Expansions, it does not create a separate enclosed space — instead it manifests as a Buddhist shrine that applies its guaranteed-hit effect to a vast open area, which is considered a more refined and advanced application of Domain Expansion.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the significance of Sukuna having exactly 20 fingers?',
  'multiple_choice',
  'hard',
  '[{"text":"Each finger represents a different cursed technique he mastered in life","isCorrect":false},{"text":"His power was split into 20 indestructible cursed fingers after death, and consuming all 20 would fully revive him","isCorrect":true},{"text":"He had four arms in his original form, giving him a natural advantage in combat","isCorrect":false},{"text":"The 20 fingers correspond to 20 domain expansions he can deploy simultaneously","isCorrect":false}]'::jsonb,
  'After Sukuna''s death over a thousand years ago, his immense power could not be destroyed and was preserved in 20 indestructible cursed fingers (he originally had four arms, hence 20 fingers). These fingers are special grade cursed objects, and consuming all 20 would fully restore Sukuna to his peak power within his vessel.'
);

-- ============================================================
-- My Hero Academia
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'my-hero-academia',
  'My Hero Academia',
  'In a world where most people have superpowers called Quirks, Izuku Midoriya dreams of becoming the greatest hero despite being born without one.',
  '{"Shonen","Action","Superhero"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the main character in My Hero Academia?',
  'multiple_choice',
  'easy',
  '[{"text":"Izuku Midoriya","isCorrect":true},{"text":"Katsuki Bakugo","isCorrect":false},{"text":"Shoto Todoroki","isCorrect":false},{"text":"Tenya Iida","isCorrect":false}]'::jsonb,
  'Izuku Midoriya, also known by his hero name Deku, is the main protagonist of My Hero Academia.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the superpower system called in My Hero Academia?',
  'multiple_choice',
  'easy',
  '[{"text":"Stands","isCorrect":false},{"text":"Quirks","isCorrect":true},{"text":"Nen","isCorrect":false},{"text":"Jutsu","isCorrect":false}]'::jsonb,
  'In the world of My Hero Academia, superpowers are called Quirks. About 80% of the population is born with one.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who is the #1 hero and Deku''s idol?',
  'multiple_choice',
  'easy',
  '[{"text":"Endeavor","isCorrect":false},{"text":"Best Jeanist","isCorrect":false},{"text":"All Might","isCorrect":true},{"text":"Hawks","isCorrect":false}]'::jsonb,
  'All Might is the Symbol of Peace and the #1 ranked hero. He is Deku''s greatest inspiration and the reason Deku wants to become a hero.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the prestigious hero school that Deku attends?',
  'multiple_choice',
  'easy',
  '[{"text":"Shiketsu High School","isCorrect":false},{"text":"U.A. High School","isCorrect":true},{"text":"Ketsubutsu Academy","isCorrect":false},{"text":"Isamu Academy","isCorrect":false}]'::jsonb,
  'U.A. High School is the top hero academy in Japan and one of the most prestigious hero schools in the world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is All Might''s real name?',
  'multiple_choice',
  'easy',
  '[{"text":"Enji Todoroki","isCorrect":false},{"text":"Toshinori Yagi","isCorrect":true},{"text":"Keigo Takami","isCorrect":false},{"text":"Mirai Sasaki","isCorrect":false}]'::jsonb,
  'All Might''s true identity is Toshinori Yagi. He keeps a frail, skeletal true form hidden from the public after suffering a severe injury.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Bakugo''s Quirk?',
  'multiple_choice',
  'easy',
  '[{"text":"Hellflame","isCorrect":false},{"text":"Explosion","isCorrect":true},{"text":"Cremation","isCorrect":false},{"text":"Impact Recoil","isCorrect":false}]'::jsonb,
  'Bakugo''s Quirk is Explosion, which allows him to secrete nitroglycerin-like sweat from his palms and ignite it at will to create powerful explosions.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who is the main villain introduced in the first season of My Hero Academia?',
  'multiple_choice',
  'easy',
  '[{"text":"Stain","isCorrect":false},{"text":"Overhaul","isCorrect":false},{"text":"Tomura Shigaraki","isCorrect":true},{"text":"Dabi","isCorrect":false}]'::jsonb,
  'Tomura Shigaraki is the primary antagonist introduced during the USJ attack in Season 1. He leads the League of Villains.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Deku''s Quirk called?',
  'multiple_choice',
  'easy',
  '[{"text":"All For One","isCorrect":false},{"text":"One For All","isCorrect":true},{"text":"Full Cowling","isCorrect":false},{"text":"Super Strength","isCorrect":false}]'::jsonb,
  'Deku''s Quirk is called One For All, a powerful Quirk passed down to him by All Might. Full Cowling is a technique he uses to control it, not the Quirk itself.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What class is Deku assigned to at U.A. High School?',
  'multiple_choice',
  'easy',
  '[{"text":"Class 1-B","isCorrect":false},{"text":"Class 1-A","isCorrect":true},{"text":"Class 2-A","isCorrect":false},{"text":"Class 1-C","isCorrect":false}]'::jsonb,
  'Deku is a student in Class 1-A, the hero course class taught by Shota Aizawa (Eraser Head). Class 1-A is considered one of the top hero classes at U.A.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of Deku''s childhood friend and rival?',
  'multiple_choice',
  'easy',
  '[{"text":"Shoto Todoroki","isCorrect":false},{"text":"Eijiro Kirishima","isCorrect":false},{"text":"Tenya Iida","isCorrect":false},{"text":"Katsuki Bakugo","isCorrect":true}]'::jsonb,
  'Katsuki Bakugo has known Deku since childhood. Their relationship is complex -- Bakugo bullied Deku for being Quirkless but they eventually develop a deep mutual respect.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What makes One For All unique compared to most other Quirks?',
  'multiple_choice',
  'medium',
  '[{"text":"It can only be used once per day","isCorrect":false},{"text":"It can be passed from one person to another, stockpiling power with each generation","isCorrect":true},{"text":"It only activates during a full moon","isCorrect":false},{"text":"It requires a special device to activate","isCorrect":false}]'::jsonb,
  'One For All is a transferable Quirk that stockpiles power. Each successive user adds their own strength to it before passing it on, making it stronger with every generation.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who is the homeroom teacher of Class 1-A?',
  'multiple_choice',
  'medium',
  '[{"text":"Present Mic","isCorrect":false},{"text":"Midnight","isCorrect":false},{"text":"Shota Aizawa (Eraser Head)","isCorrect":true},{"text":"All Might","isCorrect":false}]'::jsonb,
  'Shota Aizawa, the pro hero known as Eraser Head, is the homeroom teacher of Class 1-A. His Quirk, Erasure, allows him to nullify others'' Quirks by looking at them.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Shoto Todoroki''s Quirk?',
  'multiple_choice',
  'medium',
  '[{"text":"Hellflame","isCorrect":false},{"text":"Half-Cold Half-Hot","isCorrect":true},{"text":"Cremation","isCorrect":false},{"text":"Ice Wall","isCorrect":false}]'::jsonb,
  'Todoroki''s Quirk is Half-Cold Half-Hot. He can generate ice from his right side and fire from his left side. He inherited aspects of both his father Endeavor''s and his mother''s Quirks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the villain organization led by Tomura Shigaraki?',
  'multiple_choice',
  'medium',
  '[{"text":"The Paranormal Liberation Front","isCorrect":false},{"text":"The Shie Hassaikai","isCorrect":false},{"text":"League of Villains","isCorrect":true},{"text":"The Meta Liberation Army","isCorrect":false}]'::jsonb,
  'The League of Villains is the criminal organization originally formed under All For One''s influence and later led by Shigaraki. It later merges with the Meta Liberation Army to form the Paranormal Liberation Front.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Tomura Shigaraki''s Quirk?',
  'multiple_choice',
  'medium',
  '[{"text":"Disintegration","isCorrect":false},{"text":"Decay","isCorrect":true},{"text":"Erosion","isCorrect":false},{"text":"Warp Gate","isCorrect":false}]'::jsonb,
  'Shigaraki''s Quirk is called Decay. It allows him to disintegrate anything he touches with all five fingers. As he grows stronger, the Quirk evolves to spread beyond direct contact.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who wins the U.A. Sports Festival tournament in Season 2?',
  'multiple_choice',
  'medium',
  '[{"text":"Izuku Midoriya","isCorrect":false},{"text":"Shoto Todoroki","isCorrect":false},{"text":"Katsuki Bakugo","isCorrect":true},{"text":"Fumikage Tokoyami","isCorrect":false}]'::jsonb,
  'Bakugo wins the Sports Festival tournament, but he is furious about the victory because Todoroki did not use his fire side in their final match, meaning Bakugo felt he did not earn a true win.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the hero killer who targets heroes he considers unworthy?',
  'multiple_choice',
  'medium',
  '[{"text":"Gentle Criminal","isCorrect":false},{"text":"Stain","isCorrect":true},{"text":"Muscular","isCorrect":false},{"text":"Moonfish","isCorrect":false}]'::jsonb,
  'Stain, whose real name is Chizome Akaguro, is the Hero Killer. He believes most pro heroes are fakes motivated by money and fame rather than true justice, and he targets those he deems unworthy.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Ochaco Uraraka''s Quirk?',
  'multiple_choice',
  'medium',
  '[{"text":"Levitation","isCorrect":false},{"text":"Telekinesis","isCorrect":false},{"text":"Zero Gravity","isCorrect":true},{"text":"Float","isCorrect":false}]'::jsonb,
  'Uraraka''s Quirk is Zero Gravity. She can make objects weightless by touching them with the pads on her fingertips. Using it too much on herself causes nausea.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who is the principal of U.A. High School?',
  'multiple_choice',
  'medium',
  '[{"text":"All Might","isCorrect":false},{"text":"Recovery Girl","isCorrect":false},{"text":"Nezu","isCorrect":true},{"text":"Gran Torino","isCorrect":false}]'::jsonb,
  'Nezu is the principal of U.A. High School. He is a rare case of an animal who developed a Quirk (High Specs), giving him superintelligence far beyond any human.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of All Might''s nemesis and the most powerful villain in the series?',
  'multiple_choice',
  'medium',
  '[{"text":"Tomura Shigaraki","isCorrect":false},{"text":"Stain","isCorrect":false},{"text":"Overhaul","isCorrect":false},{"text":"All For One","isCorrect":true}]'::jsonb,
  'All For One is the most dangerous villain in the series and All Might''s arch-nemesis. He can steal and redistribute Quirks, and he is the one who gave All Might the injury that limited his hero form.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'How many users of One For All were there before Deku?',
  'multiple_choice',
  'hard',
  '[{"text":"Six","isCorrect":false},{"text":"Seven","isCorrect":false},{"text":"Eight","isCorrect":true},{"text":"Nine","isCorrect":false}]'::jsonb,
  'There were eight users before Deku, making him the ninth holder of One For All. The first user was Yoichi Shigaraki, and the eighth was All Might.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is notable about the name of All For One''s Quirk?',
  'multiple_choice',
  'hard',
  '[{"text":"It changes name depending on which Quirk he last stole","isCorrect":false},{"text":"The Quirk shares the same name as the villain himself -- All For One","isCorrect":true},{"text":"It has no official name and is simply called ''the nameless Quirk''","isCorrect":false},{"text":"Its true name is Steal and Transfer","isCorrect":false}]'::jsonb,
  'The villain All For One is named after his own Quirk, which is also called All For One. This Quirk allows him to steal other people''s Quirks and give them to others, the inverse of One For All.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Endeavor''s real name?',
  'multiple_choice',
  'hard',
  '[{"text":"Enji Todoroki","isCorrect":true},{"text":"Keigo Takami","isCorrect":false},{"text":"Tsunagu Hakamata","isCorrect":false},{"text":"Shinya Kamihara","isCorrect":false}]'::jsonb,
  'Endeavor''s real name is Enji Todoroki. He is Shoto Todoroki''s father and was the #2 hero for most of his career before becoming #1 after All Might''s retirement.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What are the names of the Big Three at U.A. High School?',
  'multiple_choice',
  'hard',
  '[{"text":"Mirio Togata, Nejire Hado, and Tamaki Amajiki","isCorrect":true},{"text":"Mirio Togata, Nejire Hado, and Hitoshi Shinso","isCorrect":false},{"text":"Tamaki Amajiki, Nejire Hado, and Inasa Yoarashi","isCorrect":false},{"text":"Mirio Togata, Tamaki Amajiki, and Bibimi Kenranzaki","isCorrect":false}]'::jsonb,
  'The Big Three are the top three students at U.A.: Mirio Togata (Lemillion), Nejire Hado (Nejire Chan), and Tamaki Amajiki (Suneater). They are third-year students regarded as the strongest in the school.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Mirio Togata''s Quirk called?',
  'multiple_choice',
  'hard',
  '[{"text":"Phasing","isCorrect":false},{"text":"Permeation","isCorrect":true},{"text":"Intangibility","isCorrect":false},{"text":"Ghostwalk","isCorrect":false}]'::jsonb,
  'Mirio''s Quirk is called Permeation. It allows him to phase through solid matter. Despite being extremely difficult to control, Mirio mastered it to the point where he was considered the closest hero to surpassing All Might.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the government organization that oversees hero licensing and regulation?',
  'multiple_choice',
  'hard',
  '[{"text":"The Hero Association","isCorrect":false},{"text":"Hero Public Safety Commission","isCorrect":true},{"text":"The Pro Hero Bureau","isCorrect":false},{"text":"Quirk Regulatory Authority","isCorrect":false}]'::jsonb,
  'The Hero Public Safety Commission (HPSC) is the government body responsible for managing and regulating pro heroes, issuing hero licenses, and coordinating hero operations across Japan.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'After his injury from fighting All For One, what was approximately All Might''s daily time limit for maintaining his hero form?',
  'multiple_choice',
  'hard',
  '[{"text":"About 1 hour per day","isCorrect":false},{"text":"About 3 hours per day","isCorrect":true},{"text":"About 6 hours per day","isCorrect":false},{"text":"About 30 minutes per day","isCorrect":false}]'::jsonb,
  'After his devastating fight with All For One that destroyed his stomach and respiratory system, All Might could only maintain his muscular hero form for about 3 hours per day, and this time limit gradually decreased.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Eri''s Quirk and why is it significant to the villain Overhaul?',
  'multiple_choice',
  'hard',
  '[{"text":"Heal -- she can heal any wound, and Overhaul uses her blood to create healing serums","isCorrect":false},{"text":"Rewind -- she can revert a person''s body to a previous state, and Overhaul uses her to manufacture Quirk-destroying bullets","isCorrect":true},{"text":"Time Stop -- she can freeze time around her, and Overhaul uses her power to avoid capture","isCorrect":false},{"text":"Copy -- she can duplicate any Quirk, and Overhaul uses her to stockpile Quirks","isCorrect":false}]'::jsonb,
  'Eri''s Quirk is Rewind, which allows her to revert a living being''s body to a previous state. Overhaul (Kai Chisaki) exploited Eri by using her body to create bullets that could permanently destroy a person''s Quirk.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who was the original first user of One For All?',
  'multiple_choice',
  'hard',
  '[{"text":"Hikage Shinomori","isCorrect":false},{"text":"Daigoro Banjo","isCorrect":false},{"text":"Yoichi Shigaraki","isCorrect":true},{"text":"Nana Shimura","isCorrect":false}]'::jsonb,
  'Yoichi Shigaraki was the first holder of One For All. He was All For One''s younger brother who was thought to be Quirkless. When All For One forcibly gave him a stockpiling Quirk, it merged with a hidden transfer Quirk Yoichi already had, creating One For All.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the pro hero Hawks'' real name?',
  'multiple_choice',
  'hard',
  '[{"text":"Takami Keigo","isCorrect":false},{"text":"Keigo Takami","isCorrect":true},{"text":"Rumi Usagiyama","isCorrect":false},{"text":"Shinji Nishiya","isCorrect":false}]'::jsonb,
  'Hawks'' real name is Keigo Takami. He is the #2 ranked pro hero (later #1 in some rankings) known for his Fierce Wings Quirk. He works as a double agent infiltrating the villain side on behalf of the Hero Public Safety Commission.'
);

-- ============================================================
-- Naruto
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'naruto',
  'Naruto',
  'Follow Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage, the leader of his village.',
  '{"Shonen","Action","Adventure"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What village is Naruto from?',
  'multiple_choice',
  'easy',
  '[{"text":"Konohagakure (Hidden Leaf Village)","isCorrect":true},{"text":"Sunagakure (Hidden Sand Village)","isCorrect":false},{"text":"Kirigakure (Hidden Mist Village)","isCorrect":false},{"text":"Kumogakure (Hidden Cloud Village)","isCorrect":false}]'::jsonb,
  'Naruto Uzumaki was born and raised in Konohagakure, also known as the Hidden Leaf Village, which is the main setting of the series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who is Naruto''s sensei in Team 7?',
  'multiple_choice',
  'easy',
  '[{"text":"Might Guy","isCorrect":false},{"text":"Kakashi Hatake","isCorrect":true},{"text":"Asuma Sarutobi","isCorrect":false},{"text":"Kurenai Yuhi","isCorrect":false}]'::jsonb,
  'Kakashi Hatake is the jonin leader assigned to Team 7, which consists of Naruto, Sasuke, and Sakura.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the demon fox sealed inside Naruto?',
  'multiple_choice',
  'easy',
  '[{"text":"Shukaku","isCorrect":false},{"text":"Matatabi","isCorrect":false},{"text":"Kurama (Nine-Tails)","isCorrect":true},{"text":"Son Goku","isCorrect":false}]'::jsonb,
  'The Nine-Tailed Fox, later revealed to be named Kurama, was sealed inside Naruto by his father Minato Namikaze on the day of his birth.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who is Naruto''s rival and teammate in Team 7?',
  'multiple_choice',
  'easy',
  '[{"text":"Neji Hyuga","isCorrect":false},{"text":"Shikamaru Nara","isCorrect":false},{"text":"Sasuke Uchiha","isCorrect":true},{"text":"Kiba Inuzuka","isCorrect":false}]'::jsonb,
  'Sasuke Uchiha is Naruto''s rival and fellow Team 7 member. Their rivalry and bond is one of the central themes of the entire series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Naruto''s signature jutsu?',
  'multiple_choice',
  'easy',
  '[{"text":"Fireball Jutsu","isCorrect":false},{"text":"Shadow Clone Jutsu","isCorrect":true},{"text":"Substitution Jutsu","isCorrect":false},{"text":"Transformation Jutsu","isCorrect":false}]'::jsonb,
  'The Shadow Clone Jutsu (Kage Bunshin no Jutsu) is Naruto''s signature technique. Unlike regular clones, shadow clones are solid copies that can fight and interact with the environment.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What does Naruto dream of becoming?',
  'multiple_choice',
  'easy',
  '[{"text":"The strongest ninja in the world","isCorrect":false},{"text":"Hokage","isCorrect":true},{"text":"An ANBU captain","isCorrect":false},{"text":"A Legendary Sannin","isCorrect":false}]'::jsonb,
  'Naruto''s lifelong dream is to become Hokage, the leader of the Hidden Leaf Village, so that everyone in the village will acknowledge and respect him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the pink-haired member of Team 7?',
  'multiple_choice',
  'easy',
  '[{"text":"Ino Yamanaka","isCorrect":false},{"text":"Hinata Hyuga","isCorrect":false},{"text":"Sakura Haruno","isCorrect":true},{"text":"Tenten","isCorrect":false}]'::jsonb,
  'Sakura Haruno is the pink-haired kunoichi of Team 7. She later becomes a medical ninja trained by the Fifth Hokage, Tsunade.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the academy teacher who treats Naruto to ramen?',
  'multiple_choice',
  'easy',
  '[{"text":"Mizuki","isCorrect":false},{"text":"Iruka Umino","isCorrect":true},{"text":"Ebisu","isCorrect":false},{"text":"Konohamaru","isCorrect":false}]'::jsonb,
  'Iruka Umino is Naruto''s academy teacher and one of the first people to truly acknowledge Naruto. He often treats Naruto to his favorite food at Ichiraku Ramen.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the headband that Naruto and other ninja wear?',
  'multiple_choice',
  'easy',
  '[{"text":"Chakra band","isCorrect":false},{"text":"Ninja crown","isCorrect":false},{"text":"Forehead protector","isCorrect":true},{"text":"Village crest","isCorrect":false}]'::jsonb,
  'The headband is called a forehead protector (hitai-ate). It is engraved with the symbol of the ninja''s village — in Naruto''s case, the Hidden Leaf symbol.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Naruto''s favorite food?',
  'multiple_choice',
  'easy',
  '[{"text":"Sushi","isCorrect":false},{"text":"Onigiri (rice balls)","isCorrect":false},{"text":"Ramen from Ichiraku Ramen","isCorrect":true},{"text":"Dango","isCorrect":false}]'::jsonb,
  'Naruto''s favorite food is ramen, specifically from Ichiraku Ramen, a small ramen stand in the Hidden Leaf Village run by Teuchi and his daughter Ayame.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of Sasuke''s older brother?',
  'multiple_choice',
  'medium',
  '[{"text":"Madara Uchiha","isCorrect":false},{"text":"Obito Uchiha","isCorrect":false},{"text":"Itachi Uchiha","isCorrect":true},{"text":"Shisui Uchiha","isCorrect":false}]'::jsonb,
  'Itachi Uchiha is Sasuke''s older brother who massacred the entire Uchiha clan, leaving only Sasuke alive. Sasuke''s desire for revenge against Itachi drives much of the story.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Which eye technique is unique to the Uchiha clan?',
  'multiple_choice',
  'medium',
  '[{"text":"Byakugan","isCorrect":false},{"text":"Rinnegan","isCorrect":false},{"text":"Sharingan","isCorrect":true},{"text":"Tenseigan","isCorrect":false}]'::jsonb,
  'The Sharingan is the kekkei genkai (bloodline limit) dojutsu of the Uchiha clan. It allows the user to copy techniques, see chakra, and cast powerful genjutsu.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who is the Fifth Hokage?',
  'multiple_choice',
  'medium',
  '[{"text":"Jiraiya","isCorrect":false},{"text":"Tsunade","isCorrect":true},{"text":"Danzo Shimura","isCorrect":false},{"text":"Kakashi Hatake","isCorrect":false}]'::jsonb,
  'Tsunade, one of the Legendary Sannin, becomes the Fifth Hokage after the death of the Third Hokage. She is renowned as the greatest medical ninja in the world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of Naruto''s father?',
  'multiple_choice',
  'medium',
  '[{"text":"Hiruzen Sarutobi","isCorrect":false},{"text":"Jiraiya","isCorrect":false},{"text":"Minato Namikaze","isCorrect":true},{"text":"Fugaku Uchiha","isCorrect":false}]'::jsonb,
  'Naruto''s father is Minato Namikaze, the Fourth Hokage, also known as the Yellow Flash of the Leaf. He sacrificed his life to seal the Nine-Tails inside Naruto.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What organization does Itachi join after leaving the Hidden Leaf Village?',
  'multiple_choice',
  'medium',
  '[{"text":"The Foundation (Root)","isCorrect":false},{"text":"The Sound Four","isCorrect":false},{"text":"Akatsuki","isCorrect":true},{"text":"The Seven Ninja Swordsmen","isCorrect":false}]'::jsonb,
  'Itachi joins the Akatsuki, a criminal organization of S-rank rogue ninja. The Akatsuki''s goal is to capture all nine tailed beasts.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Rock Lee''s specialty as a ninja?',
  'multiple_choice',
  'medium',
  '[{"text":"Genjutsu (illusion techniques)","isCorrect":false},{"text":"Ninjutsu (ninja techniques)","isCorrect":false},{"text":"Taijutsu (hand-to-hand combat)","isCorrect":true},{"text":"Fuinjutsu (sealing techniques)","isCorrect":false}]'::jsonb,
  'Rock Lee specializes in taijutsu because he is unable to use ninjutsu or genjutsu. Despite this limitation, he becomes an extremely powerful fighter through sheer hard work and dedication.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the Rasengan?',
  'multiple_choice',
  'medium',
  '[{"text":"A fire-based jutsu passed down in the Uchiha clan","isCorrect":false},{"text":"A spinning ball of chakra created by the Fourth Hokage","isCorrect":true},{"text":"A summoning technique that calls giant toads","isCorrect":false},{"text":"A lightning-based assassination technique","isCorrect":false}]'::jsonb,
  'The Rasengan is a spinning ball of concentrated chakra created by Minato Namikaze (the Fourth Hokage). It was later taught to Naruto by Jiraiya during their training journey.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who is the leader of the Akatsuki as publicly known to the world?',
  'multiple_choice',
  'medium',
  '[{"text":"Obito Uchiha","isCorrect":false},{"text":"Konan","isCorrect":false},{"text":"Pain (Nagato)","isCorrect":true},{"text":"Orochimaru","isCorrect":false}]'::jsonb,
  'Pain, whose real identity is Nagato, is the publicly known leader of the Akatsuki. He uses six corpses called the Six Paths of Pain to act as his proxies.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Gaara''s title after the time skip in Naruto Shippuden?',
  'multiple_choice',
  'medium',
  '[{"text":"Mizukage","isCorrect":false},{"text":"Tsuchikage","isCorrect":false},{"text":"Fifth Kazekage","isCorrect":true},{"text":"Raikage","isCorrect":false}]'::jsonb,
  'After the time skip, Gaara has become the Fifth Kazekage, the leader of the Hidden Sand Village (Sunagakure). This shows his dramatic transformation from a feared loner to a beloved leader.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the technique Sasuke learns from Kakashi?',
  'multiple_choice',
  'medium',
  '[{"text":"Rasengan","isCorrect":false},{"text":"Chidori","isCorrect":true},{"text":"Fire Ball Jutsu","isCorrect":false},{"text":"Shadow Clone Jutsu","isCorrect":false}]'::jsonb,
  'Kakashi teaches Sasuke the Chidori (also called Lightning Blade in Kakashi''s enhanced version), a lightning-based technique that concentrates chakra in the user''s hand for a powerful piercing attack.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What are the names of all three Legendary Sannin?',
  'multiple_choice',
  'hard',
  '[{"text":"Jiraiya, Tsunade, and Orochimaru","isCorrect":true},{"text":"Jiraiya, Tsunade, and Kabuto","isCorrect":false},{"text":"Minato, Tsunade, and Orochimaru","isCorrect":false},{"text":"Jiraiya, Sakumo, and Orochimaru","isCorrect":false}]'::jsonb,
  'The three Legendary Sannin are Jiraiya (the Toad Sage), Tsunade (the Slug Princess), and Orochimaru (the Snake Sage). They were students of the Third Hokage, Hiruzen Sarutobi, and earned their title during the Second Great Ninja War from Hanzo of the Salamander.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of Might Guy''s ultimate technique that he uses against Madara Uchiha?',
  'multiple_choice',
  'hard',
  '[{"text":"Primary Lotus","isCorrect":false},{"text":"Morning Peacock","isCorrect":false},{"text":"Night Guy (Eight Gates: Gate of Death)","isCorrect":true},{"text":"Afternoon Tiger","isCorrect":false}]'::jsonb,
  'Night Guy is the ultimate taijutsu technique used by Might Guy when he opens all Eight Gates, including the final Gate of Death. He uses this technique against Madara Uchiha in the Fourth Great Ninja War, nearly killing him at the cost of almost losing his own life.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who is historically recognized as one of the first to awaken the Mangekyo Sharingan?',
  'multiple_choice',
  'hard',
  '[{"text":"Sasuke Uchiha","isCorrect":false},{"text":"Madara Uchiha","isCorrect":true},{"text":"Kakashi Hatake","isCorrect":false},{"text":"Fugaku Uchiha","isCorrect":false}]'::jsonb,
  'While Indra Otsutsuki is considered the progenitor of the Sharingan in ancient lore, Madara Uchiha is historically recognized as one of the first known shinobi to awaken the Mangekyo Sharingan, which he achieved alongside his brother Izuna Uchiha.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the forbidden jutsu that reanimates the dead, used extensively by Kabuto during the Fourth Great Ninja War?',
  'multiple_choice',
  'hard',
  '[{"text":"Rinne Rebirth","isCorrect":false},{"text":"Edo Tensei (Summoning: Impure World Reincarnation)","isCorrect":true},{"text":"Izanagi","isCorrect":false},{"text":"Reanimation Seal Jutsu","isCorrect":false}]'::jsonb,
  'The Edo Tensei (Summoning: Impure World Reincarnation) was originally created by the Second Hokage, Tobirama Senju. Kabuto Yakushi perfected the technique and used it to reanimate dozens of powerful dead shinobi during the Fourth Great Ninja War.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Kakashi''s father''s name and his famous nickname?',
  'multiple_choice',
  'hard',
  '[{"text":"Sakumo Hatake, the White Fang of the Leaf","isCorrect":true},{"text":"Saizo Hatake, the Silver Shadow","isCorrect":false},{"text":"Kenshi Hatake, the Lightning Fang","isCorrect":false},{"text":"Takeshi Hatake, the Ghost of the Leaf","isCorrect":false}]'::jsonb,
  'Kakashi''s father is Sakumo Hatake, known as the White Fang of the Leaf. He was said to be even more powerful than the Legendary Sannin. He took his own life after being shamed for choosing to save his comrades over completing a mission.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Which tailed beast is sealed inside Killer Bee?',
  'multiple_choice',
  'hard',
  '[{"text":"Seven-Tails (Chomei)","isCorrect":false},{"text":"Two-Tails (Matatabi)","isCorrect":false},{"text":"Eight-Tails (Gyuki)","isCorrect":true},{"text":"Six-Tails (Saiken)","isCorrect":false}]'::jsonb,
  'Killer Bee is the jinchuriki of the Eight-Tails, Gyuki, a giant ox-like creature with octopus tails. Unlike most jinchuriki, Killer Bee has a perfect partnership with his tailed beast and can fully transform into it at will.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of Obito Uchiha''s space-time dimension accessed through his Mangekyo Sharingan?',
  'multiple_choice',
  'hard',
  '[{"text":"Tsukuyomi realm","isCorrect":false},{"text":"Kamui dimension","isCorrect":true},{"text":"Izanami void","isCorrect":false},{"text":"Susanoo plane","isCorrect":false}]'::jsonb,
  'The Kamui dimension is a separate space-time dimension accessible through Obito''s Mangekyo Sharingan ability called Kamui. He can teleport himself and others into this dimension, and it also allows him to become intangible by sending parts of his body there.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the sage who created ninjutsu and divided the Ten-Tails into the nine tailed beasts?',
  'multiple_choice',
  'hard',
  '[{"text":"Hamura Otsutsuki","isCorrect":false},{"text":"Ashura Otsutsuki","isCorrect":false},{"text":"Hagoromo Otsutsuki (Sage of Six Paths)","isCorrect":true},{"text":"Kaguya Otsutsuki","isCorrect":false}]'::jsonb,
  'Hagoromo Otsutsuki, known as the Sage of Six Paths, is the legendary figure who created ninjutsu (ninshuu) and used his Creation of All Things technique to divide the Ten-Tails'' chakra into the nine separate tailed beasts before sealing its body as the moon.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Where does Naruto train to learn Sage Mode in Naruto Shippuden?',
  'multiple_choice',
  'hard',
  '[{"text":"The Forest of Death","isCorrect":false},{"text":"Turtle Island","isCorrect":false},{"text":"Mount Myoboku","isCorrect":true},{"text":"Ryuchi Cave","isCorrect":false}]'::jsonb,
  'Naruto trains to learn Sage Mode at Mount Myoboku, the home of the toad summons. He is trained by Fukasaku, one of the Two Great Sage Toads. The training begins around episode 154 of Naruto Shippuden.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'According to Madara Uchiha, what is the purpose of the Infinite Tsukuyomi?',
  'multiple_choice',
  'hard',
  '[{"text":"To destroy all ninja villages and start over","isCorrect":false},{"text":"To resurrect all fallen Uchiha clan members","isCorrect":false},{"text":"To create a world of endless dreams where suffering does not exist","isCorrect":true},{"text":"To grant the caster immortality and ultimate power","isCorrect":false}]'::jsonb,
  'Madara believed the Infinite Tsukuyomi would cast a genjutsu over the entire world, trapping everyone in an eternal dream where they would experience their ideal reality. In his view, this was the only way to end all war, hatred, and suffering — creating a perfect but illusory peace.'
);

-- ============================================================
-- One Piece
-- ============================================================

INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)
VALUES (
  'one-piece',
  'One Piece',
  'Monkey D. Luffy and the Straw Hat Pirates sail the Grand Line in search of the legendary treasure One Piece to become King of the Pirates.',
  '{"Shonen","Action","Adventure"}',
  30,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  total_questions = EXCLUDED.total_questions;

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is Monkey D. Luffy''s ultimate dream?',
  'multiple_choice',
  'easy',
  '[{"text":"To become King of the Pirates","isCorrect":true},{"text":"To become the strongest swordsman","isCorrect":false},{"text":"To find the All Blue","isCorrect":false},{"text":"To draw a map of the entire world","isCorrect":false}]'::jsonb,
  'Luffy''s lifelong dream, inspired by the pirate Shanks, is to find the One Piece and become the King of the Pirates.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Luffy''s pirate crew?',
  'multiple_choice',
  'easy',
  '[{"text":"Red Hair Pirates","isCorrect":false},{"text":"Straw Hat Pirates","isCorrect":true},{"text":"Heart Pirates","isCorrect":false},{"text":"Sun Pirates","isCorrect":false}]'::jsonb,
  'Luffy''s crew is called the Straw Hat Pirates, named after the iconic straw hat given to him by Shanks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What Devil Fruit did Luffy eat as a child?',
  'multiple_choice',
  'easy',
  '[{"text":"Flame-Flame Fruit (Mera Mera no Mi)","isCorrect":false},{"text":"Gum-Gum Fruit (Gomu Gomu no Mi)","isCorrect":true},{"text":"Chop-Chop Fruit (Bara Bara no Mi)","isCorrect":false},{"text":"Smoke-Smoke Fruit (Moku Moku no Mi)","isCorrect":false}]'::jsonb,
  'Luffy ate the Gum-Gum Fruit (Gomu Gomu no Mi) as a child, which turned his body into rubber.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the legendary treasure that all pirates are searching for?',
  'multiple_choice',
  'easy',
  '[{"text":"The Grand Treasure","isCorrect":false},{"text":"The Devil''s Bounty","isCorrect":false},{"text":"One Piece","isCorrect":true},{"text":"The Pirate''s Gold","isCorrect":false}]'::jsonb,
  'The One Piece is the legendary treasure left behind by the Pirate King, Gol D. Roger, at the final island of the Grand Line.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who is the swordsman of the Straw Hat crew?',
  'multiple_choice',
  'easy',
  '[{"text":"Sanji","isCorrect":false},{"text":"Brook","isCorrect":false},{"text":"Roronoa Zoro","isCorrect":true},{"text":"Franky","isCorrect":false}]'::jsonb,
  'Roronoa Zoro is the Straw Hat crew''s swordsman and the first member to join Luffy. His dream is to become the world''s greatest swordsman.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the Straw Hat Pirates'' second ship?',
  'multiple_choice',
  'easy',
  '[{"text":"Going Merry","isCorrect":false},{"text":"Thousand Sunny","isCorrect":true},{"text":"Oro Jackson","isCorrect":false},{"text":"Red Force","isCorrect":false}]'::jsonb,
  'The Thousand Sunny is the Straw Hats'' second ship, built by Franky using wood from the legendary Adam Tree to replace the Going Merry.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who is the navigator of the Straw Hat crew?',
  'multiple_choice',
  'easy',
  '[{"text":"Nico Robin","isCorrect":false},{"text":"Nami","isCorrect":true},{"text":"Vivi","isCorrect":false},{"text":"Carrot","isCorrect":false}]'::jsonb,
  'Nami is the Straw Hat crew''s navigator. Her dream is to draw a complete map of the entire world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the cook of the Straw Hat crew?',
  'multiple_choice',
  'easy',
  '[{"text":"Zeff","isCorrect":false},{"text":"Patty","isCorrect":false},{"text":"Sanji","isCorrect":true},{"text":"Duval","isCorrect":false}]'::jsonb,
  'Sanji, also known as ''Black Leg'' Sanji, is the Straw Hat crew''s cook. His dream is to find the All Blue, a legendary sea with fish from all four oceans.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who was known as the Pirate King before the start of the series?',
  'multiple_choice',
  'easy',
  '[{"text":"Edward Newgate","isCorrect":false},{"text":"Monkey D. Dragon","isCorrect":false},{"text":"Gol D. Roger","isCorrect":true},{"text":"Silvers Rayleigh","isCorrect":false}]'::jsonb,
  'Gol D. Roger was the only person to conquer the Grand Line and earn the title of Pirate King. His execution sparked the Great Pirate Era.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the ocean where the main story of One Piece takes place?',
  'multiple_choice',
  'easy',
  '[{"text":"East Blue","isCorrect":false},{"text":"The New World","isCorrect":false},{"text":"Grand Line","isCorrect":true},{"text":"Calm Belt","isCorrect":false}]'::jsonb,
  'The Grand Line is the dangerous ocean route that circles the globe, where the majority of the One Piece story takes place. It is divided into two halves: Paradise and the New World.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the three types of Haki?',
  'multiple_choice',
  'medium',
  '[{"text":"Observation Haki, Armament Haki, and Conqueror''s Haki","isCorrect":true},{"text":"Fire Haki, Ice Haki, and Lightning Haki","isCorrect":false},{"text":"Attack Haki, Defense Haki, and Spirit Haki","isCorrect":false},{"text":"Observation Haki, Armament Haki, and Destruction Haki","isCorrect":false}]'::jsonb,
  'The three types of Haki are Observation Haki (Kenbunshoku), which senses others'' presence and intent; Armament Haki (Busoshoku), which creates an invisible armor; and Conqueror''s Haki (Haoshoku), which can overwhelm the willpower of others.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who is the doctor of the Straw Hat crew?',
  'multiple_choice',
  'medium',
  '[{"text":"Trafalgar Law","isCorrect":false},{"text":"Tony Tony Chopper","isCorrect":true},{"text":"Kureha","isCorrect":false},{"text":"Hogback","isCorrect":false}]'::jsonb,
  'Tony Tony Chopper is a reindeer who ate the Human-Human Fruit (Hito Hito no Mi), giving him human intelligence. He serves as the Straw Hat crew''s doctor and dreams of becoming a doctor who can cure any disease.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the Marine headquarters where the Summit War took place?',
  'multiple_choice',
  'medium',
  '[{"text":"Enies Lobby","isCorrect":false},{"text":"Impel Down","isCorrect":false},{"text":"Marineford","isCorrect":true},{"text":"Sabaody Archipelago","isCorrect":false}]'::jsonb,
  'Marineford was the Marine headquarters and the location of the Summit War (also called the Battle of Marineford), one of the largest conflicts in the series.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who are the Four Emperors (Yonko) at the start of the series?',
  'multiple_choice',
  'medium',
  '[{"text":"Shanks, Whitebeard, Kaido, and Big Mom","isCorrect":true},{"text":"Shanks, Blackbeard, Kaido, and Big Mom","isCorrect":false},{"text":"Roger, Whitebeard, Shiki, and Big Mom","isCorrect":false},{"text":"Shanks, Whitebeard, Doflamingo, and Kaido","isCorrect":false}]'::jsonb,
  'The original Four Emperors (Yonko) were Red-Haired Shanks, Whitebeard (Edward Newgate), Kaido of the Beasts, and Big Mom (Charlotte Linlin). They were the four most powerful pirates ruling the New World.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Zoro''s signature three-sword fighting style?',
  'multiple_choice',
  'medium',
  '[{"text":"Nitoryu (Two Sword Style)","isCorrect":false},{"text":"Santoryu (Three Sword Style)","isCorrect":true},{"text":"Ittoryu (One Sword Style)","isCorrect":false},{"text":"Yontoryu (Four Sword Style)","isCorrect":false}]'::jsonb,
  'Santoryu (Three Sword Style) is Zoro''s unique fighting style where he wields three swords simultaneously -- one in each hand and one in his mouth. He developed this style in honor of his childhood rival Kuina.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Luffy''s adopted brother who possesses the Flame-Flame Fruit?',
  'multiple_choice',
  'medium',
  '[{"text":"Sabo","isCorrect":false},{"text":"Portgas D. Ace","isCorrect":true},{"text":"Trafalgar Law","isCorrect":false},{"text":"Donquixote Doflamingo","isCorrect":false}]'::jsonb,
  'Portgas D. Ace is Luffy''s adopted brother and the biological son of Gol D. Roger. He ate the Flame-Flame Fruit (Mera Mera no Mi) and was the Second Division Commander of the Whitebeard Pirates.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who is the leader of the Revolutionary Army and Luffy''s biological father?',
  'multiple_choice',
  'medium',
  '[{"text":"Silvers Rayleigh","isCorrect":false},{"text":"Monkey D. Garp","isCorrect":false},{"text":"Monkey D. Dragon","isCorrect":true},{"text":"Emporio Ivankov","isCorrect":false}]'::jsonb,
  'Monkey D. Dragon is the leader of the Revolutionary Army and Luffy''s biological father. He is considered the World Government''s most dangerous enemy and most wanted man in the world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the three Ancient Weapons that the World Government fears?',
  'multiple_choice',
  'medium',
  '[{"text":"Pluton, Poseidon, and Uranus","isCorrect":true},{"text":"Pluton, Neptune, and Zeus","isCorrect":false},{"text":"Hades, Poseidon, and Athena","isCorrect":false},{"text":"Pluton, Poseidon, and Kronos","isCorrect":false}]'::jsonb,
  'The three Ancient Weapons are Pluton (a massive warship), Poseidon (the ability to communicate with Sea Kings, held by Princess Shirahoshi), and Uranus (whose nature is still largely mysterious). They are capable of mass destruction.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What island is known as the final island on the Grand Line where the One Piece is located?',
  'multiple_choice',
  'medium',
  '[{"text":"Zou","isCorrect":false},{"text":"Lodestar Island","isCorrect":false},{"text":"Laugh Tale","isCorrect":true},{"text":"God Valley","isCorrect":false}]'::jsonb,
  'Laugh Tale (originally romanized as Raftel) is the final island on the Grand Line where the One Piece is hidden. It was named by Gol D. Roger because he and his crew laughed when they arrived and discovered what was there.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Sanji''s fighting style that uses only kicks?',
  'multiple_choice',
  'medium',
  '[{"text":"Fishman Karate","isCorrect":false},{"text":"Rokushiki","isCorrect":false},{"text":"Black Leg Style","isCorrect":true},{"text":"Okama Kenpo","isCorrect":false}]'::jsonb,
  'Black Leg Style is Sanji''s fighting style where he exclusively uses kicks, refusing to use his hands in combat to protect them for cooking. The style was taught to him by his mentor, Red-Leg Zeff.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the true name of Luffy''s Devil Fruit as revealed later in the series?',
  'multiple_choice',
  'hard',
  '[{"text":"Gomu Gomu no Mi, Model: Vulcanized","isCorrect":false},{"text":"Hito Hito no Mi, Model: Nika","isCorrect":true},{"text":"Mythical Zoan: Raijin","isCorrect":false},{"text":"Paramecia Awakened: Gomu Gomu","isCorrect":false}]'::jsonb,
  'Luffy''s Devil Fruit was revealed to actually be the Hito Hito no Mi, Model: Nika (Human-Human Fruit, Mythical Zoan type). The World Government had renamed it the Gomu Gomu no Mi to hide its true nature as the fruit of the Sun God Nika.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the Void Century in the world of One Piece?',
  'multiple_choice',
  'hard',
  '[{"text":"A century when no pirates existed on the seas","isCorrect":false},{"text":"A 100-year gap in recorded history that the World Government has erased","isCorrect":true},{"text":"The century during which all Devil Fruits were created","isCorrect":false},{"text":"A 100-year war between the Marines and the Yonko","isCorrect":false}]'::jsonb,
  'The Void Century is a 100-year period of history (approximately 800-900 years before the current storyline) that has been erased from public record by the World Government. Researching it is considered a capital crime, and the Poneglyphs contain the hidden truth about what happened.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who are the Five Elders (Gorosei)?',
  'multiple_choice',
  'hard',
  '[{"text":"The five strongest Marine Admirals","isCorrect":false},{"text":"The five leaders of the Revolutionary Army''s divisions","isCorrect":false},{"text":"The five highest-ranking Celestial Dragons who rule the World Government","isCorrect":true},{"text":"The five legendary pirates who discovered the Grand Line","isCorrect":false}]'::jsonb,
  'The Five Elders (Gorosei) are the five highest-ranking Celestial Dragons who hold the greatest authority in the World Government, answering only to the mysterious Imu. They have ruled from Mary Geoise for centuries and possess immense power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is Nico Robin''s ultimate dream?',
  'multiple_choice',
  'hard',
  '[{"text":"To become the greatest archaeologist in the world","isCorrect":false},{"text":"To find and read the Rio Poneglyph to learn the True History","isCorrect":true},{"text":"To destroy the World Government","isCorrect":false},{"text":"To avenge the scholars of Ohara","isCorrect":false}]'::jsonb,
  'Nico Robin''s dream is to find the Rio Poneglyph, which contains the complete True History of the Void Century. This dream was inherited from the scholars of Ohara who were destroyed by the World Government''s Buster Call for researching this forbidden knowledge.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name and type of Kaido''s Devil Fruit?',
  'multiple_choice',
  'hard',
  '[{"text":"Ryu Ryu no Mi, Model: Pteranodon -- Ancient Zoan","isCorrect":false},{"text":"Uo Uo no Mi, Model: Seiryu -- Mythical Zoan (Fish-Fish Fruit, Azure Dragon)","isCorrect":true},{"text":"Hebi Hebi no Mi, Model: Yamata no Orochi -- Mythical Zoan","isCorrect":false},{"text":"Tatsu Tatsu no Mi -- Logia Dragon type","isCorrect":false}]'::jsonb,
  'Kaido''s Devil Fruit is the Uo Uo no Mi, Model: Seiryu (Fish-Fish Fruit, Mythical Zoan type, Azure Dragon model). Despite being a Fish-Fish Fruit, it allows him to transform into a massive Eastern dragon, referencing the legend of a carp climbing a waterfall to become a dragon.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Shanks'' sword?',
  'multiple_choice',
  'hard',
  '[{"text":"Enma","isCorrect":false},{"text":"Ace","isCorrect":false},{"text":"Gryphon","isCorrect":true},{"text":"Shusui","isCorrect":false}]'::jsonb,
  'Shanks wields a saber named Gryphon. Despite losing his left arm to a Sea King while saving young Luffy, Shanks remains one of the most powerful swordsmen in the world with this blade.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the significance of the ''Will of D.'' in One Piece?',
  'multiple_choice',
  'hard',
  '[{"text":"It grants the bearer immunity to Devil Fruit powers","isCorrect":false},{"text":"It marks descendants of the original Marine heroes","isCorrect":false},{"text":"People with D. in their name carry an inherited will and are called ''God''s Natural Enemy''","isCorrect":true},{"text":"It is a tattoo given to members of the Revolutionary Army","isCorrect":false}]'::jsonb,
  'The Will of D. refers to a mysterious inherited will carried by those with the initial ''D.'' in their name (such as Monkey D. Luffy, Gol D. Roger, and Portgas D. Ace). They are known as ''God''s Natural Enemy'' by the Celestial Dragons, and they tend to cause great upheavals in the world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is Gear Fifth and how does it work?',
  'multiple_choice',
  'hard',
  '[{"text":"A form that combines all three types of Haki into Luffy''s rubber body","isCorrect":false},{"text":"Luffy''s awakened Devil Fruit form based on the Sun God Nika, granting cartoonish reality-bending powers","isCorrect":true},{"text":"A technique that permanently enlarges Luffy''s body to giant size","isCorrect":false},{"text":"A Haki-only transformation that turns Luffy''s body into pure energy","isCorrect":false}]'::jsonb,
  'Gear Fifth is Luffy''s awakened Devil Fruit form, triggered when the Hito Hito no Mi, Model: Nika fully awakens. In this form, Luffy embodies the Sun God Nika, gaining the ''most ridiculous power in the world'' -- the ability to fight with cartoonish, imagination-based, reality-bending powers while his hair and clothes turn white.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who is Joyboy and what is his connection to Luffy?',
  'multiple_choice',
  'hard',
  '[{"text":"Joyboy was Roger''s first mate, and Luffy inherited his Devil Fruit","isCorrect":false},{"text":"A figure from the Void Century who left a promise on Fish-Man Island; Luffy is called the second coming of Joyboy","isCorrect":true},{"text":"The original creator of the Devil Fruits who cursed the seas","isCorrect":false},{"text":"A legendary Marine who defected and formed the first pirate crew","isCorrect":false}]'::jsonb,
  'Joyboy was a significant figure from the Void Century who made a promise to the people of Fish-Man Island that he could not keep. He left behind a treasure on Laugh Tale. When Luffy awakened his Devil Fruit and achieved Gear Fifth, Zunesha declared that Joyboy had returned, making Luffy the second coming of Joyboy.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the Road Poneglyphs and why are they important?',
  'multiple_choice',
  'hard',
  '[{"text":"Ancient maps carved in stone that show the locations of all Devil Fruits","isCorrect":false},{"text":"Stone tablets that contain the blueprints for the Ancient Weapons","isCorrect":false},{"text":"Four special red Poneglyphs whose combined information reveals the location of Laugh Tale","isCorrect":true},{"text":"Sacred stones that grant the ability to read all written languages","isCorrect":false}]'::jsonb,
  'The Road Poneglyphs are four special red stone tablets. Each one contains a coordinate, and when all four coordinates are combined, they reveal the location of Laugh Tale, the final island where the One Piece is hidden. This is why Nico Robin''s ability to read Poneglyphs is so crucial to the Straw Hats'' journey.'
);

