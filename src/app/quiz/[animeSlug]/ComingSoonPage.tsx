import Link from "next/link";
import type { AnimeRegistryEntry } from "@/data/anime/registry";

interface ComingSoonPageProps {
  anime: AnimeRegistryEntry;
}

const ComingSoonPage = ({ anime }: ComingSoonPageProps) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-sm uppercase tracking-wide text-primary/80 mb-4">
        Coming Soon
      </p>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
        {anime.displayName}
      </h1>
      <p className="text-white/60 mb-8 leading-relaxed">{anime.description}</p>
      <p className="text-base text-white/70 mb-10">
        Questions are on the way. Check back soon to put your{" "}
        {anime.displayName} knowledge to the test.
      </p>
      <Link
        href="/browse"
        className="inline-block px-6 py-3 rounded-full bg-primary text-black font-semibold hover:opacity-90 transition-opacity"
      >
        Back to Browse
      </Link>
    </div>
  );
};

export default ComingSoonPage;
