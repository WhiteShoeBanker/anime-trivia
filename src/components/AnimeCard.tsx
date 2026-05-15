"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { AnimeSeries, ContentRating } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";
import { Pill, type PillTone } from "@/components/ui/Pill";

interface AnimeCardProps {
  anime: AnimeSeries;
  index?: number;
  restricted?: boolean;
}

const animeImages: Record<string, string> = {
  "attack-on-titan": "/images/attack%20on%20titan.png",
  "death-note": "/images/death%20note.png",
  "demon-slayer": "/images/demon%20slayer.png",
  "dragon-ball-z": "/images/dragon%20ball.png",
  "jujutsu-kaisen": "/images/jiu%20jitsu.png",
  "my-hero-academia": "/images/my%20hero.png",
  naruto: "/images/naruto.png",
  "one-piece": "/images/one%20piece%20.png",
};

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
  const tone = ratingTone[anime.content_rating];
  const label = ratingLabel[anime.content_rating];
  const reducedMotion = useReducedMotion();
  const imageSrc = animeImages[anime.slug];

  const cardContent = (
    <div className="relative h-[280px] bg-surface rounded-2xl border border-white/10 overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={anime.title}
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

      <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white drop-shadow-lg">
        {anime.title}
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
