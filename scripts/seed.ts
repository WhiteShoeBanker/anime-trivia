import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// ── Configuration ────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Anime metadata keyed by filename slug ────────────────────

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

// ── Types ────────────────────────────────────────────────────

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

// ── Seed logic ───────────────────────────────────────────────

const seedAnime = async (slug: string, questions: QuestionData[]) => {
  const metadata = ANIME_METADATA[slug];
  if (!metadata) {
    console.error(`  No metadata found for slug: ${slug}, skipping.`);
    return;
  }

  // Upsert anime_series record
  const { data: anime, error: animeError } = await supabase
    .from("anime_series")
    .upsert(
      {
        slug,
        title: metadata.title,
        description: metadata.description,
        genre: metadata.genre,
        total_questions: questions.length,
        is_active: true,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (animeError) {
    console.error(`  Error upserting ${metadata.title}:`, animeError.message);
    return;
  }

  const animeId = anime.id;

  // Delete existing questions for this anime (to allow re-seeding)
  await supabase.from("questions").delete().eq("anime_id", animeId);

  // Insert all questions
  const questionRows = questions.map((q) => ({
    anime_id: animeId,
    question_text: q.question_text,
    question_type: q.question_type,
    difficulty: q.difficulty,
    options: q.options,
    explanation: q.explanation,
  }));

  const { error: questionsError } = await supabase
    .from("questions")
    .insert(questionRows);

  if (questionsError) {
    console.error(
      `  Error inserting questions for ${metadata.title}:`,
      questionsError.message
    );
    return;
  }

  console.log(
    `  Seeding ${metadata.title}... ${questions.length} questions inserted`
  );
};

const main = async () => {
  console.log("Starting OtakuQuiz seed...\n");

  const questionsDir = join(__dirname, "..", "src", "data", "questions");
  const files = readdirSync(questionsDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("No JSON files found in src/data/questions/");
    process.exit(1);
  }

  let totalQuestions = 0;

  for (const file of files) {
    const slug = file.replace(".json", "");
    const filePath = join(questionsDir, file);
    const raw = readFileSync(filePath, "utf-8");
    const questions: QuestionData[] = JSON.parse(raw);

    await seedAnime(slug, questions);
    totalQuestions += questions.length;
  }

  console.log(
    `\nDone! Seeded ${files.length} anime series with ${totalQuestions} total questions.`
  );
};

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
