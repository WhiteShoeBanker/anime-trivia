"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Crown, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import PrestigeCertificate from "@/components/PrestigeCertificate";
import StarLeagueEmblem from "@/components/StarLeagueEmblem";

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
      {/* Hero — Champion Foil membership emblem above the paper-mode
          Hanko Decree certificate (DESIGN.md prestige Directions 1 + 2). */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-12"
      >
        <div className="mb-8">
          <StarLeagueEmblem />
        </div>
        <PrestigeCertificate
          title="Star League"
          eyebrow="Coming Soon"
          sealIcon={Star}
          className="w-full max-w-xl"
        >
          <p className="text-center text-lg">
            The ultimate competitive arena for OtakuQuiz&apos;s elite players.
          </p>
          <p className="mt-4 text-center text-sm">
            <span className="font-semibold text-ink">Requirement:</span>{" "}
            Reach Diamond League + Pro subscription
          </p>
        </PrestigeCertificate>
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
            <form
              onSubmit={handleSubmit}
              className="flex gap-3 items-end max-w-md mx-auto"
            >
              <Field
                id="waitlist-email"
                label={<span className="sr-only">Email address</span>}
                error={error || undefined}
                className="flex-1"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "..." : "Notify Me"}
              </button>
            </form>
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
