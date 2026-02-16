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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the Japanese name of Gojo Satoru''s Domain Expansion?',
  'multiple_choice',
  'impossible',
  '[{"text":"Fukuma Mizushi","isCorrect":false},{"text":"Chimera Shadow Garden","isCorrect":false},{"text":"Muryōkūsho","isCorrect":true},{"text":"Jigoku Rakuen","isCorrect":false}]'::jsonb,
  'Gojo''s Domain Expansion is Muryōkūsho (無量空処), translated as "Unlimited Void" or "Infinite Void." It overwhelms the target with infinite information, paralyzing them. Fukuma Mizushi is Megumi''s incomplete domain.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Sukuna''s full title and epithet?',
  'multiple_choice',
  'impossible',
  '[{"text":"Ryomen Sukuna, the King of Curses","isCorrect":true},{"text":"Sukuna, the Lord of Calamity","isCorrect":false},{"text":"Ryomen Sukuna, the Cursed Emperor","isCorrect":false},{"text":"Sukuna, the God of Malice","isCorrect":false}]'::jsonb,
  'Sukuna''s full title is Ryomen Sukuna, the King of Curses (Noroi no Ō). "Ryomen" means "two-faced," referring to his original form with four arms and two faces. He is based on the legendary figure Ryomen-sukuna from Japanese mythology.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'How many of Sukuna''s fingers exist in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"10","isCorrect":false},{"text":"20","isCorrect":true},{"text":"15","isCorrect":false},{"text":"24","isCorrect":false}]'::jsonb,
  'There are 20 of Sukuna''s fingers in total, as Sukuna''s original form had four arms (and thus 20 fingers). Each finger is an indestructible cursed object containing a portion of his power. Yuji Itadori consumed one, which started the main plot.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the binding vow/condition Sukuna imposed on Yuji during the fight with the finger-bearer?',
  'multiple_choice',
  'impossible',
  '[{"text":"Contract of Dominion","isCorrect":false},{"text":"Enchain","isCorrect":true},{"text":"Vow of Subjugation","isCorrect":false},{"text":"Pact of the King","isCorrect":false}]'::jsonb,
  'The binding vow is called "Enchain" — Sukuna proposed conditions where he could take over Yuji''s body for one minute when he chants "Enchain," and Yuji would forget this agreement. This happened after Sukuna let Yuji die and revived him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What makes Toji Fushiguro unique among fighters in the Jujutsu Kaisen world?',
  'multiple_choice',
  'impossible',
  '[{"text":"He possesses the strongest cursed technique ever recorded","isCorrect":false},{"text":"He has absolutely zero cursed energy due to a Heavenly Restriction that gave him superhuman physical abilities","isCorrect":true},{"text":"He can absorb cursed energy from his opponents","isCorrect":false},{"text":"He was born with a Domain Expansion but no cursed technique","isCorrect":false}]'::jsonb,
  'Toji Fushiguro (born Toji Zenin) has a Heavenly Restriction that traded all of his cursed energy for extraordinary physical prowess. He has literally zero cursed energy, making him invisible to jujutsu sorcerers who sense opponents through cursed energy. This allowed him to nearly kill young Gojo.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What event is Suguru Geto infamous for committing that led to his expulsion and designation as a curse user?',
  'multiple_choice',
  'impossible',
  '[{"text":"He attempted to assassinate the higher-ups of Jujutsu society","isCorrect":false},{"text":"He massacred an entire village of over 100 civilians","isCorrect":true},{"text":"He released all the curses sealed in the barrier of Tokyo","isCorrect":false},{"text":"He killed his own parents to absorb their cursed energy","isCorrect":false}]'::jsonb,
  'Geto massacred over 100 civilians in a village in September 2007, an event known as the "Star Plasma Vessel Incident" aftermath. Disillusioned with protecting non-sorcerers, he killed the entire village (including his own parents) and was expelled from Jujutsu High, becoming a wanted curse user.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the most powerful shikigami in Megumi''s Ten Shadows Technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Nue","isCorrect":false},{"text":"Max Elephant","isCorrect":false},{"text":"Mahoraga","isCorrect":true},{"text":"Divine Dog: Totality","isCorrect":false}]'::jsonb,
  'Mahoraga (Eight-Handled Sword Divergent Sila Divine General) is the most powerful shikigami of the Ten Shadows Technique. No user in the history of the Zenin clan has ever successfully tamed it. It has the ability to adapt to any phenomenon after being hit by it.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What are the four grades of cursed spirits and sorcerers in the Jujutsu classification system, from weakest to strongest?',
  'multiple_choice',
  'impossible',
  '[{"text":"Grade 4, Grade 3, Grade 2, Grade 1, Special Grade","isCorrect":true},{"text":"D-Rank, C-Rank, B-Rank, A-Rank, S-Rank","isCorrect":false},{"text":"Apprentice, Journeyman, Expert, Master, Grand Master","isCorrect":false},{"text":"Bronze, Silver, Gold, Platinum, Diamond","isCorrect":false}]'::jsonb,
  'The grading system from weakest to strongest is: Grade 4, Grade 3, Grade 2, Semi-Grade 1, Grade 1, and Special Grade. Special Grade is the highest and most dangerous classification, reserved for entities like Gojo, Yuta, Sukuna, and the disaster curses.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who is Kenjaku, and whose body did he possess before taking over Geto''s corpse?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is an ancient sorcerer who previously inhabited Yuji''s mother, Kaori Itadori","isCorrect":true},{"text":"He is a curse spirit who previously inhabited Mechamaru","isCorrect":false},{"text":"He is Sukuna''s twin who previously inhabited Toji Fushiguro","isCorrect":false},{"text":"He is a Heian-era sorcerer who only ever possessed Geto","isCorrect":false}]'::jsonb,
  'Kenjaku is an ancient sorcerer whose cursed technique allows him to transplant his brain into other bodies. Before possessing Geto''s corpse, he inhabited the body of Yuji''s mother (shown with the characteristic stitched forehead), making Kenjaku technically Yuji''s "parent."'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'In which manga chapter is Gojo Satoru sealed in the Prison Realm?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chapter 85","isCorrect":false},{"text":"Chapter 91","isCorrect":true},{"text":"Chapter 100","isCorrect":false},{"text":"Chapter 78","isCorrect":false}]'::jsonb,
  'Gojo is sealed inside the Prison Realm in Chapter 91 of the manga, during the Shibuya Incident arc. Kenjaku (in Geto''s body) exploited Gojo''s emotional reaction to seeing his dead friend''s face, freezing him for the required amount of time.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Who directed the first season of the Jujutsu Kaisen anime, and which studio produced it?',
  'multiple_choice',
  'impossible',
  '[{"text":"Haruo Sotozaki at Ufotable","isCorrect":false},{"text":"Sunghoo Park at MAPPA","isCorrect":true},{"text":"Tetsurō Araki at WIT Studio","isCorrect":false},{"text":"Takeshi Obata at Bones","isCorrect":false}]'::jsonb,
  'Sunghoo Park directed JJK Season 1 at MAPPA studio. His dynamic action direction, particularly in fights like Yuji and Todo vs. Hanami, earned widespread acclaim. Shōta Goshozono took over directing duties for Season 2.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the specific name of Nobara Kugisaki''s jujutsu technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Straw Doll Technique","isCorrect":true},{"text":"Voodoo Binding","isCorrect":false},{"text":"Resonance Needle Art","isCorrect":false},{"text":"Cursed Nail Formation","isCorrect":false}]'::jsonb,
  'Nobara''s technique is the Straw Doll Technique (Sutorō Dōru). It allows her to damage opponents through a voodoo-like resonance by using nails, a hammer, and a straw effigy. Her signature moves include "Resonance" and "Hairpin," which channel cursed energy through nails.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What was the name of Yuji Itadori''s high school before he transferred to Tokyo Jujutsu High?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sugisawa Third High School","isCorrect":true},{"text":"Kunimi Municipal High School","isCorrect":false},{"text":"Sendai First High School","isCorrect":false},{"text":"Miyagi Prefectural High School","isCorrect":false}]'::jsonb,
  'Yuji attended Sugisawa Third High School in Sendai, Miyagi Prefecture. He was a member of the Occult Research Club there, which is how he and his clubmates ended up finding one of Sukuna''s fingers sealed at the school.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Todo''s Boogie Woogie technique''s specific activation requirement?',
  'multiple_choice',
  'impossible',
  '[{"text":"He must snap his fingers","isCorrect":false},{"text":"He must clap his hands together","isCorrect":true},{"text":"He must stomp the ground","isCorrect":false},{"text":"He must make eye contact with both targets","isCorrect":false}]'::jsonb,
  'Todo''s Boogie Woogie activates when he claps his hands together, allowing him to swap the positions of any two things within his range that contain cursed energy (including himself). The speed of the swap and the ability to chain multiple swaps makes it devastatingly effective in combat.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of Mahito''s cursed technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Body Reprogramming","isCorrect":false},{"text":"Soul Multiplication","isCorrect":false},{"text":"Idle Transfiguration","isCorrect":true},{"text":"Cursed Metamorphosis","isCorrect":false}]'::jsonb,
  'Mahito''s cursed technique is Idle Transfiguration (Mukui Tenpen). It allows him to reshape souls, which in turn reshapes the body. He can distort humans into grotesque shapes, shrink them, or even merge multiple people together. It can also be used on his own body for combat adaptation.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'Why was Yuta Okkotsu classified as Special Grade upon entering Jujutsu High?',
  'multiple_choice',
  'impossible',
  '[{"text":"He could use Reverse Cursed Technique from birth","isCorrect":false},{"text":"He was haunted by the immensely powerful cursed spirit of his childhood friend Rika Orimoto","isCorrect":true},{"text":"He possessed a natural Domain Expansion","isCorrect":false},{"text":"He had inherited the Six Eyes like Gojo","isCorrect":false}]'::jsonb,
  'Yuta was classified as Special Grade because he was connected to the extremely powerful cursed spirit Rika Orimoto — his childhood friend who died and became a vengeful curse bound to him. Rika was called the "Queen of Curses" and possessed near-infinite cursed energy.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What are the three great vengeful spirits of Japan referenced in Jujutsu Kaisen lore?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sukuna, Kenjaku, and Tengen","isCorrect":false},{"text":"Sugawara Michizane, Taira no Masakado, and Emperor Sutoku","isCorrect":true},{"text":"Amaterasu, Tsukuyomi, and Susanoo","isCorrect":false},{"text":"Izanagi, Izanami, and Raijin","isCorrect":false}]'::jsonb,
  'The three great vengeful spirits of Japan are Sugawara Michizane, Taira no Masakado, and Emperor Sutoku. In JJK, Yuta Okkotsu is a descendant of Sugawara Michizane, which partly explains his enormous cursed energy reserves.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'How is Choso related to Yuji Itadori?',
  'multiple_choice',
  'impossible',
  '[{"text":"They are completely unrelated — Choso is delusional","isCorrect":false},{"text":"They share the same mother through Kenjaku, who possessed both Choso''s and Yuji''s mothers","isCorrect":true},{"text":"Yuji is a reincarnation of one of Choso''s brothers","isCorrect":false},{"text":"They were both created by Sukuna in the Heian era","isCorrect":false}]'::jsonb,
  'Choso and Yuji are half-brothers through Kenjaku. Kenjaku (the brain-transplanting sorcerer) possessed a woman 150 years ago and mixed her blood with cursed spirits to create the Death Painting Wombs (Choso and his brothers). Kenjaku later possessed Yuji''s mother to give birth to Yuji. Thus Kenjaku is the "parent" of both.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the barrier technique used to trap civilians during the Shibuya Incident?',
  'multiple_choice',
  'impossible',
  '[{"text":"Curtain","isCorrect":true},{"text":"Veil","isCorrect":false},{"text":"Domain Shield","isCorrect":false},{"text":"Hollow Barrier","isCorrect":false}]'::jsonb,
  'The barrier technique used is called a "Curtain" (Tobari). During the Shibuya Incident, multiple Curtains were deployed to trap non-sorcerers in Shibuya Station and prevent jujutsu sorcerers from easily entering or leaving specific areas.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'How does the Reverse Cursed Technique work mechanically?',
  'multiple_choice',
  'impossible',
  '[{"text":"It reverses time on injured tissue","isCorrect":false},{"text":"It multiplies negative cursed energy by itself to create positive energy, which heals","isCorrect":true},{"text":"It absorbs cursed energy from the environment to restore cells","isCorrect":false},{"text":"It converts physical pain into healing factor","isCorrect":false}]'::jsonb,
  'Reverse Cursed Technique works by multiplying negative cursed energy by negative cursed energy, producing positive energy (a negative times a negative equals a positive). This positive energy can heal injuries. Very few sorcerers can perform this — Gojo and Shoko Ieiri being notable exceptions.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Mechamaru''s real name, and what is his Heavenly Restriction?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kokichi Muta — born with a fragile body but can control cursed energy puppets from vast distances","isCorrect":true},{"text":"Takuma Ino — born blind but can see through cursed energy","isCorrect":false},{"text":"Arata Nitta — born mute but can communicate through barriers","isCorrect":false},{"text":"Panda — an artificial being with no human body at all","isCorrect":false}]'::jsonb,
  'Mechamaru''s real name is Kokichi Muta. His Heavenly Restriction gave him an immobile, sickly body (he''s bedridden and covered in bandages) but in exchange, his cursed energy output covers the entire country of Japan, allowing him to control the puppet "Mechamaru" from anywhere.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the origin of the Simple Domain technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"It was created by Gojo''s ancestor","isCorrect":false},{"text":"New Shadow Style — a school of swordsmanship that developed it as a counter to Domain Expansions","isCorrect":true},{"text":"It is a natural ability that all Grade 1 sorcerers develop","isCorrect":false},{"text":"It was stolen from the cursed spirits of the Heian era","isCorrect":false}]'::jsonb,
  'Simple Domain (Ryuiki Tenkai) originates from the New Shadow Style school of swordsmanship. It was developed as a counter to Domain Expansions, creating a small domain around the user that neutralizes the guaranteed-hit effect of an enemy''s domain. Miwa''s swordsmanship comes from this school.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the title of the first opening theme song for Jujutsu Kaisen Season 1?',
  'multiple_choice',
  'impossible',
  '[{"text":"Vivid Vice","isCorrect":false},{"text":"Specialz","isCorrect":false},{"text":"Kaikai Kitan","isCorrect":true},{"text":"Where Our Blue Is","isCorrect":false}]'::jsonb,
  '"Kaikai Kitan" by Eve is the first opening for JJK Season 1. The song became massively popular worldwide. "Vivid Vice" is the second cour opening of Season 1, and "Specialz" by King Gnu is the Season 2 Shibuya Incident opening.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Naobito Zenin''s cursed technique, and what is its unique mechanic?',
  'multiple_choice',
  'impossible',
  '[{"text":"Projection Sorcery — divides one second into 24 frames and allows pre-set movements within that timeframe","isCorrect":true},{"text":"Time Freeze — stops time for everyone except himself for 3 seconds","isCorrect":false},{"text":"Speed Demon — doubles his movement speed for each consecutive hit","isCorrect":false},{"text":"Flash Step — teleports short distances by burning cursed energy","isCorrect":false}]'::jsonb,
  'Naobito''s Projection Sorcery divides one second into 24 frames (like animation), and he can trace a predetermined set of movements within that 1/24th of a second. Anyone who cannot keep up with this frame rate when touched by him gets frozen for one second in an animation frame.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'In which manga magazine is Jujutsu Kaisen serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Monthly Shōnen Gangan","isCorrect":false},{"text":"Weekly Shōnen Magazine","isCorrect":false},{"text":"Weekly Shōnen Jump","isCorrect":true},{"text":"Bessatsu Shōnen Magazine","isCorrect":false}]'::jsonb,
  'Jujutsu Kaisen by Gege Akutami is serialized in Weekly Shōnen Jump (Shueisha) since March 2018. It is one of the magazine''s flagship titles alongside One Piece. Akutami previously published "Tokyo Metropolitan Curse Technical School" (JJK 0) in Jump GIGA.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the exact multiplier applied to a Black Flash attack compared to a normal cursed energy attack?',
  'multiple_choice',
  'impossible',
  '[{"text":"2.0x the normal impact","isCorrect":false},{"text":"3.5x the normal impact","isCorrect":false},{"text":"2.5x the normal impact (to the power of 2.5)","isCorrect":true},{"text":"5.0x the normal impact","isCorrect":false}]'::jsonb,
  'A Black Flash creates a spatial distortion when cursed energy is applied within 0.000001 seconds of a physical hit. The resulting impact is equal to the normal hit raised to the power of 2.5 (not simply multiplied by 2.5). This makes Black Flash exponentially more powerful than normal attacks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What self-estimated temperature does Jogo claim his Domain Expansion can reach?',
  'multiple_choice',
  'impossible',
  '[{"text":"The surface of the sun","isCorrect":false},{"text":"Over 1,000 degrees Celsius","isCorrect":false},{"text":"He never specified a temperature","isCorrect":false},{"text":"Hot enough to instantly burn a normal human to ash","isCorrect":true}]'::jsonb,
  'Jogo''s Domain Expansion "Coffin of the Iron Mountain" creates a volcanic environment so hot that any normal human caught inside would be instantly incinerated. Gojo was the only one to survive it unscathed due to his Infinity technique. Jogo boasted his domain''s heat was unmatched.'
);

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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What exact percentage of the global population is born with a Quirk in the MHA world?',
  'multiple_choice',
  'impossible',
  '[{"text":"About 70%","isCorrect":false},{"text":"About 80%","isCorrect":true},{"text":"About 90%","isCorrect":false},{"text":"About 60%","isCorrect":false}]'::jsonb,
  'Approximately 80% of the world''s population possesses a Quirk, leaving roughly 20% Quirkless. Deku was born into this 20% minority before receiving One For All from All Might. The first Quirk manifested in a luminescent baby in Qingqing, China.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What generation number of One For All user is Izuku Midoriya?',
  'multiple_choice',
  'impossible',
  '[{"text":"The 8th user","isCorrect":false},{"text":"The 10th user","isCorrect":false},{"text":"The 9th user","isCorrect":true},{"text":"The 7th user","isCorrect":false}]'::jsonb,
  'Deku is the 9th user of One For All. The lineage goes: 1st - Yoichi Shigaraki, 2nd and 3rd - unnamed resistance fighters, 4th - Hikage Shinomori, 5th - Daigoro Banjo, 6th - En, 7th - Nana Shimura, 8th - All Might (Toshinori Yagi), 9th - Izuku Midoriya.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the real name of All For One''s personal doctor who helps him create Nomu?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dr. Tsubasa","isCorrect":false},{"text":"Dr. Kyudai Garaki","isCorrect":true},{"text":"Dr. Shiga Maruta","isCorrect":false},{"text":"Dr. Ujiko Daruma","isCorrect":false}]'::jsonb,
  'The doctor''s real name is Dr. Kyudai Garaki. He was previously known as "Daruma Ujiko" before a name change by the author. He has been All For One''s loyal follower for over a century, using his Quirk research to create the Nomu and duplicate Quirks.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Who was the original first user of One For All?',
  'multiple_choice',
  'impossible',
  '[{"text":"Nana Shimura","isCorrect":false},{"text":"All Might","isCorrect":false},{"text":"Yoichi Shigaraki, All For One''s younger brother","isCorrect":true},{"text":"Hikage Shinomori","isCorrect":false}]'::jsonb,
  'The first user of One For All was Yoichi Shigaraki, the younger brother of All For One. He was thought to be Quirkless, but he actually had a power-stockpiling Quirk. When AFO forcibly gave him a power-transfer Quirk, it merged with his existing Quirk to create One For All.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Endeavor''s real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Todoroki Shoto","isCorrect":false},{"text":"Todoroki Natsuo","isCorrect":false},{"text":"Todoroki Enji","isCorrect":true},{"text":"Todoroki Toya","isCorrect":false}]'::jsonb,
  'Endeavor''s real name is Enji Todoroki. He is the No. 1 Hero after All Might''s retirement, and father to Shoto, Toya (Dabi), Fuyumi, and Natsuo. His obsession with surpassing All Might led to his abusive treatment of his family.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'How many students are in Class 1-A at U.A. High School?',
  'multiple_choice',
  'impossible',
  '[{"text":"15","isCorrect":false},{"text":"25","isCorrect":false},{"text":"20","isCorrect":true},{"text":"22","isCorrect":false}]'::jsonb,
  'There are exactly 20 students in Class 1-A. Notable members include Midoriya, Bakugo, Todoroki, Uraraka, Iida, Asui, Tokoyami, Yaoyorozu, Kirishima, Kaminari, Jiro, Ashido, Mineta, Aoyama, Sero, Ojiro, Sato, Koda, Shoji, and Hagakure.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the official name of the hero licensing exam that Class 1-A takes?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Hero Certification Trial","isCorrect":false},{"text":"The Provisional Hero License Exam","isCorrect":true},{"text":"The National Hero Assessment","isCorrect":false},{"text":"The Pro Hero Qualification Test","isCorrect":false}]'::jsonb,
  'The Provisional Hero License Exam is held annually and allows students to use their Quirks in emergency situations before graduating. The exam consists of thinning rounds and a rescue exercise. Bakugo and Todoroki famously failed their first attempt.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Mirio Togata''s hero name, and what is the specific mechanic of his Quirk "Permeation"?',
  'multiple_choice',
  'impossible',
  '[{"text":"Lemillion — he can phase through solid matter but loses all his senses while phased and falls through the ground if not careful","isCorrect":true},{"text":"Suneater — he can pass through walls but only for 3 seconds at a time","isCorrect":false},{"text":"Phantom — he becomes invisible and intangible simultaneously","isCorrect":false},{"text":"Lemillion — he teleports short distances through solid objects","isCorrect":false}]'::jsonb,
  'Mirio''s hero name is Lemillion (from his goal to save a million people). His Quirk "Permeation" lets him phase through matter, but while active, he can''t see, hear, or breathe since light, sound, and air also pass through him. He must constantly toggle it on body parts to fight, requiring immense training.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Hawks'' real name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Takami Keigo","isCorrect":true},{"text":"Todoroki Toya","isCorrect":false},{"text":"Bubaigawara Jin","isCorrect":false},{"text":"Shimura Tenko","isCorrect":false}]'::jsonb,
  'Hawks'' real name is Keigo Takami. He became the No. 2 Hero at age 22 — the youngest top hero in history. His real name was kept secret for most of the series. Todoroki Toya is Dabi, Bubaigawara Jin is Twice, and Shimura Tenko is Shigaraki.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What mental condition affects Twice (Jin Bubaigawara), and how does it impact his Quirk?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dissociative identity disorder — his clones have different personalities he can''t control","isCorrect":false},{"text":"A trauma-induced identity crisis — he once cloned himself, his clones fought over who was the original, and the trauma left him unable to use his Quirk without a mental breakdown","isCorrect":true},{"text":"Amnesia — he forgets which clone is the real him","isCorrect":false},{"text":"Paranoia — he believes all his allies are secretly his clones","isCorrect":false}]'::jsonb,
  'Twice cloned himself to ease his loneliness, but his clones argued over who was real and killed each other. The trauma gave him a severe identity crisis, making him unable to clone himself without breaking down. He overcame this during the Meta Liberation Army arc, becoming extremely powerful before Hawks killed him.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the leader of the Meta Liberation Army?',
  'multiple_choice',
  'impossible',
  '[{"text":"Trumpet","isCorrect":false},{"text":"Skeptic","isCorrect":false},{"text":"Re-Destro (Rikiya Yotsubashi)","isCorrect":true},{"text":"Curious","isCorrect":false}]'::jsonb,
  'Re-Destro, real name Rikiya Yotsubashi, is the leader of the Meta Liberation Army and CEO of Detnerat. He is the son of Destro, the original Meta Liberation Army founder. After being defeated by Shigaraki, he submits and merges his army with the League of Villains to form the Paranormal Liberation Front.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Gigantomachia''s role and relationship to All For One?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is All For One''s bodyguard and most loyal servant, designed to only obey his master","isCorrect":true},{"text":"He is a Nomu prototype that went out of control","isCorrect":false},{"text":"He is All For One''s brother transformed into a giant","isCorrect":false},{"text":"He is a natural-born villain with no connection to All For One","isCorrect":false}]'::jsonb,
  'Gigantomachia is All For One''s most devoted bodyguard and servant. He possesses multiple Quirks given to him by AFO and was ordered to test and serve AFO''s successor, Shigaraki. He only submits to those he recognizes as his master, rampaging for 48 hours straight to test Shigaraki''s worthiness.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Eri''s Quirk called, and how specifically does it work?',
  'multiple_choice',
  'impossible',
  '[{"text":"Restore — it heals any injury by reversing cellular damage","isCorrect":false},{"text":"Rewind — it reverses a living being''s body to a previous state by rewinding their biological clock","isCorrect":true},{"text":"Reset — it returns objects and people to their original factory state","isCorrect":false},{"text":"Regress — it de-ages anyone she touches by exactly one year","isCorrect":false}]'::jsonb,
  'Eri''s Quirk is called Rewind. It can reverse a living being''s body to a previous state — she can heal injuries, remove Quirks (by rewinding to before the Quirk manifested), or even rewind someone out of existence entirely. Overhaul exploited her Quirk to create Quirk-destroying bullets.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'Which animation studio produces My Hero Academia, and who is the series director?',
  'multiple_choice',
  'impossible',
  '[{"text":"MAPPA, directed by Sunghoo Park","isCorrect":false},{"text":"Bones, directed by Kenji Nagasaki","isCorrect":true},{"text":"Ufotable, directed by Haruo Sotozaki","isCorrect":false},{"text":"Toei Animation, directed by Tatsuya Nagamine","isCorrect":false}]'::jsonb,
  'My Hero Academia is produced by Bones (known for Fullmetal Alchemist: Brotherhood and Mob Psycho 100). The series director is Kenji Nagasaki, who has directed the show since its first season in 2016.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What was Shigaraki''s original name before All For One took him in?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tenko Shimura","isCorrect":true},{"text":"Tomura Shimura","isCorrect":false},{"text":"Tenko Shigaraki","isCorrect":false},{"text":"Kotaro Shimura","isCorrect":false}]'::jsonb,
  'Shigaraki''s birth name was Tenko Shimura. He is the grandson of Nana Shimura (the 7th One For All user). After his Quirk "Decay" accidentally killed his entire family, All For One found him and renamed him Tomura Shigaraki, raising him as his successor. Kotaro was his father''s name.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'How many Quirks are stockpiled within One For All that Deku can access?',
  'multiple_choice',
  'impossible',
  '[{"text":"5 Quirks from previous users","isCorrect":false},{"text":"8 Quirks from all previous users","isCorrect":false},{"text":"7 Quirks — 6 from previous users plus the base power-stockpiling Quirk","isCorrect":true},{"text":"9 Quirks — one from each user","isCorrect":false}]'::jsonb,
  'One For All contains 7 Quirks total: the base stockpiling Quirk, plus 6 Quirks from the 2nd through 7th users. All Might (8th) was Quirkless, so he didn''t add a Quirk. The 6 additional Quirks include Blackwhip, Float, Danger Sense, Smokescreen, Fa Jin, and the 2nd user''s Quirk (Gearshift).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the Japanese name for U.A. High School?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yūei Kōkō","isCorrect":true},{"text":"Hīrō Gakuen","isCorrect":false},{"text":"Boku no Kōkō","isCorrect":false},{"text":"Akademī Kōtōgakkō","isCorrect":false}]'::jsonb,
  'U.A. High School is called Yūei Kōkō (雄英高校) in Japanese. "Yūei" is a play on words — it sounds like the English letters "U.A." but the kanji characters mean "heroic" or "outstanding." The school''s acceptance rate is less than 1 in 300.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Stain''s real name, and what is his core ideology?',
  'multiple_choice',
  'impossible',
  '[{"text":"Chizome Akaguro — he believes only All Might is a true hero, and all others are fakes motivated by fame and money","isCorrect":true},{"text":"Dabi — he believes heroes are hypocrites who hide their true nature","isCorrect":false},{"text":"Gentle Criminal — he believes heroism should be accessible to everyone","isCorrect":false},{"text":"Stendhal — he believes society itself is the true villain","isCorrect":false}]'::jsonb,
  'Stain''s real name is Chizome Akaguro (also known as "Hero Killer: Stain"). His ideology is that modern heroes are corrupt, motivated by fame and money rather than true heroism. He believes only All Might embodies real heroism. He previously went by "Stendhal" before becoming Stain.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What percentage of One For All''s power could Deku safely use at the very beginning of his training?',
  'multiple_choice',
  'impossible',
  '[{"text":"1%","isCorrect":false},{"text":"10%","isCorrect":false},{"text":"5%","isCorrect":true},{"text":"0% — any usage broke his bones","isCorrect":false}]'::jsonb,
  'Initially, Deku could not control One For All at all, with any usage at 100% shattering his bones. After training with Gran Torino, he learned "Full Cowl" and could safely sustain 5% of One For All throughout his body. He gradually increased this to 8%, then 20%, 30%, and eventually 45% during the story.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What shocking secret about Yuga Aoyama is revealed in the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is actually a Nomu in disguise","isCorrect":false},{"text":"He was the UA traitor, forced to spy for All For One who gave him his Quirk","isCorrect":true},{"text":"He is related to All For One by blood","isCorrect":false},{"text":"His Quirk is actually stolen from another hero","isCorrect":false}]'::jsonb,
  'Aoyama is revealed as the UA traitor. He was originally Quirkless, and his parents made a deal with All For One, who gave Aoyama the Navel Laser Quirk (which his body can''t fully handle). In exchange, Aoyama was forced to feed information about UA to All For One. He eventually turns against AFO with the help of his classmates.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'In the U.A. Sports Festival tournament, who defeats Shoto Todoroki?',
  'multiple_choice',
  'impossible',
  '[{"text":"Izuku Midoriya","isCorrect":false},{"text":"Katsuki Bakugo","isCorrect":true},{"text":"Fumikage Tokoyami","isCorrect":false},{"text":"Tenya Iida","isCorrect":false}]'::jsonb,
  'Bakugo defeats Todoroki in the finals of the Sports Festival. However, Todoroki refused to use his fire side during the match (despite Midoriya''s efforts to get him to accept it in their earlier fight), which frustrated Bakugo who wanted to win against Todoroki at full power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the title of the first opening theme song for My Hero Academia?',
  'multiple_choice',
  'impossible',
  '[{"text":"Peace Sign","isCorrect":false},{"text":"The Day","isCorrect":true},{"text":"Odd Future","isCorrect":false},{"text":"Polaris","isCorrect":false}]'::jsonb,
  '"The Day" by Porno Graffitti is the first opening theme for MHA Season 1. "Peace Sign" by Kenshi Yonezu is the Season 2 opening, "Odd Future" by UVERworld is Season 3''s first opening, and "Polaris" by BLUE ENCOUNT is Season 4''s opening.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Gran Torino''s connection to the previous One For All user?',
  'multiple_choice',
  'impossible',
  '[{"text":"He was Nana Shimura''s close friend and sworn protector who helped train All Might","isCorrect":true},{"text":"He was the 6th user of One For All","isCorrect":false},{"text":"He was All Might''s father","isCorrect":false},{"text":"He was All For One''s former ally who defected","isCorrect":false}]'::jsonb,
  'Gran Torino (Sorahiko Torino) was close friends with Nana Shimura, the 7th One For All user. After Nana''s death at All For One''s hands, Gran Torino took on the role of training the young Toshinori Yagi (All Might) and later helped train Deku as well.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the official name of Bakugo''s ultimate super move?',
  'multiple_choice',
  'impossible',
  '[{"text":"Explosion God Dynamite","isCorrect":false},{"text":"AP Shot: Auto Cannon","isCorrect":false},{"text":"Howitzer Impact","isCorrect":true},{"text":"Stun Grenade Maximum","isCorrect":false}]'::jsonb,
  'Bakugo''s ultimate move is Howitzer Impact. He spins in the air to build up sweat (nitroglycerin), then releases it all in a massive explosion. He first uses it in the Sports Festival finals against Todoroki. AP Shot is a focused blast technique, not his ultimate move.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Overhaul''s real name, and how does his Quirk work specifically?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kai Chisaki — his Quirk lets him disassemble and reassemble matter with a touch","isCorrect":true},{"text":"Hari Kurono — his Quirk lets him fuse with anything he touches","isCorrect":false},{"text":"Shin Nemoto — his Quirk lets him destroy anything within a 10-meter radius","isCorrect":false},{"text":"Joi Irinaka — his Quirk lets him control the molecular structure of his environment","isCorrect":false}]'::jsonb,
  'Overhaul''s real name is Kai Chisaki. His Quirk allows him to disassemble anything he touches and reassemble it in any configuration. He can destroy people instantly, heal injuries, fuse with others, and reshape his environment. He used it to repeatedly kill and restore Eri to harvest her Quirk factor.'
);
