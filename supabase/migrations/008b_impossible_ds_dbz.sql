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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How many forms does Sun Breathing (Hinokami Kagura) have in total?',
  'multiple_choice',
  'impossible',
  '[{"text":"10 forms","isCorrect":false},{"text":"12 forms","isCorrect":false},{"text":"13 forms","isCorrect":true},{"text":"9 forms","isCorrect":false}]'::jsonb,
  'Sun Breathing has 13 forms in total. The 13th form is a continuous cycle that connects all 12 forms into an endless loop. Tanjiro''s father performed all 12 forms in a continuous dance (Hinokami Kagura) throughout the night as an offering.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'In which historical era was Muzan Kibutsuji originally turned into a demon?',
  'multiple_choice',
  'impossible',
  '[{"text":"Sengoku period","isCorrect":false},{"text":"Edo period","isCorrect":false},{"text":"Heian period","isCorrect":true},{"text":"Kamakura period","isCorrect":false}]'::jsonb,
  'Muzan was turned into a demon during the Heian period (794-1185 AD) of Japan, making him over 1,000 years old. He was a sickly human who was given an experimental medicine by a doctor that transformed him into the first demon.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the doctor who inadvertently turned Muzan Kibutsuji into a demon?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dr. Tamayo","isCorrect":false},{"text":"The doctor''s name is unknown — he was killed by Muzan before completing treatment","isCorrect":true},{"text":"Dr. Kagaya","isCorrect":false},{"text":"Dr. Yushiro","isCorrect":false}]'::jsonb,
  'The doctor who treated Muzan is never named in the series. He used a prototype medicine containing the Blue Spider Lily to treat Muzan''s terminal illness. When Muzan didn''t see immediate results, he killed the doctor in a rage, only to realize afterward that the treatment was working — but had turned him into a demon.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Kokushibo''s human name before he became a demon?',
  'multiple_choice',
  'impossible',
  '[{"text":"Yoriichi Tsugikuni","isCorrect":false},{"text":"Michikatsu Tsugikuni","isCorrect":true},{"text":"Akaza Hakuji","isCorrect":false},{"text":"Kaigaku","isCorrect":false}]'::jsonb,
  'Kokushibo''s human name was Michikatsu Tsugikuni. He was the twin brother of Yoriichi Tsugikuni, the creator of Sun Breathing. Consumed by jealousy of his brother''s talent, Michikatsu accepted Muzan''s blood and became Upper Moon One.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is unique about Zenitsu''s mastery of Thunder Breathing?',
  'multiple_choice',
  'impossible',
  '[{"text":"He created his own original seventh form","isCorrect":false},{"text":"He can only perform the First Form: Thunderclap and Flash, but has perfected it to an extreme degree","isCorrect":true},{"text":"He mastered all six forms faster than any other student","isCorrect":false},{"text":"He can combine Thunder Breathing with Water Breathing","isCorrect":false}]'::jsonb,
  'Zenitsu could only learn the First Form of Thunder Breathing: Thunderclap and Flash (Ichi no Kata: Hekireki Issen). However, he refined this single form to an extraordinary level, developing multiple speed variations. He later creates his own original form, the Seventh Form: Honoikazuchi no Kami.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the Japanese name for Water Breathing?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kaze no Kokyū","isCorrect":false},{"text":"Hi no Kokyū","isCorrect":false},{"text":"Mizu no Kokyū","isCorrect":true},{"text":"Iwa no Kokyū","isCorrect":false}]'::jsonb,
  'Water Breathing is called Mizu no Kokyū (水の呼吸) in Japanese. Kaze is Wind, Hi is Flame, and Iwa is Stone. Water Breathing has 11 forms and is one of the five main Breathing Styles derived from Sun Breathing.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What type of weapon does the Stone Hashira Gyomei Himejima use, which is unique among the Hashira?',
  'multiple_choice',
  'impossible',
  '[{"text":"A massive stone hammer","isCorrect":false},{"text":"A spiked iron ball and axe connected by a chain","isCorrect":true},{"text":"Twin stone gauntlets","isCorrect":false},{"text":"A stone-bladed naginata","isCorrect":false}]'::jsonb,
  'Gyomei Himejima uses a hand-axe and a spiked flail ball connected by a long chain, both made of the same Nichirin ore. This is unique among the Hashira, who typically use Nichirin swords. He is considered the strongest active Hashira.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Which specific animation studio and team produced the Demon Slayer anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"MAPPA","isCorrect":false},{"text":"Ufotable","isCorrect":true},{"text":"Bones","isCorrect":false},{"text":"A-1 Pictures","isCorrect":false}]'::jsonb,
  'Ufotable produced Demon Slayer: Kimetsu no Yaiba. The studio is renowned for its digital compositing and visual effects work. Ufotable is also famous for the Fate series animations. Their work on Episode 19''s Hinokami Kagura scene went viral worldwide.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Upper Moon 4 Hantengu''s unique ability when his head is cut off?',
  'multiple_choice',
  'impossible',
  '[{"text":"He regenerates instantly from any severed part","isCorrect":false},{"text":"He splits into multiple smaller demons, each embodying a different emotion","isCorrect":true},{"text":"His body turns to stone and reforms","isCorrect":false},{"text":"He creates an illusion of himself while hiding his real body","isCorrect":false}]'::jsonb,
  'When Hantengu is beheaded, he splits into multiple demons, each representing a different emotion: Sekido (anger), Karaku (pleasure), Aizetsu (sorrow), and Urogi (joy). These can further combine into Zōhakuten (hatred). His real body is a tiny demon that hides while the clones fight.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How old was Tanjiro when his family was massacred by Muzan?',
  'multiple_choice',
  'impossible',
  '[{"text":"12 years old","isCorrect":false},{"text":"15 years old","isCorrect":false},{"text":"13 years old","isCorrect":true},{"text":"14 years old","isCorrect":false}]'::jsonb,
  'Tanjiro was 13 years old when Muzan Kibutsuji killed his family and turned Nezuko into a demon. He then spent two years training under Sakonji Urokodaki before attempting Final Selection at age 15.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the relation between Muichiro Tokito (Mist Hashira) and Kokushibo (Upper Moon One)?',
  'multiple_choice',
  'impossible',
  '[{"text":"Muichiro is Kokushibo''s son","isCorrect":false},{"text":"There is no relation","isCorrect":false},{"text":"Muichiro is Kokushibo''s descendant","isCorrect":true},{"text":"Muichiro is a reincarnation of Kokushibo","isCorrect":false}]'::jsonb,
  'Muichiro Tokito is a descendant of Kokushibo (Michikatsu Tsugikuni), who was Upper Moon One. This makes Muichiro also a descendant of the Tsugikuni bloodline. Despite being a descendant of a demon, Muichiro became one of the most talented Hashira, achieving the Demon Slayer Mark at just 14.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What color does Tanjiro''s Nichirin sword turn?',
  'multiple_choice',
  'impossible',
  '[{"text":"Blue","isCorrect":false},{"text":"Black","isCorrect":true},{"text":"Red","isCorrect":false},{"text":"White","isCorrect":false}]'::jsonb,
  'Tanjiro''s Nichirin sword turns black, which is considered an extremely rare and historically ominous color. Black blades are said to be wielded by swordsmen who die young and never become Hashira. The color is connected to Sun Breathing, the original Breathing Style.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of the mountain where the Demon Slayer Corps'' Final Selection takes place?',
  'multiple_choice',
  'impossible',
  '[{"text":"Mount Natagumo","isCorrect":false},{"text":"Mount Kumotori","isCorrect":false},{"text":"Mount Fujikasane","isCorrect":true},{"text":"Mount Sagiri","isCorrect":false}]'::jsonb,
  'Final Selection takes place on Mount Fujikasane (Fujikasane-yama), a mountain covered in wisteria flowers that bloom year-round. Demon Slayer candidates must survive seven days on the mountain among trapped demons to pass.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'How many Hashira are alive and active at the beginning of the main story?',
  'multiple_choice',
  'impossible',
  '[{"text":"7","isCorrect":false},{"text":"10","isCorrect":false},{"text":"9","isCorrect":true},{"text":"8","isCorrect":false}]'::jsonb,
  'There are 9 active Hashira at the start of the series: Giyu Tomioka (Water), Shinobu Kocho (Insect), Kyojuro Rengoku (Flame), Tengen Uzui (Sound), Muichiro Tokito (Mist), Mitsuri Kanroji (Love), Obanai Iguro (Serpent), Sanemi Shinazugawa (Wind), and Gyomei Himejima (Stone).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the name of Inosuke Hashibira''s mother?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kotoha Hashibira","isCorrect":true},{"text":"Kie Kamado","isCorrect":false},{"text":"Ruka Rengoku","isCorrect":false},{"text":"Kanae Kocho","isCorrect":false}]'::jsonb,
  'Inosuke''s mother was Kotoha Hashibira. She fled from her abusive husband to the Paradise Faith cult led by Doma (Upper Moon Two). When she discovered Doma was eating his followers, she tried to escape and threw baby Inosuke off a cliff into a river to save him before Doma killed her.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Daki''s (Upper Moon 6) specific Blood Demon Art?',
  'multiple_choice',
  'impossible',
  '[{"text":"She creates poisonous flower petals","isCorrect":false},{"text":"She manipulates Obi sashes that can cut and store humans","isCorrect":true},{"text":"She generates illusions of beautiful women","isCorrect":false},{"text":"She controls fire from her hairpins","isCorrect":false}]'::jsonb,
  'Daki''s Blood Demon Art allows her to create and manipulate sentient Obi sashes (fabric strips) from her body. These sashes can extend great distances, slice through flesh, and store captured humans alive inside them for later consumption.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is the title of the first opening theme song for Demon Slayer Season 1?',
  'multiple_choice',
  'impossible',
  '[{"text":"Homura","isCorrect":false},{"text":"Zankyō Sanka","isCorrect":false},{"text":"Gurenge","isCorrect":true},{"text":"Akeboshi","isCorrect":false}]'::jsonb,
  '"Gurenge" (Red Lotus) by LiSA is the first opening theme. It became one of the best-selling anime songs in history. "Homura" is the Mugen Train film theme, "Zankyō Sanka" is the Entertainment District Arc opening, and "Akeboshi" is a later season opening.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Who directed the Demon Slayer: Kimetsu no Yaiba anime?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tetsurō Araki","isCorrect":false},{"text":"Haruo Sotozaki","isCorrect":true},{"text":"Takahiro Miura","isCorrect":false},{"text":"Naokatsu Tsuda","isCorrect":false}]'::jsonb,
  'Haruo Sotozaki directed the Demon Slayer anime at Ufotable. He also directed the Mugen Train movie, which became the highest-grossing anime film in Japanese box office history, surpassing Spirited Away.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Kanao Tsuyuri''s specific reason for flipping a coin to make decisions?',
  'multiple_choice',
  'impossible',
  '[{"text":"She has a superstitious belief in fate","isCorrect":false},{"text":"She was so emotionally shut down from abuse that she couldn''t make decisions on her own","isCorrect":true},{"text":"It was a training exercise from her Hashira master","isCorrect":false},{"text":"The coin contains a special demon-detecting property","isCorrect":false}]'::jsonb,
  'Kanao suffered severe abuse as a child that left her emotionally numb and unable to make choices for herself. Kanae Kocho gave her a coin and told her to flip it whenever she needed to decide something. Tanjiro later told her to follow her heart, helping her begin making her own decisions.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What is Upper Moon 3 Akaza''s original human name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hakuji","isCorrect":true},{"text":"Kaigaku","isCorrect":false},{"text":"Michikatsu","isCorrect":false},{"text":"Gyutaro","isCorrect":false}]'::jsonb,
  'Akaza''s human name was Hakuji. He was a martial artist who cared for his sick father and later his master''s daughter Koyuki. After both were poisoned by a rival dojo, he slaughtered 67 people bare-handed before Muzan found and turned him into a demon.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Why is the Blue Spider Lily so important to Muzan Kibutsuji?',
  'multiple_choice',
  'impossible',
  '[{"text":"It is the only flower that can permanently kill him","isCorrect":false},{"text":"It was the key ingredient in the medicine that turned him into a demon, and he believes it can help him conquer sunlight","isCorrect":true},{"text":"It grows only where demon blood has been spilled","isCorrect":false},{"text":"It is needed to create new Upper Rank demons","isCorrect":false}]'::jsonb,
  'The Blue Spider Lily was an ingredient in the medicine the doctor used to turn Muzan into a demon. Muzan has searched for it for over 1,000 years, believing it is the key to conquering his weakness to sunlight and achieving true immortality.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'Which Hashira was the first to achieve the Demon Slayer Mark in the current era?',
  'multiple_choice',
  'impossible',
  '[{"text":"Gyomei Himejima","isCorrect":false},{"text":"Giyu Tomioka","isCorrect":false},{"text":"Tanjiro Kamado","isCorrect":true},{"text":"Muichiro Tokito","isCorrect":false}]'::jsonb,
  'Although Tanjiro is not a Hashira, he was the first to manifest the Demon Slayer Mark in the current era during his battle against Upper Moon demons. His mark then triggered the awakening of marks in the Hashira, starting with Muichiro Tokito during the Swordsmith Village Arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What specific Water Breathing technique does Tanjiro use in combination with Hinokami Kagura to defeat Lower Moon 5 Rui?',
  'multiple_choice',
  'impossible',
  '[{"text":"Water Breathing Tenth Form: Constant Flux combined with Hinokami Kagura: Dance","isCorrect":true},{"text":"Water Breathing First Form: Water Surface Slash combined with Hinokami Kagura: Burning Bones","isCorrect":false},{"text":"Water Breathing Fourth Form: Striking Tide combined with Hinokami Kagura: Clear Blue Sky","isCorrect":false},{"text":"Water Breathing Eighth Form: Waterfall Basin combined with Hinokami Kagura: Sunflower Thrust","isCorrect":false}]'::jsonb,
  'In the iconic Episode 19 fight against Rui, Tanjiro uses Water Breathing Tenth Form: Constant Flux but transitions mid-attack into Hinokami Kagura: Dance, combining both breathing styles. This moment, animated spectacularly by Ufotable, became one of the most celebrated scenes in anime history.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'What Demon Slayer Corps rank does Tanjiro hold at the end of the manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"Hashira","isCorrect":false},{"text":"Tsuchinoto","isCorrect":false},{"text":"Kinoe","isCorrect":true},{"text":"Hinoto","isCorrect":false}]'::jsonb,
  'Tanjiro reaches the rank of Kinoe, the highest rank below Hashira, by the end of the manga. Despite his incredible feats, he never officially becomes a Hashira. The ranking system goes: Mizunoto, Mizunoe, Kanoto, Kanoe, Tsuchinoto, Tsuchinoe, Hinoto, Hinoe, Kinoto, Kinoe, then Hashira.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'In which manga magazine was Demon Slayer: Kimetsu no Yaiba serialized?',
  'multiple_choice',
  'impossible',
  '[{"text":"Weekly Shōnen Magazine","isCorrect":false},{"text":"Weekly Shōnen Jump","isCorrect":true},{"text":"Monthly Shōnen Gangan","isCorrect":false},{"text":"Bessatsu Shōnen Magazine","isCorrect":false}]'::jsonb,
  'Demon Slayer was serialized in Weekly Shōnen Jump from February 2016 to May 2020, running for 205 chapters across 23 volumes. It was created by Koyoharu Gotouge.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'demon-slayer'),
  'In which episode of the anime does Kyojuro Rengoku die fighting Akaza?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 18 of Season 1","isCorrect":false},{"text":"The final act of the Mugen Train movie / Episode 7 of Mugen Train Arc","isCorrect":true},{"text":"Episode 1 of the Entertainment District Arc","isCorrect":false},{"text":"Episode 10 of the Swordsmith Village Arc","isCorrect":false}]'::jsonb,
  'Rengoku dies at the end of the Mugen Train movie (also adapted as Episode 7 of the Mugen Train TV arc). After defeating Lower Moon One Enmu, he fights Upper Moon Three Akaza until dawn, ultimately dying from his injuries while Akaza flees from the sunlight.'
);

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
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'In the original Japanese manga, what does Vegeta''s scouter read as Goku''s power level during their first fight on Earth?',
  'multiple_choice',
  'impossible',
  '[{"text":"Over 8,000","isCorrect":true},{"text":"Over 9,000","isCorrect":false},{"text":"Exactly 9,001","isCorrect":false},{"text":"Over 10,000","isCorrect":false}]'::jsonb,
  'In the original Japanese manga and anime, Vegeta exclaims "It''s over 8,000!" (Hassen Ijou Da!). The famous "over 9,000" line comes from the English dub by Ocean Studios/Funimation, which changed the number. This is one of anime''s most well-known localization changes.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Who is the Japanese voice actress who has voiced Goku since the original Dragon Ball?',
  'multiple_choice',
  'impossible',
  '[{"text":"Aya Hirano","isCorrect":false},{"text":"Megumi Hayashibara","isCorrect":false},{"text":"Masako Nozawa","isCorrect":true},{"text":"Romi Park","isCorrect":false}]'::jsonb,
  'Masako Nozawa has voiced Goku since the original Dragon Ball in 1986. She also voices Gohan, Goten, Bardock, Turles, and Goku Black — essentially every character related to Goku. She continued the role well into her 80s.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'In which specific episode number does Goku first transform into a Super Saiyan on Namek?',
  'multiple_choice',
  'impossible',
  '[{"text":"Episode 80","isCorrect":false},{"text":"Episode 95","isCorrect":true},{"text":"Episode 100","isCorrect":false},{"text":"Episode 88","isCorrect":false}]'::jsonb,
  'Goku first transforms into a Super Saiyan in Episode 95 of Dragon Ball Z, titled "Transformed at Last." This happens after Frieza kills Krillin, and Goku''s rage triggers the legendary transformation on planet Namek.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Frieza''s stated maximum power level in his final form on Namek?',
  'multiple_choice',
  'impossible',
  '[{"text":"12,000,000","isCorrect":false},{"text":"120,000,000","isCorrect":true},{"text":"53,000,000","isCorrect":false},{"text":"1,000,000","isCorrect":false}]'::jsonb,
  'Frieza states his maximum power level at 100% in his final form is 120,000,000. At 50% power, he was at 60,000,000. Goku''s Super Saiyan form was estimated at 150,000,000, which is why he was able to overpower Frieza at full power.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the full Japanese name of the technique Goku learns from King Kai?',
  'multiple_choice',
  'impossible',
  '[{"text":"Kamehameha","isCorrect":false},{"text":"Genki Dama","isCorrect":false},{"text":"Kaiō-ken","isCorrect":true},{"text":"Shunkan Idō","isCorrect":false}]'::jsonb,
  'The Kaiō-ken (界王拳, literally "Fist of the World King") is the power-multiplying technique Goku learns from King Kai. It multiplies his power but strains his body. He also learned the Genki Dama (Spirit Bomb) from King Kai, but Kaiō-ken is the signature combat technique.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'How many Dragon Balls exist on Planet Namek, and who created them?',
  'multiple_choice',
  'impossible',
  '[{"text":"7, created by Grand Elder Guru","isCorrect":true},{"text":"7, created by Kami","isCorrect":false},{"text":"5, created by the Namekian Dragon Clan","isCorrect":false},{"text":"9, created by Grand Elder Guru","isCorrect":false}]'::jsonb,
  'There are 7 Namekian Dragon Balls, created by Grand Elder Guru (Saichōrō). Unlike Earth''s Dragon Balls, the Namekian ones are much larger and can grant three wishes instead of one. They summon the dragon Porunga instead of Shenron.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Vegeta''s father?',
  'multiple_choice',
  'impossible',
  '[{"text":"King Cold","isCorrect":false},{"text":"King Vegeta","isCorrect":true},{"text":"Paragus","isCorrect":false},{"text":"Bardock","isCorrect":false}]'::jsonb,
  'Vegeta''s father is King Vegeta, the king of all Saiyans and ruler of Planet Vegeta. Both the planet and the prince are named after him. He was killed by Frieza when the tyrant destroyed Planet Vegeta.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the exact time limit of the Fusion Dance technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"15 minutes","isCorrect":false},{"text":"60 minutes","isCorrect":false},{"text":"30 minutes","isCorrect":true},{"text":"45 minutes","isCorrect":false}]'::jsonb,
  'The Fusion Dance lasts exactly 30 minutes before the fused warriors separate. However, excessive power usage (like Super Saiyan 3) can shorten this time. The fusion also requires the two fighters to be roughly equal in size and power level.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Gohan''s superhero alter ego that he uses during the Buu Saga?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Golden Warrior","isCorrect":false},{"text":"The Great Saiyaman","isCorrect":true},{"text":"The Green Champion","isCorrect":false},{"text":"Justice Man","isCorrect":false}]'::jsonb,
  'Gohan adopts the superhero identity "The Great Saiyaman" (Greto Saiyaman) during the early Buu Saga while attending Orange Star High School. He wears a ridiculous costume with a helmet and cape, performing dramatic poses much to Videl''s annoyance.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Android 17''s real human name?',
  'multiple_choice',
  'impossible',
  '[{"text":"Lapis","isCorrect":true},{"text":"Lazuli","isCorrect":false},{"text":"Lars","isCorrect":false},{"text":"Leon","isCorrect":false}]'::jsonb,
  'Android 17''s original human name is Lapis, while Android 18''s is Lazuli. These names were revealed in the Dragon Ball manga companion guide. Dr. Gero kidnapped them as teenagers and modified them into cyborgs.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the full name of the manga creator of Dragon Ball?',
  'multiple_choice',
  'impossible',
  '[{"text":"Eiichiro Oda","isCorrect":false},{"text":"Masashi Kishimoto","isCorrect":false},{"text":"Akira Toriyama","isCorrect":true},{"text":"Yoshihiro Togashi","isCorrect":false}]'::jsonb,
  'Akira Toriyama created the Dragon Ball manga, which was serialized in Weekly Shōnen Jump from 1984 to 1995. He also created Dr. Slump and designed characters for the Dragon Quest video game series and Chrono Trigger. He passed away in March 2024.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the Japanese name for the Spirit Bomb technique?',
  'multiple_choice',
  'impossible',
  '[{"text":"Makankōsappō","isCorrect":false},{"text":"Kienzan","isCorrect":false},{"text":"Genki Dama","isCorrect":true},{"text":"Kakusan Yuudou Kikoha","isCorrect":false}]'::jsonb,
  'The Spirit Bomb is called Genki Dama (元気玉, literally "Energy Sphere") in Japanese. It gathers energy from living things in the surrounding area. Makankōsappō is Piccolo''s Special Beam Cannon, and Kienzan is Krillin''s Destructo Disc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which Dragon Ball Z saga is entirely anime-filler and does not appear in the original manga?',
  'multiple_choice',
  'impossible',
  '[{"text":"The Saiyan Saga","isCorrect":false},{"text":"The Garlic Jr. Saga","isCorrect":true},{"text":"The Cell Games Saga","isCorrect":false},{"text":"The World Tournament Saga","isCorrect":false}]'::jsonb,
  'The Garlic Jr. Saga (episodes 108-117) is entirely anime-filler, occurring between the Frieza and Android sagas. It features Garlic Jr. from the first DBZ movie returning with the Makyo Star power-up. None of this appears in Toriyama''s original manga.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'How many times has Krillin died throughout the entire Dragon Ball franchise (DB, DBZ, GT)?',
  'multiple_choice',
  'impossible',
  '[{"text":"2 times","isCorrect":false},{"text":"4 times","isCorrect":false},{"text":"3 times","isCorrect":true},{"text":"5 times","isCorrect":false}]'::jsonb,
  'Krillin dies 3 times in the main canon: (1) killed by Tambourine in Dragon Ball, (2) killed by Frieza on Namek in DBZ, and (3) turned into chocolate and eaten by Super Buu in the Buu Saga. Each time he was revived by the Dragon Balls.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the time limit for Potara earring fusion when used by non-Supreme Kais?',
  'multiple_choice',
  'impossible',
  '[{"text":"It is permanent regardless of who uses it","isCorrect":false},{"text":"30 minutes","isCorrect":false},{"text":"1 hour","isCorrect":true},{"text":"24 hours","isCorrect":false}]'::jsonb,
  'As revealed in Dragon Ball Super, Potara fusion only lasts permanently for Supreme Kais. For mortals, the fusion lasts approximately one hour. This retcon explains why Vegito defused inside Super Buu, which was previously attributed to Buu''s magical body.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What special ability did Bardock possess in the TV special "Bardock — The Father of Goku"?',
  'multiple_choice',
  'impossible',
  '[{"text":"He could transform into a Super Saiyan","isCorrect":false},{"text":"He could see visions of the future","isCorrect":true},{"text":"He had an innate healing ability","isCorrect":false},{"text":"He could sense energy without a scouter","isCorrect":false}]'::jsonb,
  'In the 1990 TV special, Bardock gained the ability to see the future after being hit by the psychic alien Kanassan. He foresaw the destruction of Planet Vegeta and his son Goku''s battle with Frieza, but no one believed his warnings.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'On which planet did Goku train under 100x Earth''s gravity while traveling to Namek?',
  'multiple_choice',
  'impossible',
  '[{"text":"Planet Vegeta","isCorrect":false},{"text":"He trained on a spaceship, not a planet","isCorrect":true},{"text":"King Kai''s planet","isCorrect":false},{"text":"Planet Yardrat","isCorrect":false}]'::jsonb,
  'Goku trained inside Dr. Brief''s modified Saiyan spaceship during his journey to Namek, not on any planet. The ship had an adjustable gravity chamber that he cranked up to 100x Earth''s normal gravity. King Kai''s planet only has 10x gravity.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the exact power multiplier of the base Super Saiyan transformation?',
  'multiple_choice',
  'impossible',
  '[{"text":"10x base power","isCorrect":false},{"text":"100x base power","isCorrect":false},{"text":"50x base power","isCorrect":true},{"text":"25x base power","isCorrect":false}]'::jsonb,
  'The Super Saiyan transformation multiplies the user''s base power level by 50. This was established in the Daizenshuu guidebooks. Super Saiyan 2 is a 2x multiplier on top of that (100x base), and Super Saiyan 3 is 4x SSJ2 (400x base).'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Majin Buu''s original, most dangerous form?',
  'multiple_choice',
  'impossible',
  '[{"text":"Super Buu","isCorrect":false},{"text":"Kid Buu","isCorrect":true},{"text":"Ultra Buu","isCorrect":false},{"text":"Majin Buu (Pure Evil)","isCorrect":false}]'::jsonb,
  'Kid Buu (Pure Buu) is Majin Buu''s original form — pure, chaotic evil without any of the absorbed personalities that made other forms more rational. He is considered the most dangerous because he is completely unpredictable and destructive, destroying Earth without hesitation.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which specific techniques did Cell copy from each Z Fighter due to his bio-android composition?',
  'multiple_choice',
  'impossible',
  '[{"text":"Only the Kamehameha from Goku","isCorrect":false},{"text":"Kamehameha from Goku, Special Beam Cannon from Piccolo, Destructo Disc from Krillin, and regeneration from Piccolo","isCorrect":true},{"text":"Spirit Bomb from Goku and Final Flash from Vegeta","isCorrect":false},{"text":"Tri-Beam from Tien and Wolf Fang Fist from Yamcha only","isCorrect":false}]'::jsonb,
  'Cell contains the cells of Goku, Vegeta, Piccolo, Frieza, and King Cold, giving him access to the Kamehameha, Instant Transmission, regeneration (from Piccolo''s Namekian cells), Special Beam Cannon, Destructo Disc, and more. He also demonstrates Frieza''s Death Beam.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'According to the legend in Dragon Ball Super, how many righteous Saiyans were needed to create the original Super Saiyan God?',
  'multiple_choice',
  'impossible',
  '[{"text":"7 righteous Saiyans","isCorrect":false},{"text":"3 righteous Saiyans","isCorrect":false},{"text":"6 righteous Saiyans, including the one receiving the power","isCorrect":false},{"text":"5 righteous Saiyans channeling their energy into a 6th","isCorrect":true}]'::jsonb,
  'The Super Saiyan God ritual requires 5 righteous Saiyans to channel their energy into a 6th Saiyan. Goku achieved this form through Vegeta, Gohan, Goten, Trunks, and the unborn Pan (through Videl) channeling their energy into him during the Battle of Gods arc.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the name of Vegeta''s younger brother?',
  'multiple_choice',
  'impossible',
  '[{"text":"Tarble","isCorrect":true},{"text":"Cabba","isCorrect":false},{"text":"Nappa","isCorrect":false},{"text":"Turles","isCorrect":false}]'::jsonb,
  'Tarble is Vegeta''s younger brother, introduced in the 2008 special "Yo! Son Goku and His Friends Return!!" He was sent to a distant planet as a child because he lacked fighting ability. His name combined with "Vege-" from Vegeta spells "vegetable."'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is Dr. Gero''s own android designation number?',
  'multiple_choice',
  'impossible',
  '[{"text":"Android 19","isCorrect":false},{"text":"Android 21","isCorrect":false},{"text":"Android 20","isCorrect":true},{"text":"Android 16","isCorrect":false}]'::jsonb,
  'Dr. Gero converted himself into Android 20 to achieve immortality. Unlike Androids 17 and 18 who were humans modified into cyborgs, Gero transferred his brain into a fully mechanical body. He is eventually killed by Android 17 in his own laboratory.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What specific type of wish can Shenron NOT grant?',
  'multiple_choice',
  'impossible',
  '[{"text":"Wishes that involve time travel","isCorrect":false},{"text":"Wishes that exceed the power of Shenron''s creator (Kami/Dende)","isCorrect":true},{"text":"Wishes involving other universes","isCorrect":false},{"text":"Wishes that affect Saiyans","isCorrect":false}]'::jsonb,
  'Shenron cannot grant wishes that exceed the power of his creator. Originally created by Kami, and later maintained by Dende, Shenron''s power is limited. This is why he couldn''t kill certain villains or undo certain events directly — they exceeded Kami''s/Dende''s power level.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'How old was Gohan during the Cell Games?',
  'multiple_choice',
  'impossible',
  '[{"text":"11 years old","isCorrect":true},{"text":"9 years old","isCorrect":false},{"text":"13 years old","isCorrect":false},{"text":"10 years old","isCorrect":false}]'::jsonb,
  'Gohan was 11 years old (or 9 in some calculations depending on the Hyperbolic Time Chamber time) during the Cell Games. He spent a year in the Hyperbolic Time Chamber with Goku, so his physical/mental age was about 11-12, though chronologically he was about 10-11.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the gravity multiplier on King Kai''s planet compared to Earth?',
  'multiple_choice',
  'impossible',
  '[{"text":"50x Earth gravity","isCorrect":false},{"text":"20x Earth gravity","isCorrect":false},{"text":"100x Earth gravity","isCorrect":false},{"text":"10x Earth gravity","isCorrect":true}]'::jsonb,
  'King Kai''s planet has 10 times Earth''s normal gravity. This relatively modest increase (compared to the 100x Goku later trains under) was enough to make initial training very difficult for Goku. The small, round planet is at the end of Snake Way in Other World.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'Which animation studio produced Dragon Ball Z?',
  'multiple_choice',
  'impossible',
  '[{"text":"Madhouse","isCorrect":false},{"text":"Sunrise","isCorrect":false},{"text":"Toei Animation","isCorrect":true},{"text":"Studio Pierrot","isCorrect":false}]'::jsonb,
  'Toei Animation has produced all Dragon Ball anime series since the original Dragon Ball in 1986. DBZ ran from 1989 to 1996 for 291 episodes. Toei Animation is one of Japan''s oldest and largest animation studios.'
);

INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)
VALUES (
  (SELECT id FROM anime_series WHERE slug = 'dragon-ball-z'),
  'What is the title of the first opening theme song for Dragon Ball Z?',
  'multiple_choice',
  'impossible',
  '[{"text":"Dragon Ball Densetsu","isCorrect":false},{"text":"Makafushigi Adventure","isCorrect":false},{"text":"Cha-La Head-Cha-La","isCorrect":true},{"text":"We Gotta Power","isCorrect":false}]'::jsonb,
  '"Cha-La Head-Cha-La" by Hironobu Kageyama is the iconic first opening theme of Dragon Ball Z, used for the Saiyan and Namek sagas. "Makafushigi Adventure" is the original Dragon Ball opening, and "We Gotta Power" is the second DBZ opening.'
);
