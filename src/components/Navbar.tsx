"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Swords, ShoppingBag, BarChart3, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BadgeIcon from "@/components/BadgeIcon";
import type { Badge } from "@/types";
import { getUserEmblem } from "@/lib/badges";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/daily", label: "Daily" },
  { href: "/leagues", label: "Leagues" },
  { href: "/grand-prix", label: "Grand Prix" },
  { href: "/duels", label: "Duels" },
  { href: "/badges", label: "Badges" },
  { href: "/shop", label: "Swag Shop" },
  { href: "/stats", label: "Stats" },
  { href: "/profile", label: "Profile" },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

const AgeBadge = ({ ageGroup }: { ageGroup: string }) => {
  if (ageGroup === "junior") {
    return (
      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500 text-white">
        Jr
      </span>
    );
  }
  if (ageGroup === "teen") {
    return (
      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-yellow-500 text-black">
        T
      </span>
    );
  }
  return null;
};

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emblem, setEmblem] = useState<Badge | null>(null);
  const [pendingDuelCount, setPendingDuelCount] = useState(0);
  const { user, profile, ageGroup, signOut } = useAuth();

  // Fetch emblem when user/profile changes
  useEffect(() => {
    if (!user || !profile?.emblem_badge_id) {
      setEmblem(null);
      return;
    }
    getUserEmblem(user.id).then(setEmblem).catch(() => setEmblem(null));
  }, [user, profile?.emblem_badge_id]);

  // Fetch pending duel challenge count
  useEffect(() => {
    if (!user) {
      setPendingDuelCount(0);
      return;
    }
    const fetchPending = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("duel_matches")
        .select("*", { count: "exact", head: true })
        .eq("opponent_id", user.id)
        .eq("status", "waiting")
        .eq("match_type", "friend_challenge");
      setPendingDuelCount(count ?? 0);
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignIn = () => {
    router.push("/auth");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const displayInitial =
    (profile?.display_name ?? profile?.username ?? user?.email ?? "?")
      .charAt(0)
      .toUpperCase();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-secondary/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-primary">
          OtakuQuiz
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-1 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5"
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              style={{
                color: isActive(pathname, link.href)
                  ? "var(--color-primary)"
                  : "rgba(255,255,255,0.7)",
              }}
            >
              {link.href === "/daily" && <Calendar size={14} />}
              {link.href === "/duels" && <Swords size={14} />}
              {link.href === "/shop" && <ShoppingBag size={14} />}
              {link.href === "/stats" && <BarChart3 size={14} />}
              {link.label}
              {link.href === "/duels" && pendingDuelCount > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingDuelCount}
                </span>
              )}
              {isActive(pathname, link.href) && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {profile?.subscription_tier === "pro" && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary text-white">
                  PRO
                </span>
              )}
              <AgeBadge ageGroup={ageGroup} />
              {emblem && (
                <BadgeIcon
                  iconName={emblem.icon_name}
                  iconColor={emblem.icon_color}
                  rarity={emblem.rarity}
                  size="sm"
                  earned
                />
              )}
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {displayInitial}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-secondary flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-4">
              <Link href="/" className="text-xl font-bold text-primary">
                OtakuQuiz
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-2xl font-semibold transition-colors hover:text-primary flex items-center gap-2"
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    style={{
                      color: isActive(pathname, link.href)
                        ? "var(--color-primary)"
                        : "white",
                    }}
                  >
                    {link.href === "/daily" && <Calendar size={22} />}
                    {link.href === "/duels" && <Swords size={22} />}
                    {link.href === "/shop" && <ShoppingBag size={22} />}
                    {link.href === "/stats" && <BarChart3 size={22} />}
                    {link.label}
                    {link.href === "/duels" && pendingDuelCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                        {pendingDuelCount}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.1 }}
                className="mt-4"
              >
                {user ? (
                  <div className="flex flex-col items-center gap-3">
                    {profile?.subscription_tier === "pro" && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-primary text-white">
                        PRO
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {emblem && (
                        <BadgeIcon
                          iconName={emblem.icon_name}
                          iconColor={emblem.icon_color}
                          rarity={emblem.rarity}
                          size="sm"
                          earned
                        />
                      )}
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                        {displayInitial}
                      </div>
                      <AgeBadge ageGroup={ageGroup} />
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-3 text-sm font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="px-6 py-3 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
