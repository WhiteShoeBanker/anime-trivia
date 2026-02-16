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
);

-- Death Note (+1)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'death-note'),
  'In the pilot chapter/one-shot of Death Note, what was different about the notebook''s design compared to the final series?',
  'multiple_choice',
  'impossible',
  '[{"text":"It was called the Death Eraser instead","isCorrect":false},{"text":"The pilot featured a \"Death Eraser\" that could undo the Death Note''s effect, which was removed from the final series","isCorrect":true},{"text":"The notebook was red instead of black","isCorrect":false},{"text":"There were two notebooks from the start","isCorrect":false}]'::jsonb,
  'In the original Death Note pilot one-shot by Ohba and Obata (published in 2003), there was a "Death Eraser" that could bring people back to life if used before they were cremated or fully decomposed. This concept was scrapped for the serialized manga to maintain higher dramatic stakes.'
);

-- Demon Slayer (+3)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the creator/mangaka of Demon Slayer: Kimetsu no Yaiba?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hajime Isayama","isCorrect":false},{"text":"Gege Akutami","isCorrect":false},{"text":"Koyoharu Gotouge","isCorrect":true},{"text":"Eiichiro Oda","isCorrect":false}]'::jsonb,
  'Koyoharu Gotouge is the creator of Demon Slayer. They are notably private, using a crocodile wearing glasses as their author avatar. Demon Slayer was their first serialized work, beginning in Weekly Shōnen Jump in 2016 and becoming one of the best-selling manga of all time.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the exact name of Shinobu Kocho''s unique fighting style as the Insect Hashira?',
  'multiple_choice',
  'impossible',
  '[{"text":"She uses standard Insect Breathing sword strikes to cut demon necks","isCorrect":false},{"text":"She uses a modified katana with a thin stinger-like blade to inject wisteria-based poison into demons since she lacks the physical strength to behead them","isCorrect":true},{"text":"She summons poisonous insects to fight for her","isCorrect":false},{"text":"She coats her entire body in wisteria poison and fights bare-handed","isCorrect":false}]'::jsonb,
  'Shinobu is the only Hashira who cannot cut a demon''s head off due to her small stature and lack of raw strength. Instead, she uses a specially modified katana with a thin, needle-like tip to stab demons and inject lethal doses of wisteria-derived poison. She created this fighting method herself.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the swordsmith who forges Tanjiro''s Nichirin sword?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kozo Kanamori","isCorrect":false},{"text":"Hotaru Haganezuka","isCorrect":true},{"text":"Kotetsu","isCorrect":false},{"text":"Tecchikawahara Tekkotsuchi","isCorrect":false}]'::jsonb,
  'Hotaru Haganezuka is the swordsmith who forges Tanjiro''s Nichirin swords. He is extremely passionate about his craft and becomes furiously angry whenever Tanjiro breaks his swords. He wears a hyottoko mask and is known for his violent temper and single-minded dedication to sword-making.'
);

-- Dragon Ball Z (+1)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of the planet where Goku learned the Instant Transmission technique after the Frieza saga?',
  'multiple_choice',
  'impossible',
  '[{"text":"Planet Kanassa","isCorrect":false},{"text":"Planet Yardrat","isCorrect":true},{"text":"Planet Arlia","isCorrect":false},{"text":"New Planet Vegeta","isCorrect":false}]'::jsonb,
  'After Namek''s explosion, Goku landed on Planet Yardrat, where the native Yardratians taught him the Instant Transmission technique (Shunkan Idō). Despite their small and unassuming appearance, the Yardratians possess advanced techniques involving spirit control and teleportation.'
);

-- Jujutsu Kaisen (+2)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is the name of the cursed tool that Toji Fushiguro uses to bypass cursed energy defenses?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Playful Cloud","isCorrect":false},{"text":"The Inverted Spear of Heaven","isCorrect":true},{"text":"The Black Rope","isCorrect":false},{"text":"Dragon-Bone","isCorrect":false}]'::jsonb,
  'The Inverted Spear of Heaven (Tengyoku) is a cursed tool that can nullify any cursed technique it touches. Toji used it to bypass Gojo''s Infinity during their fight in the Hidden Inventory arc. It is one of the most powerful anti-sorcery weapons in existence.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'jujutsu-kaisen'),
  'What is Panda''s true nature? He is not actually a panda bear.',
  'multiple_choice',
  'impossible',
  '[{"text":"He is a cursed spirit shaped like a panda","isCorrect":false},{"text":"He is an Abrupt Mutated Cursed Corpse created by Principal Yaga with three cores","isCorrect":true},{"text":"He is a transformed shikigami bound to Yaga","isCorrect":false},{"text":"He is a real panda that gained sentience from cursed energy exposure","isCorrect":false}]'::jsonb,
  'Panda is an Abrupt Mutated Cursed Corpse, a puppet created by Tokyo Jujutsu High''s principal Masamichi Yaga. Unlike normal cursed corpses, Panda has his own will and three cores: Panda (balanced), Gorilla (power), and a third triceratops-like core. Each core gives him different fighting abilities.'
);

