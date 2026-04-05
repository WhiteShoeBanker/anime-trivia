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
    // Fetch all anime — client-side filtering handles age restrictions
    animeList = await getAnimeList("full");
    // TODO: remove after confirming browse page works
    console.log("[BrowsePage] fetched anime count:", animeList.length);
  } catch (err) {
    // TODO: remove after confirming browse page works
    console.error("[BrowsePage] getAnimeList failed:", err);
  }

  return <BrowseContent animeList={animeList} />;
}
