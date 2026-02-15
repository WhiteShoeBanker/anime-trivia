"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Diamond, Trophy, Users, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  {
    icon: Trophy,
    title: "Exclusive Tournaments",
    description: "Weekly head-to-head brackets with the top players.",
  },
  {
    icon: Users,
    title: "Smaller Groups",
    description: "Compete in intimate leagues of 15 players for more intense rivalry.",
  },
  {
    icon: Crown,
    title: "Monthly Collectible Emblems",
    description: "Earn unique emblems each season that showcase your achievements.",
  },
];

const StarLeaguePage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [diamondCount, setDiamondCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true })
          .gte("total_xp", 10000);
        setDiamondCount(count ?? 0);
      } catch {
        // DB not available
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("star_league_waitlist")
        .insert({ email });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Diamond size={48} className="mx-auto text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Star League — Coming Soon
        </h1>
        <p className="text-white/50 text-lg max-w-lg mx-auto">
          The ultimate competitive arena for OtakuQuiz's elite players.
        </p>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-surface rounded-2xl border border-white/10 p-5 text-center"
          >
            <feature.icon size={28} className="mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-white/50">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Requirement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center mb-8"
      >
        <p className="text-sm text-white/70">
          <span className="font-semibold text-primary">Requirement:</span>{" "}
          Reach Diamond League + Pro subscription
        </p>
      </motion.div>

      {/* Waitlist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface rounded-2xl border border-white/10 p-6 mb-8"
      >
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-success font-semibold mb-1">You're on the list!</p>
            <p className="text-sm text-white/50">
              We'll email you when Star League launches.
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-white/60 mb-4">
              Get notified when Star League launches.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "..." : "Notify Me"}
              </button>
            </form>
            {error && (
              <p className="text-accent text-sm text-center mt-2">{error}</p>
            )}
          </>
        )}
      </motion.div>

      {/* Community counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-white/40 text-sm">
          <span className="text-white font-semibold">{diamondCount}</span>{" "}
          players have reached Diamond so far. Star League launches at 50.
        </p>
      </motion.div>
    </div>
  );
};

export default StarLeaguePage;