-- My Hero Academia (+4)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the name of the support course student who frequently builds gadgets for Deku?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mei Hatsume","isCorrect":true},{"text":"Ibara Shiozaki","isCorrect":false},{"text":"Momo Yaoyorozu","isCorrect":false},{"text":"Melissa Shield","isCorrect":false}]'::jsonb,
  'Mei Hatsume is a support course student at UA known for her eccentric personality and obsession with creating inventions she calls her "babies." She developed several support items for Deku, including his upgraded gloves and air force boots that help him fight without destroying his body.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is the specific name of Todoroki Shoto''s ultimate move that combines both his fire and ice sides?',
  'multiple_choice',
  'impossible',
  '[{"text":"Flashfire Fist — Hell Spider","isCorrect":false},{"text":"Half-Cold Half-Hot Maximum","isCorrect":false},{"text":"Flashfreeze Heatwave","isCorrect":true},{"text":"Absolute Zero Flame","isCorrect":false}]'::jsonb,
  'Flashfreeze Heatwave is Todoroki''s technique that rapidly shifts between extreme cold and extreme heat. By cooling the air to its limit with his ice side and then instantly superheating it with his fire side, he creates a devastating shockwave. This represents his acceptance of both sides of his power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Dabi''s true identity as revealed in the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"He is a clone of Endeavor created by Dr. Garaki","isCorrect":false},{"text":"He is Toya Todoroki, Endeavor''s eldest son who was presumed dead","isCorrect":true},{"text":"He is an escaped Nomu with fire powers","isCorrect":false},{"text":"He is Natsuo Todoroki with a disguise Quirk","isCorrect":false}]'::jsonb,
  'Dabi is Toya Todoroki, Endeavor''s eldest son who was believed to have died in a training accident. He survived with severe burn scars covering his body and spent years plotting revenge against Endeavor. He revealed his identity publicly during the Paranormal Liberation War to destroy Endeavor''s reputation.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'my-hero-academia'),
  'What is Toga Himiko''s Quirk called, and what does it require to activate?',
  'multiple_choice',
  'impossible',
  '[{"text":"Transform — she must consume the target''s blood to take their appearance and, when awakened, their Quirk","isCorrect":true},{"text":"Mimic — she copies anyone she sees for up to one hour","isCorrect":false},{"text":"Shapeshift — she can become anyone at will with no requirements","isCorrect":false},{"text":"Blood Clone — she creates duplicates from blood samples","isCorrect":false}]'::jsonb,
  'Toga''s Quirk is called Transform. She must ingest a target''s blood to take on their physical appearance. The duration depends on how much blood she consumes. After her Quirk awakened during the Meta Liberation Army arc, she gained the ability to also copy the Quirks of people she transforms into.'
);

-- Naruto (+2)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of Naruto''s signature technique that combines a Rasengan with his Wind chakra nature?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wind Style: Rasengan","isCorrect":false},{"text":"Rasenshuriken","isCorrect":true},{"text":"Rasen-Tarengan","isCorrect":false},{"text":"Oodama Rasengan","isCorrect":false}]'::jsonb,
  'The Rasenshuriken (Wind Release: Rasenshuriken) combines the Rasengan with Wind chakra nature, creating microscopic wind blades that sever chakra pathways at the cellular level. Tsunade initially forbade its use because it also damaged Naruto''s arm. He later learned to throw it using Sage Mode, solving the self-damage problem.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'naruto'),
  'What is the name of the location where Naruto trained to control the Nine-Tails'' chakra?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mount Myōboku","isCorrect":false},{"text":"The Falls of Truth on the Island Turtle","isCorrect":true},{"text":"The Forest of Death","isCorrect":false},{"text":"The Valley of the End","isCorrect":false}]'::jsonb,
  'Naruto trained to control Kurama''s chakra at the Falls of Truth, located on a giant moving island turtle (Genbu). Killer Bee guided him through the process. At the Falls of Truth, Naruto first had to confront and accept his inner darkness (Dark Naruto) before he could challenge the Nine-Tails for its chakra.'
);

-- One Piece (+3)
INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of the island where the Straw Hat Pirates'' ship Thousand Sunny was built?',
  'multiple_choice',
  'impossible',
  '[{"text":"Enies Lobby","isCorrect":false},{"text":"Water 7","isCorrect":true},{"text":"Sabaody Archipelago","isCorrect":false},{"text":"Thriller Bark","isCorrect":false}]'::jsonb,
  'The Thousand Sunny was built at Water 7 by Franky (with help from the Galley-La Company shipwrights) using wood from the Treasure Tree Adam. It replaced the Going Merry, which was given a Viking funeral after the Enies Lobby arc. Water 7 is the world''s premier shipbuilding island.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Franky''s signature attack that he charges using cola?',
  'multiple_choice',
  'impossible',
  '[{"text":"Franky Fireball","isCorrect":false},{"text":"Radical Beam","isCorrect":false},{"text":"Coup de Burst","isCorrect":false},{"text":"Coup de Vent","isCorrect":true}]'::jsonb,
  'Coup de Vent is Franky''s powerful air cannon attack fired from his arms, powered by cola stored in his body. Coup de Burst is the Thousand Sunny''s cannon system that launches the ship through the air. After his timeskip upgrades, Franky gained the Radical Beam (a laser like Kizaru''s).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'one-piece'),
  'What is the name of Zoro''s strongest Three Sword Style technique before the timeskip?',
  'multiple_choice',
  'impossible',
  '[{"text":"Oni Giri","isCorrect":false},{"text":"Sanzen Sekai (Three Thousand Worlds)","isCorrect":true},{"text":"Tatsumaki","isCorrect":false},{"text":"Shishi Sonson","isCorrect":false}]'::jsonb,
  'Sanzen Sekai (Three Thousand Worlds) is Zoro''s strongest pre-timeskip Three Sword Style technique, where he spins his two hand swords in a helicopter-like motion while charging. He first uses it against Mihawk at the Baratie. Oni Giri is his basic three-sword attack, and Shishi Sonson is a one-sword technique.'
);
