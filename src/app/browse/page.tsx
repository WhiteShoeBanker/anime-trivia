import { getAnimeList } from "@/lib/queries";
import type { AnimeSeries } from "@/types";
import BrowseContent from "./BrowseContent";

export const metadata = {
  title: "Browse Anime - OtakuQuiz",
  description: "Choose an anime series and test your knowledge!",
};

export default async function BrowsePage() {
  let animeList: AnimeSeries[] = [];

  try {
    animeList = await getAnimeList();
  } catch {
    // DB not available - show empty state
  }

  return <BrowseContent animeList={animeList} />;
}
