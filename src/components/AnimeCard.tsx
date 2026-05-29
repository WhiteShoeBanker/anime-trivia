"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ContentRating } from "@/types";
import type { AnimeRegistryEntry } from "@/data/anime/registry";
import useReducedMotion from "@/lib/use-reduced-motion";
import { Pill, type PillTone } from "@/components/ui/Pill";

interface AnimeCardProps {
  anime: AnimeRegistryEntry;
  index?: number;
  restricted?: boolean;
}

// Content-rating → Pill tone + human label. The tone register is shared with
// the audience-fit register (same emerald/yellow/red traffic light, different
// semantic axis — see DESIGN.md Pill register prose).
const ratingTone: Record<ContentRating, PillTone> = {
  E: "content-rating-e",
  T: "content-rating-t",
  M: "content-rating-m",
};

const ratingLabel: Record<ContentRating, string> = {
  E: "E 6+",
  T: "T 13+",
  M: "M 16+",
};

const AnimeCard = ({ anime, index = 0, restricted }: AnimeCardProps) => {
  const tone = ratingTone[anime.contentRating];
  const label = ratingLabel[anime.contentRating];
  const reducedMotion = useReducedMotion();
  const imageSrc = anime.coverArt;
  const comingSoon = anime.comingSoon === true;

  const cardContent = (
    <div className="relative h-[280px] bg-surface rounded-2xl border border-white/10 overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={anime.displayName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      )}

      {/* Dark gradient overlay so the title stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content rating badge */}
      {tone && (
        <Pill tone={tone} size="sm" className="absolute top-3 right-3">
          {label}
        </Pill>
      )}

      {/* Coming-soon overlay — anticipation framing, not greyed-out */}
      {comingSoon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full backdrop-blur-sm bg-black/60 text-white text-sm font-semibold tracking-wide uppercase">
            Coming Soon
          </span>
        </div>
      )}

      <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white drop-shadow-lg">
        {anime.displayName}
      </h3>
    </div>
  );

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.1 }}
      whileHover={reducedMotion ? undefined : { scale: 1.03 }}
    >
      {restricted ? (
        <div className="block group">{cardContent}</div>
      ) : (
        <Link href={`/quiz/${anime.slug}`} className="block group">
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
};

export default AnimeCard;
