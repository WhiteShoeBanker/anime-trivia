import { getAnimeList } from "@/lib/queries";
import type { AnimeSeries } from "@/types";
import BrowseContent from "./BrowseContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Anime - OtakuQuiz",
  description: "Choose an anime series and test your knowledge!",
};

export default async function BrowsePage() {
  let animeList: AnimeSeries[] = [];

  try {
    // RLS scopes the list to what this session is permitted to see.
    animeList = await getAnimeList();
    // TODO: remove after confirming browse page works
    console.log("[BrowsePage] fetched anime count:", animeList.length);
  } catch (err) {
    // TODO: remove after confirming browse page works
    console.error("[BrowsePage] getAnimeList failed:", err);
  }

  return <BrowseContent animeList={animeList} />;
}
