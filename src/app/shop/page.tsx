"use client";

import { motion } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";

const SHOP_ITEMS = [
  { name: "Flame Border", type: "Avatar Frame", rarity: "Epic", price: 2000, gradient: "from-orange-500 to-red-500" },
  { name: "Cherry Blossom", type: "Avatar Frame", rarity: "Rare", price: 800, gradient: "from-pink-400 to-rose-500" },
  { name: "Quiz Master", type: "Badge", rarity: "Legendary", price: 5000, gradient: "from-amber-400 to-yellow-500" },
  { name: "Speed Demon", type: "Badge", rarity: "Epic", price: 1500, gradient: "from-blue-500 to-cyan-400" },
  { name: "Sage Mode", type: "Title", rarity: "Legendary", price: 3000, gradient: "from-purple-500 to-indigo-500" },
  { name: "Midnight Theme", type: "Theme", rarity: "Common", price: 500, gradient: "from-gray-600 to-gray-800" },
  { name: "Ocean Wave", type: "Avatar Frame", rarity: "Rare", price: 1000, gradient: "from-teal-400 to-blue-500" },
  { name: "Lightning Strike", type: "Badge", rarity: "Epic", price: 1800, gradient: "from-yellow-400 to-orange-500" },
];

const rarityColors: Record<string, string> = {
  Common: "text-white/50",
  Rare: "text-blue-400",
  Epic: "text-purple-400",
  Legendary: "text-amber-400",
};

const ShopPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={28} className="text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Cosmetic Shop</h1>
        </div>
        <p className="text-white/50">
          Customize your profile with frames, badges, titles, and themes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SHOP_ITEMS.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Preview gradient */}
            <div
              className={`h-28 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
            >
              <Sparkles size={32} className="text-white/60" />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <span className={`text-xs font-medium ${rarityColors[item.rarity]}`}>
                  {item.rarity}
                </span>
              </div>
              <p className="text-xs text-white/40 mb-3">{item.type}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">
                  {item.price.toLocaleString()} coins
                </span>
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/40 text-xs font-medium cursor-not-allowed"
                >
                  <Lock size={12} />
                  Coming Soon
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coming soon notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-5 rounded-2xl bg-primary/10 border border-primary/30 text-center"
      >
        <Sparkles size={20} className="mx-auto text-primary mb-2" />
        <p className="text-sm text-white/60">
          The cosmetic shop is under construction. Earn coins from quizzes and
          spend them on cosmetics when the shop launches!
        </p>
      </motion.div>
    </div>
  );
};

export default ShopPage;
