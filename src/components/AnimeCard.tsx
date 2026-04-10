"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { AnimeSeries, ContentRating } from "@/types";
import useReducedMotion from "@/lib/use-reduced-motion";

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

const ratingConfig: Record<ContentRating, { bg: string; label: string }> = {
  E: { bg: "bg-emerald-500", label: "E 6+" },
  T: { bg: "bg-yellow-500 text-black", label: "T 13+" },
  M: { bg: "bg-red-500", label: "M 16+" },
};

const AnimeCard = ({ anime, index = 0, restricted }: AnimeCardProps) => {
  const rating = ratingConfig[anime.content_rating];
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
      {rating && (
        <span
          className={`absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold ${rating.bg}`}
        >
          {rating.label}
        </span>
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
