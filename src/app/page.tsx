import Link from "next/link";
import { Shield, Lock, Eye, Zap, Trophy, BookOpen, Swords } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Fast-Paced Quizzes",
    description: "Answer 10 questions per round with time pressure. Easy, medium, or hard — you choose.",
  },
  {
    icon: Trophy,
    title: "Rank Up",
    description: "Earn XP, climb from Genin to Hokage, and compete on the global leaderboard.",
  },
  {
    icon: BookOpen,
    title: "8 Anime Series",
    description: "240+ questions across Naruto, One Piece, Attack on Titan, Demon Slayer, and more.",
  },
  {
    icon: Swords,
    title: "1v1 Duels",
    description: "Challenge friends or find a random opponent for head-to-head anime trivia battles.",
  },
];

const PRIVACY_POINTS = [
  {
    icon: Shield,
    text: "We never sell your data",
  },
  {
    icon: Lock,
    text: "Age-appropriate content for every player",
  },
  {
    icon: Eye,
    text: "No targeted ads — ever",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-32 text-center">
        <h1 className="animate-fade-in text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary mb-4">
          OtakuQuiz
        </h1>
        <p className="animate-slide-up text-lg sm:text-xl text-white/60 max-w-lg mx-auto mb-8">
          Test your anime knowledge with 240+ trivia questions. Compete, rank up, and prove you're the ultimate otaku.
        </p>
        <div className="animate-scale-up flex flex-col sm:flex-row gap-3">
          <Link
            href="/browse"
            className="px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Start Playing
          </Link>
          <Link
            href="/shop"
            className="px-8 py-4 text-lg font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Cosmetic Shop
          </Link>
        </div>
        <div className="mt-8 h-1 w-24 rounded-full bg-accent" />
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface rounded-2xl border border-white/10 p-6 text-center"
            >
              <feature.icon size={32} className="mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safe & Private */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Safe & Private
        </h2>
        <p className="text-center text-white/40 mb-10 max-w-md mx-auto">
          Built for all ages. Your privacy is not negotiable.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIVACY_POINTS.map((point) => (
            <div
              key={point.text}
              className="bg-surface rounded-2xl border border-white/10 p-6 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <point.icon size={24} className="text-primary" />
              </div>
              <p className="font-medium text-white/80">{point.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link
            href="/privacy"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Read our full privacy summary →
          </Link>
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to prove your anime knowledge?
        </h2>
        <p className="text-white/50 mb-8">
          Free to play. 10 quizzes per day. Upgrade to Pro for unlimited.
        </p>
        <Link
          href="/browse"
          className="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Browse Anime & Start
        </Link>
      </section>
    </div>
  );
}
