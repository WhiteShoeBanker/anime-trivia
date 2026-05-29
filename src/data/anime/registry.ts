import type { ContentRating } from "@/types";
import type { AppVariant } from "@/config/variants";
import { APP_VARIANT, variantConfig } from "@/config/variants";

export interface AnimeRegistryEntry {
  readonly slug: string;
  readonly displayName: string;
  readonly contentRating: ContentRating;
  readonly coverArt: string;
  readonly questionsFile: string;
  readonly impossibleMigration: string;
  readonly enabledInVariants: readonly AppVariant[];
  readonly description: string;
  readonly questionCount: {
    readonly easy: number;
    readonly medium: number;
    readonly hard: number;
    readonly impossible: number;
  };
  readonly comingSoon?: boolean;
}

export const ANIME_REGISTRY: readonly AnimeRegistryEntry[] = [
  {
    slug: "attack-on-titan",
    displayName: "Attack on Titan",
    contentRating: "M",
    coverArt: "/images/attack%20on%20titan.png",
    questionsFile: "src/data/questions/attack-on-titan.json",
    impossibleMigration: "supabase/migrations/008a_impossible_aot_dn.sql",
    enabledInVariants: ["full"],
    description:
      "Humanity fights for survival against giant Titans behind massive walls, uncovering dark secrets about their world.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "death-note",
    displayName: "Death Note",
    contentRating: "M",
    coverArt: "/images/death%20note.png",
    questionsFile: "src/data/questions/death-note.json",
    impossibleMigration: "supabase/migrations/008a_impossible_aot_dn.sql",
    enabledInVariants: ["full"],
    description:
      "A high school genius finds a supernatural notebook that kills anyone whose name is written in it, sparking a cat-and-mouse game with a legendary detective.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "demon-slayer",
    displayName: "Demon Slayer: Kimetsu no Yaiba",
    contentRating: "T",
    coverArt: "/images/demon%20slayer.png",
    questionsFile: "src/data/questions/demon-slayer.json",
    impossibleMigration: "supabase/migrations/008b_impossible_ds_dbz.sql",
    enabledInVariants: ["full"],
    description:
      "Tanjiro Kamado joins the Demon Slayer Corps to avenge his family and cure his sister Nezuko, who has been turned into a demon.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "dragon-ball-z",
    displayName: "Dragon Ball Z",
    contentRating: "E",
    coverArt: "/images/dragon%20ball.png",
    questionsFile: "src/data/questions/dragon-ball-z.json",
    impossibleMigration: "supabase/migrations/008b_impossible_ds_dbz.sql",
    enabledInVariants: ["full", "kids"],
    description:
      "Goku and his allies defend Earth against powerful villains, from Saiyans to gods, in the legendary martial arts anime.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "jujutsu-kaisen",
    displayName: "Jujutsu Kaisen",
    contentRating: "T",
    coverArt: "/images/jiu%20jitsu.png",
    questionsFile: "src/data/questions/jujutsu-kaisen.json",
    impossibleMigration: "supabase/migrations/008c_impossible_jjk_mha.sql",
    enabledInVariants: ["full"],
    description:
      "Yuji Itadori joins a secret world of Jujutsu Sorcerers after swallowing a cursed finger of the King of Curses, Ryomen Sukuna.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "my-hero-academia",
    displayName: "My Hero Academia",
    contentRating: "E",
    coverArt: "/images/my%20hero.png",
    questionsFile: "src/data/questions/my-hero-academia.json",
    impossibleMigration: "supabase/migrations/008c_impossible_jjk_mha.sql",
    enabledInVariants: ["full", "kids"],
    description:
      "In a world where most people have superpowers called Quirks, Izuku Midoriya dreams of becoming the greatest hero despite being born without one.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "naruto",
    displayName: "Naruto",
    contentRating: "E",
    coverArt: "/images/naruto.png",
    questionsFile: "src/data/questions/naruto.json",
    impossibleMigration: "supabase/migrations/008d_impossible_naruto_op.sql",
    enabledInVariants: ["full", "kids"],
    description:
      "Follow Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage, the leader of his village.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "one-piece",
    displayName: "One Piece",
    contentRating: "E",
    coverArt: "/images/one%20piece%20.png",
    questionsFile: "src/data/questions/one-piece.json",
    impossibleMigration: "supabase/migrations/008d_impossible_naruto_op.sql",
    enabledInVariants: ["full", "kids"],
    description:
      "Monkey D. Luffy and the Straw Hat Pirates sail the Grand Line in search of the legendary treasure One Piece to become King of the Pirates.",
    questionCount: { easy: 10, medium: 11, hard: 9, impossible: 30 },
  },
  {
    slug: "hunter-x-hunter",
    displayName: "Hunter x Hunter",
    contentRating: "T",
    coverArt: "/images/hunter-x-hunter.svg",
    questionsFile: "src/data/questions/hunter-x-hunter.json",
    impossibleMigration: "",
    enabledInVariants: ["full"],
    description:
      "Gon Freecss sets out to become a Hunter and find his estranged father, journeying through worlds of mystery, combat, and the enigmatic art of Nen.",
    questionCount: { easy: 0, medium: 0, hard: 0, impossible: 0 },
    comingSoon: true,
  },
  {
    slug: "my-neighbor-totoro",
    displayName: "My Neighbor Totoro",
    contentRating: "E",
    coverArt: "/images/my-neighbor-totoro.svg",
    questionsFile: "src/data/questions/my-neighbor-totoro.json",
    impossibleMigration: "",
    enabledInVariants: ["full", "kids"],
    description:
      "Two young sisters discover the gentle forest spirit Totoro and his magical world in the Japanese countryside — a Studio Ghibli classic.",
    questionCount: { easy: 0, medium: 0, hard: 0, impossible: 0 },
    comingSoon: true,
  },
];

export const getEnabledAnime = (): readonly AnimeRegistryEntry[] =>
  ANIME_REGISTRY.filter(
    (a) =>
      a.enabledInVariants.includes(APP_VARIANT) &&
      variantConfig.enabledContentRatings.includes(a.contentRating),
  );

export const getPlayableAnime = (): readonly AnimeRegistryEntry[] =>
  getEnabledAnime().filter((a) => !a.comingSoon);

export const findAnimeBySlug = (slug: string): AnimeRegistryEntry | undefined =>
  ANIME_REGISTRY.find((a) => a.slug === slug);
