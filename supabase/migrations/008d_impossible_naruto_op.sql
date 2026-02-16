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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How many hand signs are required to perform the Shadow Clone Jutsu?',
  'multiple_choice',
  'impossible',
  '[{"text":"Three hand signs","isCorrect":false},{"text":"Twelve hand signs","isCorrect":false},{"text":"One — a single cross-shaped hand sign","isCorrect":true},{"text":"Five hand signs","isCorrect":false}]'::jsonb,
  'The Shadow Clone Jutsu (Kage Bunshin no Jutsu) requires only a single hand sign — the cross-shaped seal where the user crosses their index and middle fingers from both hands. Despite its simplicity, it is classified as a forbidden technique due to its massive chakra cost.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How old was Itachi Uchiha when he carried out the Uchiha clan massacre?',
  'multiple_choice',
  'impossible',
  '[{"text":"15 years old","isCorrect":false},{"text":"11 years old","isCorrect":false},{"text":"13 years old","isCorrect":true},{"text":"16 years old","isCorrect":false}]'::jsonb,
  'Itachi was 13 years old when he massacred the Uchiha clan on orders from the Konoha leadership. He had already been an ANBU captain by that age. He spared only his younger brother Sasuke, who was 8 at the time.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific Mangekyō Sharingan ability unique to Itachi''s left eye?',
  'multiple_choice',
  'impossible',
  '[{"text":"Amaterasu","isCorrect":false},{"text":"Kamui","isCorrect":false},{"text":"Tsukuyomi","isCorrect":true},{"text":"Kotoamatsukami","isCorrect":false}]'::jsonb,
  'Tsukuyomi is the genjutsu ability of Itachi''s left Mangekyō Sharingan. It traps the victim in an illusory world where Itachi controls space, time, and mass, allowing him to inflict what feels like days of torture in mere seconds. His right eye controls Amaterasu. Kamui is Obito''s ability, and Kotoamatsukami is Shisui''s.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the forbidden scroll Naruto steals in the very first episode?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Scroll of Forbidden Seals","isCorrect":false},{"text":"The Scroll of Seals (Fūin no Sho)","isCorrect":true},{"text":"The Sacred Hokage Scroll","isCorrect":false},{"text":"The Forbidden Jutsu Archive","isCorrect":false}]'::jsonb,
  'The Scroll of Seals (Fūin no Sho), also called the Forbidden Scroll, is a large scroll containing dangerous jutsu compiled by the First Hokage. Naruto stole it after being tricked by Mizuki, and from it he learned the Multi Shadow Clone Jutsu that became his signature technique.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific mechanism of Minato''s Flying Thunder God technique (Hiraishin)?',
  'multiple_choice',
  'impossible',
  '[{"text":"He moves at the speed of light between two points","isCorrect":false},{"text":"He teleports instantly to special seal markers he has placed on objects or people","isCorrect":true},{"text":"He creates shadow clones at distant locations and switches consciousness","isCorrect":false},{"text":"He bends space-time in a radius around himself","isCorrect":false}]'::jsonb,
  'The Flying Thunder God Technique (Hiraishin no Jutsu) allows Minato to teleport instantly to any location where he has placed his special seal formula/marker. He places these markers on kunai, people, and locations. The technique was originally created by the Second Hokage Tobirama Senju.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How many tailed beasts (Bijū) exist in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"7","isCorrect":false},{"text":"10","isCorrect":false},{"text":"9","isCorrect":true},{"text":"12","isCorrect":false}]'::jsonb,
  'There are exactly 9 tailed beasts, numbered by their tail count: Shukaku (1-tail), Matatabi (2-tails), Isobu (3-tails), Son Gokū (4-tails), Kokuō (5-tails), Saiken (6-tails), Chōmei (7-tails), Gyūki (8-tails), and Kurama (9-tails). They were all created by the Sage of Six Paths splitting the Ten-Tails'' chakra.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What alias did Obito Uchiha use before his identity was revealed?',
  'multiple_choice',
  'impossible',
  '[{"text":"Madara","isCorrect":false},{"text":"Tobi","isCorrect":true},{"text":"Zetsu","isCorrect":false},{"text":"Pain","isCorrect":false}]'::jsonb,
  'Obito used the alias "Tobi" and wore an orange spiral mask. He initially posed as a goofy Akatsuki member before revealing himself as the mastermind behind the organization, claiming to be Madara Uchiha. His true identity as Obito was confirmed during the Fourth Great Ninja War.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What are the names of Pain''s Six Paths bodies?',
  'multiple_choice',
  'impossible',
  '[{"text":"Deva, Asura, Human, Animal, Preta, and Naraka Paths","isCorrect":true},{"text":"Fire, Water, Wind, Earth, Lightning, and Shadow Paths","isCorrect":false},{"text":"Heaven, Earth, Void, Light, Dark, and Chaos Paths","isCorrect":false},{"text":"Strength, Speed, Defense, Sight, Soul, and Death Paths","isCorrect":false}]'::jsonb,
  'The Six Paths of Pain are: Deva Path (gravity manipulation, Yahiko''s body), Asura Path (mechanized weapons), Human Path (soul reading/extraction), Animal Path (summoning), Preta Path (chakra absorption), and Naraka Path (interrogation/restoration via the King of Hell). All were controlled remotely by Nagato.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What was the name of Jiraiya''s spy network?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Toad Network","isCorrect":false},{"text":"He didn''t have a formal name for it — it was simply his intelligence network","isCorrect":true},{"text":"The Shadow Web","isCorrect":false},{"text":"The Sage''s Eyes","isCorrect":false}]'::jsonb,
  'Jiraiya''s spy network was never given a formal name in the series. It was simply referred to as his "intelligence network" or "spy network." He built it during his decades of traveling across the ninja world, gathering informants in various villages and organizations.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'In which manga magazine was Naruto originally serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Weekly Shōnen Magazine","isCorrect":false},{"text":"Monthly Shōnen Jump","isCorrect":false},{"text":"Weekly Shōnen Sunday","isCorrect":false},{"text":"Weekly Shōnen Jump","isCorrect":true}]'::jsonb,
  'Naruto was serialized in Weekly Shōnen Jump (Shueisha) from September 1999 to November 2014, running for 700 chapters across 72 volumes. It was created by Masashi Kishimoto and became one of the magazine''s best-selling series of all time.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Whose eyes did Madara Uchiha take to awaken his Eternal Mangekyō Sharingan?',
  'multiple_choice',
  'impossible',
  '[{"text":"Obito Uchiha''s eyes","isCorrect":false},{"text":"Shisui Uchiha''s eyes","isCorrect":false},{"text":"His brother Izuna Uchiha''s eyes","isCorrect":true},{"text":"Fugaku Uchiha''s eyes","isCorrect":false}]'::jsonb,
  'Madara transplanted his younger brother Izuna Uchiha''s Mangekyō Sharingan to awaken the Eternal Mangekyō Sharingan, which halted his blindness. Izuna gave his eyes either willingly (Madara''s version) or by force (Itachi''s retelling), depending on which account is believed.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'How many gates are there in the Eight Gates technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"6 gates","isCorrect":false},{"text":"8 gates","isCorrect":true},{"text":"10 gates","isCorrect":false},{"text":"7 gates","isCorrect":false}]'::jsonb,
  'There are exactly 8 gates: Gate of Opening, Gate of Healing, Gate of Life, Gate of Pain, Gate of Limit, Gate of View, Gate of Wonder, and Gate of Death. Opening all 8 gates grants power surpassing even the Five Kage, but the 8th gate kills the user. Guy opened all 8 against Madara.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'In which specific arc does Rock Lee first use his Drunken Fist fighting style?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Chūnin Exams arc","isCorrect":false},{"text":"The Sasuke Recovery Mission arc (the Kimimaro fight)","isCorrect":true},{"text":"The Pain Invasion arc","isCorrect":false},{"text":"The Fourth Great Ninja War arc","isCorrect":false}]'::jsonb,
  'Rock Lee first uses the Drunken Fist (Suiken) during the Sasuke Recovery Mission arc, specifically in his fight against Kimimaro. Lee accidentally drank sake thinking it was his medicine, activating his natural talent for the unpredictable drunken fighting style.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Which animation studio produced the Naruto anime series?',
  'multiple_choice',
  'impossible',
  '[{"text":"Toei Animation","isCorrect":false},{"text":"Madhouse","isCorrect":false},{"text":"Studio Pierrot","isCorrect":true},{"text":"Bones","isCorrect":false}]'::jsonb,
  'Studio Pierrot produced both Naruto and Naruto Shippuden. The studio is also known for Bleach, Tokyo Ghoul, and Black Clover. The character designer was Tetsuya Nishio, who adapted Kishimoto''s manga designs for animation.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What animal does the Third Hokage (Hiruzen Sarutobi) summon in battle?',
  'multiple_choice',
  'impossible',
  '[{"text":"A hawk","isCorrect":false},{"text":"A monkey (Monkey King Enma)","isCorrect":true},{"text":"A tiger","isCorrect":false},{"text":"A snake","isCorrect":false}]'::jsonb,
  'Hiruzen Sarutobi summons Monkey King Enma, who can transform into an adamantine staff called the Vajra Nyoi. Enma is one of the most powerful summon animals and fought alongside Hiruzen during his final battle against Orochimaru during the Konoha Crush arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'According to the official Naruto databook, what is Shikamaru Nara''s IQ?',
  'multiple_choice',
  'impossible',
  '[{"text":"Over 250","isCorrect":false},{"text":"Over 300","isCorrect":false},{"text":"Over 200","isCorrect":true},{"text":"Exactly 180","isCorrect":false}]'::jsonb,
  'According to the official Naruto databook, Shikamaru has an IQ of over 200. Asuma Sarutobi tested him using shogi and found his strategic thinking to be at genius level, despite his lazy demeanor and poor academic grades.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What unorthodox technique does Naruto use to distract Kaguya during the final battle?',
  'multiple_choice',
  'impossible',
  '[{"text":"Multi Shadow Clone Barrage","isCorrect":false},{"text":"Sexy: Reverse Harem Jutsu","isCorrect":true},{"text":"Talk no Jutsu","isCorrect":false},{"text":"Giant Rasengan","isCorrect":false}]'::jsonb,
  'Naruto uses the Sexy: Reverse Harem Jutsu (Oiroke: Gyaku Hāremu no Jutsu) against Kaguya Ōtsutsuki, creating multiple handsome male clones. This actually worked momentarily, shocking Kaguya enough to create an opening. Even the goddess wasn''t immune to Naruto''s most ridiculous technique.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the Japanese name for the First Hokage''s unique kekkei genkai?',
  'multiple_choice',
  'impossible',
  '[{"text":"Shakuton (Scorch Release)","isCorrect":false},{"text":"Mokuton (Wood Release)","isCorrect":true},{"text":"Hyōton (Ice Release)","isCorrect":false},{"text":"Jinton (Dust Release)","isCorrect":false}]'::jsonb,
  'Hashirama Senju''s unique kekkei genkai is Mokuton (木遁, Wood Release), which combines Earth and Water nature chakra. It is so rare that only Hashirama naturally possessed it. Yamato/Tenzō gained it through Orochimaru''s experiments with Hashirama''s cells.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'At what age did Kakashi Hatake become a Jōnin?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 years old","isCorrect":false},{"text":"14 years old","isCorrect":false},{"text":"13 years old","isCorrect":true},{"text":"12 years old","isCorrect":false}]'::jsonb,
  'Kakashi became a Jōnin at age 13 during the Third Great Ninja War era. He graduated the Academy at 5, became a Chūnin at 6, and Jōnin at 13. He is one of the youngest shinobi to achieve Jōnin rank in Konoha''s history.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'Who was Dan Katō, and why is he significant to Tsunade?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was Tsunade''s teacher who died in the First Great Ninja War","isCorrect":false},{"text":"He was Tsunade''s lover who dreamed of becoming Hokage but died in the Second Great Ninja War","isCorrect":true},{"text":"He was Tsunade''s brother who was killed by Orochimaru","isCorrect":false},{"text":"He was Tsunade''s father and the previous Hokage","isCorrect":false}]'::jsonb,
  'Dan Katō was Tsunade''s lover and Shizune''s uncle. He dreamed of becoming Hokage to protect the village but died during the Second Great Ninja War. His death, combined with her younger brother Nawaki''s death, caused Tsunade''s hemophobia (fear of blood) and her reluctance to return to Konoha.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific name of the forbidden jutsu Orochimaru uses to reanimate the dead?',
  'multiple_choice',
  'impossible',
  '[{"text":"Shinigami Summoning","isCorrect":false},{"text":"Cursed Resurrection Technique","isCorrect":false},{"text":"Edo Tensei (Reanimation Jutsu)","isCorrect":true},{"text":"Forbidden Soul Return","isCorrect":false}]'::jsonb,
  'The Edo Tensei (Summoning: Impure World Reincarnation) was originally created by the Second Hokage Tobirama Senju and later perfected by Orochimaru and Kabuto. It requires a living human sacrifice and the DNA of the deceased to reanimate them with near-unlimited chakra and regeneration.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name and tail count of Killer Bee''s tailed beast?',
  'multiple_choice',
  'impossible',
  '[{"text":"Saiken, the Six-Tails","isCorrect":false},{"text":"Chōmei, the Seven-Tails","isCorrect":false},{"text":"Gyūki, the Eight-Tails","isCorrect":true},{"text":"Kurama, the Nine-Tails","isCorrect":false}]'::jsonb,
  'Killer Bee is the jinchūriki of Gyūki, the Eight-Tails, also known as the Eight-Tailed Ox (Hachibi). Bee has a perfect relationship with Gyūki, making him one of the few perfect jinchūriki. Gyūki resembles a giant ox-octopus hybrid with eight tentacle tails.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the title of the first opening theme song for the original Naruto anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Haruka Kanata","isCorrect":false},{"text":"GO!!!","isCorrect":false},{"text":"R★O★C★K★S","isCorrect":true},{"text":"Kanashimi wo Yasashisa ni","isCorrect":false}]'::jsonb,
  '"R★O★C★K★S" (also written as "ROCKS") by Hound Dog is the first opening theme of the original Naruto anime, used for episodes 1-25. "Haruka Kanata" by Asian Kung-Fu Generation is the second opening, and "GO!!!" by FLOW is the fourth.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is Naruto''s intelligence rating in the official Part 1 databook (out of 5)?',
  'multiple_choice',
  'impossible',
  '[{"text":"3 out of 5","isCorrect":false},{"text":"2 out of 5","isCorrect":false},{"text":"1.5 out of 5","isCorrect":true},{"text":"1 out of 5","isCorrect":false}]'::jsonb,
  'In the first official Naruto databook, Naruto''s intelligence is rated at 1.5 out of 5, one of his lowest stats. His highest stats are stamina (4) and his nine-tails chakra potential. His low intelligence rating reflects his poor academic performance and impulsive nature in Part 1.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the specific origin of Kabuto Yakushi? How did he end up at Konoha''s orphanage?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was found as a baby on the battlefield by Nonō, a nun who ran the orphanage, and raised there","isCorrect":true},{"text":"He was Orochimaru''s experiment who was placed in the orphanage as a sleeper agent","isCorrect":false},{"text":"He was the son of a rogue ninja who was killed, and the Third Hokage placed him in care","isCorrect":false},{"text":"He was born in the orphanage to one of the caretakers","isCorrect":false}]'::jsonb,
  'Kabuto was found as an injured child on a battlefield by Nonō Yakushi, the Mother Superior of the Konoha orphanage. She healed him and gave him the name Kabuto and her surname. He was later recruited by Danzō''s Root and sent on spy missions, eventually being manipulated into attacking Nonō, which drove him to Orochimaru.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'In which specific chapter of the manga does Naruto meet his mother Kushina Uzumaki inside his subconscious?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 497","isCorrect":true},{"text":"Chapter 440","isCorrect":false},{"text":"Chapter 520","isCorrect":false},{"text":"Chapter 465","isCorrect":false}]'::jsonb,
  'Naruto meets his mother Kushina Uzumaki in Chapter 497 of the manga, during his training to control the Nine-Tails'' chakra at the Falls of Truth on Turtle Island. Kushina tells him the story of her life, how she became the Nine-Tails'' jinchūriki, and the night of his birth.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'At what age did Kakashi Hatake graduate from the Ninja Academy?',
  'multiple_choice',
  'impossible',
  '[{"text":"7 years old","isCorrect":false},{"text":"5 years old","isCorrect":true},{"text":"6 years old","isCorrect":false},{"text":"8 years old","isCorrect":false}]'::jsonb,
  'Kakashi graduated from the Ninja Academy at the age of 5, making him one of the youngest graduates in Konoha''s history. He then became a Chūnin at age 6 and a Jōnin at 13. His prodigious talent was a source of pride for his father, the White Fang.'
);

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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was Luffy''s bounty after the Whole Cake Island arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"500,000,000 berries","isCorrect":false},{"text":"1,500,000,000 berries","isCorrect":true},{"text":"1,000,000,000 berries","isCorrect":false},{"text":"3,000,000,000 berries","isCorrect":false}]'::jsonb,
  'After the Whole Cake Island arc, Luffy''s bounty was raised to 1,500,000,000 (1.5 billion) berries, earning him the unofficial title of "Fifth Emperor." This was due to his confrontation with Big Mom and the events published by Morgans in the World Economy News Paper.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the true name of Luffy''s Devil Fruit as revealed in the Wano arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"Gomu Gomu no Mi (Rubber-Rubber Fruit)","isCorrect":false},{"text":"Hito Hito no Mi, Model: Nika","isCorrect":true},{"text":"Mythical Zoan: Model Sun God","isCorrect":false},{"text":"Nika Nika no Mi","isCorrect":false}]'::jsonb,
  'Luffy''s Devil Fruit is actually the Hito Hito no Mi, Model: Nika (Human-Human Fruit, Model: Nika), a Mythical Zoan type. The World Government renamed it the "Gomu Gomu no Mi" to hide its true nature. When awakened, it grants Luffy the powers of the Sun God Nika with rubber-like abilities and reality-bending freedom.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was the name of Gol D. Roger''s ship?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Thousand Sunny","isCorrect":false},{"text":"The Moby Dick","isCorrect":false},{"text":"The Oro Jackson","isCorrect":true},{"text":"The Red Force","isCorrect":false}]'::jsonb,
  'Roger''s ship was the Oro Jackson, built by the legendary shipwright Tom using wood from the Treasure Tree Adam (the same wood later used for the Thousand Sunny''s hull). The Moby Dick is Whitebeard''s ship, and the Red Force belongs to Shanks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Including Luffy, how many members are there in the Straw Hat Pirates crew?',
  'multiple_choice',
  'impossible',
  '[{"text":"9","isCorrect":false},{"text":"10","isCorrect":true},{"text":"11","isCorrect":false},{"text":"8","isCorrect":false}]'::jsonb,
  'There are 10 Straw Hat Pirates including Luffy: Luffy (Captain), Zoro (Swordsman), Nami (Navigator), Usopp (Sniper), Sanji (Cook), Chopper (Doctor), Robin (Archaeologist), Franky (Shipwright), Brook (Musician), and Jinbe (Helmsman, who officially joined during Wano).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the sword Zoro inherited from his childhood rival Kuina?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sandai Kitetsu","isCorrect":false},{"text":"Shusui","isCorrect":false},{"text":"Wado Ichimonji","isCorrect":true},{"text":"Enma","isCorrect":false}]'::jsonb,
  'Wado Ichimonji is the white-hilted sword Zoro received after Kuina''s death, which he carries in his mouth when using Three Sword Style. It is one of the 21 Great Grade Swords. Shusui was Ryuma''s blade he obtained in Thriller Bark, and Enma was Oden''s sword given to him in Wano.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'The Void Century refers to a specific 100-year gap in recorded history. Approximately how many years ago did it occur?',
  'multiple_choice',
  'impossible',
  '[{"text":"400-500 years ago","isCorrect":false},{"text":"800-900 years ago","isCorrect":true},{"text":"1,000-1,100 years ago","isCorrect":false},{"text":"200-300 years ago","isCorrect":false}]'::jsonb,
  'The Void Century occurred approximately 800-900 years before the current timeline. It is a century of history that was erased by the World Government (the Twenty Kingdoms that formed it). Only the Poneglyphs, indestructible stone tablets, preserve the truth of what happened during this era.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the three Ancient Weapons mentioned in One Piece?',
  'multiple_choice',
  'impossible',
  '[{"text":"Pluton, Poseidon, and Uranus","isCorrect":true},{"text":"Pluton, Neptune, and Zeus","isCorrect":false},{"text":"Mars, Jupiter, and Saturn","isCorrect":false},{"text":"Hades, Poseidon, and Athena","isCorrect":false}]'::jsonb,
  'The three Ancient Weapons are Pluton (a massive warship built in Water 7), Poseidon (the ability to communicate with Sea Kings, currently embodied by Princess Shirahoshi), and Uranus (whose nature remains largely mysterious). Each has the power to destroy the world.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was Nico Robin''s bounty immediately after the Enies Lobby arc?',
  'multiple_choice',
  'impossible',
  '[{"text":"79,000,000 berries","isCorrect":false},{"text":"80,000,000 berries","isCorrect":true},{"text":"100,000,000 berries","isCorrect":false},{"text":"130,000,000 berries","isCorrect":false}]'::jsonb,
  'After the Enies Lobby arc, Robin''s bounty was raised to 80,000,000 berries, up from her childhood bounty of 79,000,000. Her bounty was notably high even as a child because she could read Poneglyphs, making her a threat to the World Government.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'How many Shichibukai (Warlords of the Sea) were there at the start of the series?',
  'multiple_choice',
  'impossible',
  '[{"text":"5","isCorrect":false},{"text":"9","isCorrect":false},{"text":"7","isCorrect":true},{"text":"10","isCorrect":false}]'::jsonb,
  'There were 7 Shichibukai at the start of the series: Dracule Mihawk, Crocodile, Donquixote Doflamingo, Bartholomew Kuma, Gecko Moria, Boa Hancock, and Jinbe. The system was eventually abolished after the Reverie arc, with the Marines deploying the SSG (Special Science Group) as replacements.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What are the three main classifications of Devil Fruit types?',
  'multiple_choice',
  'impossible',
  '[{"text":"Paramecia, Zoan, and Logia","isCorrect":true},{"text":"Elemental, Physical, and Spiritual","isCorrect":false},{"text":"Natural, Artificial, and Mythical","isCorrect":false},{"text":"Common, Rare, and Legendary","isCorrect":false}]'::jsonb,
  'The three Devil Fruit types are: Paramecia (superhuman abilities like rubber or string), Zoan (animal transformations, including Ancient and Mythical subtypes), and Logia (elemental transformation and intangibility like fire, ice, or light). Logia are generally considered the rarest and most powerful.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was Sanji''s original character name that creator Oda had to change?',
  'multiple_choice',
  'impossible',
  '[{"text":"Naruto","isCorrect":true},{"text":"Ichigo","isCorrect":false},{"text":"Vinsmoke","isCorrect":false},{"text":"Sangoro","isCorrect":false}]'::jsonb,
  'Oda originally planned to name Sanji "Naruto" (meaning a type of fish cake with a spiral pattern, fitting his cook role). However, Masashi Kishimoto''s "Naruto" manga began serialization in Shōnen Jump around the same time, so Oda changed the name to Sanji to avoid confusion.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Brook''s Devil Fruit?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kage Kage no Mi","isCorrect":false},{"text":"Horo Horo no Mi","isCorrect":false},{"text":"Yomi Yomi no Mi","isCorrect":true},{"text":"Suke Suke no Mi","isCorrect":false}]'::jsonb,
  'Brook ate the Yomi Yomi no Mi (Revive-Revive Fruit), which allowed his soul to return to his body after death. Because his body had decomposed to a skeleton by the time his soul found it, he remains a living skeleton. The fruit also grants him soul-based powers like astral projection and ice attacks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Which animation studio produces the One Piece anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Madhouse","isCorrect":false},{"text":"Toei Animation","isCorrect":true},{"text":"Studio Pierrot","isCorrect":false},{"text":"MAPPA","isCorrect":false}]'::jsonb,
  'Toei Animation has produced the One Piece anime since its premiere on October 20, 1999. It is one of the longest-running anime series in history with over 1,100 episodes. The anime was originally directed by Konosuke Uda, with Munehisa Sakai and others directing later arcs.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What specific type of Haki can only one in several million people use?',
  'multiple_choice',
  'impossible',
  '[{"text":"Armament Haki (Busoshoku)","isCorrect":false},{"text":"Observation Haki (Kenbunshoku)","isCorrect":false},{"text":"Conqueror''s Haki (Haoshoku)","isCorrect":true},{"text":"Voice of All Things","isCorrect":false}]'::jsonb,
  'Conqueror''s Haki (Haoshoku Haki) is possessed by only one in several million people. It allows the user to exert their willpower to overwhelm others, knocking out weak-willed opponents. Only a handful of characters have it: Luffy, Shanks, Whitebeard, Roger, Big Mom, Kaido, Zoro, and a few others.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is Trafalgar Law''s full name including his hidden middle initial?',
  'multiple_choice',
  'impossible',
  '[{"text":"Trafalgar D. Water Law","isCorrect":true},{"text":"Trafalgar D. Wano Law","isCorrect":false},{"text":"Trafalgar De Water Law","isCorrect":false},{"text":"Trafalgar Law D. Water","isCorrect":false}]'::jsonb,
  'Law''s full name is Trafalgar D. Water Law. The "D." is hidden in his name, as "Water" was the true name of his family (from the hidden "D" lineage). His family hid the "D." to avoid persecution by the World Government, who fear the "Will of D."'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'How many Road Poneglyphs exist, and what is their purpose?',
  'multiple_choice',
  'impossible',
  '[{"text":"4 — each reveals a coordinate, and together they pinpoint the location of Laugh Tale","isCorrect":true},{"text":"7 — one for each sea route on the Grand Line","isCorrect":false},{"text":"3 — they form a triangle pointing to the One Piece","isCorrect":false},{"text":"2 — one at the beginning and one at the end of the Grand Line","isCorrect":false}]'::jsonb,
  'There are exactly 4 Road Poneglyphs, each revealing a specific geographic coordinate. When all four coordinates are plotted together, they form an intersection point that reveals the location of Laugh Tale — the final island where the One Piece is located. Roger''s crew was the only known crew to find all four.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the recurring gag amount of Chopper''s bounty?',
  'multiple_choice',
  'impossible',
  '[{"text":"1,000 berries","isCorrect":false},{"text":"50 berries","isCorrect":false},{"text":"100 berries","isCorrect":true},{"text":"10 berries","isCorrect":false}]'::jsonb,
  'Chopper''s bounty is hilariously low at 100 berries because the Marines mistake him for the Straw Hats'' pet rather than a crew member. This has been a running gag throughout the series. Even after major arcs, his bounty remains absurdly low compared to his crewmates.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Portgas D. Ace''s mother?',
  'multiple_choice',
  'impossible',
  '[{"text":"Portgas D. Ann","isCorrect":false},{"text":"Portgas D. Rouge","isCorrect":true},{"text":"Monkey D. Dragon","isCorrect":false},{"text":"Gol D. Maria","isCorrect":false}]'::jsonb,
  'Ace''s mother was Portgas D. Rouge. She held Ace in her womb for 20 months through sheer willpower to protect him from the World Government, who were hunting for Roger''s child. She died shortly after giving birth due to the strain. Ace took her surname to honor her.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the specific name of Whitebeard''s Devil Fruit?',
  'multiple_choice',
  'impossible',
  '[{"text":"Magu Magu no Mi","isCorrect":false},{"text":"Gura Gura no Mi","isCorrect":true},{"text":"Yami Yami no Mi","isCorrect":false},{"text":"Mera Mera no Mi","isCorrect":false}]'::jsonb,
  'Whitebeard (Edward Newgate) possessed the Gura Gura no Mi (Tremor-Tremor Fruit), considered the strongest Paramecia-type Devil Fruit with the power to destroy the world. It creates devastating shockwaves and earthquakes. After his death, Blackbeard somehow stole this power. Magu Magu is Akainu''s Magma fruit, Yami Yami is Blackbeard''s Dark fruit.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the title of the first opening theme song for One Piece?',
  'multiple_choice',
  'impossible',
  '[{"text":"Bon Voyage!","isCorrect":false},{"text":"Hikari e","isCorrect":false},{"text":"We Are!","isCorrect":true},{"text":"Believe","isCorrect":false}]'::jsonb,
  '"We Are!" by Hiroshi Kitadani is the iconic first opening theme of One Piece. It has been used multiple times throughout the series for special episodes and milestones. "Believe" is the second opening, "Hikari e" is the third, and "Bon Voyage!" is the fourth.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'Who or what is Joy Boy, and what is his significance to the One Piece world?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was a figure from the Void Century who left a promise on the Poneglyph at Fish-Man Island and is connected to the treasure at Laugh Tale","isCorrect":true},{"text":"He is the name of Roger''s treasure at the end of the Grand Line","isCorrect":false},{"text":"He was the first King of the World Government","isCorrect":false},{"text":"He is a myth with no historical basis","isCorrect":false}]'::jsonb,
  'Joy Boy was a figure from the Void Century (800+ years ago) who left a message of apology on the Poneglyph at Fish-Man Island, promising to fulfill a covenant with the Fish-Men. He is connected to the treasure at Laugh Tale (which made Roger laugh) and to the Sun God Nika. Zunesha states that Luffy''s Gear 5 awakening is the "return of Joy Boy."'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the Revolutionary Army''s base of operations?',
  'multiple_choice',
  'impossible',
  '[{"text":"Marineford","isCorrect":false},{"text":"Baltigo","isCorrect":true},{"text":"Enies Lobby","isCorrect":false},{"text":"Kamabakka Kingdom","isCorrect":false}]'::jsonb,
  'Baltigo is the island that served as the Revolutionary Army''s headquarters for years. It was eventually discovered and destroyed by the Blackbeard Pirates and the Marines. Monkey D. Dragon is the leader of the Revolutionary Army and Luffy''s father.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What was the name of Oda''s original one-shot manga that eventually became One Piece?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wanted!","isCorrect":false},{"text":"Romance Dawn","isCorrect":true},{"text":"Pirate King","isCorrect":false},{"text":"East Blue","isCorrect":false}]'::jsonb,
  'Eiichiro Oda created two one-shot versions of "Romance Dawn" (in 1996 and 1997) before One Piece was serialized. These featured an early version of Luffy with similar rubber powers. The name "Romance Dawn" was later used as the title of One Piece''s first chapter and first arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'In which chapter of the manga did the mysterious figure Imu first appear?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 906","isCorrect":true},{"text":"Chapter 800","isCorrect":false},{"text":"Chapter 957","isCorrect":false},{"text":"Chapter 1000","isCorrect":false}]'::jsonb,
  'Imu first appeared in Chapter 906, during the Reverie arc. Imu is shown sitting on the Empty Throne in Mary Geoise — a throne that all World Government kings swore no one would sit upon. Imu''s existence is one of the greatest secrets of the World Government.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'In which chapter does Luffy first use Gear 2 in the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 387","isCorrect":false},{"text":"Chapter 388","isCorrect":true},{"text":"Chapter 400","isCorrect":false},{"text":"Chapter 375","isCorrect":false}]'::jsonb,
  'Luffy first uses Gear 2 (Gear Second) in Chapter 388 of the manga during the Enies Lobby arc, specifically in his fight against Blueno of CP9. He pumps his blood faster using his rubber blood vessels, dramatically increasing his speed and power at the cost of stamina.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'In which episode of the anime does the Sea King bite off Shanks'' left arm to save young Luffy?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 1","isCorrect":false},{"text":"Episode 4","isCorrect":true},{"text":"Episode 10","isCorrect":false},{"text":"Episode 2","isCorrect":false}]'::jsonb,
  'The scene where Shanks sacrifices his left arm to save Luffy from the Lord of the Coast (a Sea King) occurs in Episode 4 of the anime. In the manga, this happens in Chapter 1. This pivotal moment inspired Luffy to become a pirate and eventually become King of the Pirates.'
);
