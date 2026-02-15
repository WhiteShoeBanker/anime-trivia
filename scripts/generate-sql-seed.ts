import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

interface AnimeMetadata {
  title: string;
  description: string;
  genre: string[];
}

const ANIME_METADATA: Record<string, AnimeMetadata> = {
  naruto: {
    title: "Naruto",
    description:
      "Follow Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage, the leader of his village.",
    genre: ["Shonen", "Action", "Adventure"],
  },
  "demon-slayer": {
    title: "Demon Slayer: Kimetsu no Yaiba",
    description:
      "Tanjiro Kamado joins the Demon Slayer Corps to avenge his family and cure his sister Nezuko, who has been turned into a demon.",
    genre: ["Shonen", "Action", "Supernatural"],
  },
  "my-hero-academia": {
    title: "My Hero Academia",
    description:
      "In a world where most people have superpowers called Quirks, Izuku Midoriya dreams of becoming the greatest hero despite being born without one.",
    genre: ["Shonen", "Action", "Superhero"],
  },
  "dragon-ball-z": {
    title: "Dragon Ball Z",
    description:
      "Goku and his allies defend Earth against powerful villains, from Saiyans to gods, in the legendary martial arts anime.",
    genre: ["Shonen", "Action", "Martial Arts"],
  },
  "one-piece": {
    title: "One Piece",
    description:
      "Monkey D. Luffy and the Straw Hat Pirates sail the Grand Line in search of the legendary treasure One Piece to become King of the Pirates.",
    genre: ["Shonen", "Action", "Adventure"],
  },
  "attack-on-titan": {
    title: "Attack on Titan",
    description:
      "Humanity fights for survival against giant Titans behind massive walls, uncovering dark secrets about their world.",
    genre: ["Shonen", "Action", "Dark Fantasy"],
  },
  "jujutsu-kaisen": {
    title: "Jujutsu Kaisen",
    description:
      "Yuji Itadori joins a secret world of Jujutsu Sorcerers after swallowing a cursed finger of the King of Curses, Ryomen Sukuna.",
    genre: ["Shonen", "Action", "Supernatural"],
  },
  "death-note": {
    title: "Death Note",
    description:
      "A high school genius finds a supernatural notebook that kills anyone whose name is written in it, sparking a cat-and-mouse game with a legendary detective.",
    genre: ["Shonen", "Thriller", "Psychological"],
  },
};

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  question_text: string;
  question_type: string;
  difficulty: string;
  options: QuestionOption[];
  explanation: string;
}

const esc = (s: string): string => s.replace(/'/g, "''");

const questionsDir = join(__dirname, "..", "src", "data", "questions");
const files = readdirSync(questionsDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

let sql = "-- OtakuQuiz Seed Data\n";
sql += "-- 8 anime series with 240 total questions\n";
sql += "-- Generated from src/data/questions/ JSON files\n";
sql += "-- Paste into Supabase SQL Editor to seed the database\n\n";

for (const file of files) {
  const slug = file.replace(".json", "");
  const meta = ANIME_METADATA[slug];
  if (!meta) continue;

  const genreArr =
    '{"' + meta.genre.join('","') + '"}';

  sql += "-- ============================================================\n";
  sql += `-- ${meta.title}\n`;
  sql += "-- ============================================================\n\n";

  sql += `INSERT INTO anime_series (slug, title, description, genre, total_questions, is_active)\n`;
  sql += `VALUES (\n`;
  sql += `  '${esc(slug)}',\n`;
  sql += `  '${esc(meta.title)}',\n`;
  sql += `  '${esc(meta.description)}',\n`;
  sql += `  '${genreArr}',\n`;

  const raw = readFileSync(join(questionsDir, file), "utf-8");
  const questions: QuestionData[] = JSON.parse(raw);

  sql += `  ${questions.length},\n`;
  sql += `  true\n`;
  sql += `) ON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  title = EXCLUDED.title,\n`;
  sql += `  description = EXCLUDED.description,\n`;
  sql += `  genre = EXCLUDED.genre,\n`;
  sql += `  total_questions = EXCLUDED.total_questions;\n\n`;

  for (const q of questions) {
    const optionsJson = JSON.stringify(q.options);
    sql += `INSERT INTO questions (anime_id, question_text, question_type, difficulty, options, explanation)\n`;
    sql += `VALUES (\n`;
    sql += `  (SELECT id FROM anime_series WHERE slug = '${esc(slug)}'),\n`;
    sql += `  '${esc(q.question_text)}',\n`;
    sql += `  '${esc(q.question_type)}',\n`;
    sql += `  '${esc(q.difficulty)}',\n`;
    sql += `  '${esc(optionsJson)}'::jsonb,\n`;
    sql += `  '${esc(q.explanation || "")}'\n`;
    sql += `);\n\n`;
  }
}

const outPath = join(__dirname, "..", "supabase", "seed.sql");
writeFileSync(outPath, sql);
console.log(
  `Generated supabase/seed.sql (${Math.round(sql.length / 1024)} KB)`
);
