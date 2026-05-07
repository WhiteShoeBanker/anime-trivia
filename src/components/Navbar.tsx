"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Swords, ShoppingBag, BarChart3, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BadgeIcon from "@/components/BadgeIcon";
import TierBadge, { tierFromXP } from "@/components/TierBadge";
import type { Badge } from "@/types";
import { getUserEmblem } from "@/lib/badges";
import { createClient } from "@/lib/supabase/client";
import useReducedMotion from "@/lib/use-reduced-motion";

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
      <span className="px-1.5 py-0.5 font-display uppercase text-[10px] tracking-tight bg-success text-black border-2 border-black">
        Jr
      </span>
    );
  }
  if (ageGroup === "teen") {
    return (
      <span className="px-1.5 py-0.5 font-display uppercase text-[10px] tracking-tight bg-warning text-black border-2 border-black">
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
  const { user, profile, ageGroup, signOut, forceSignOut } = useAuth();
  const reducedMotion = useReducedMotion();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signOutAttempts, setSignOutAttempts] = useState(0);

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
    setSignOutError(null);
    const { error } = await signOut();
    if (error) {
      setSignOutError(error);
      setSignOutAttempts((n) => n + 1);
      return;
    }
    setSignOutAttempts(0);
    router.push("/");
  };

  const handleForceSignOut = async () => {
    setSignOutError(null);
    await forceSignOut();
    // forceSignOut hard-reloads the page; this line shouldn't run.
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

  const userTier = profile ? tierFromXP(profile.total_xp) : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-secondary border-b-2 border-rule">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-display uppercase text-2xl text-text leading-none"
          style={{ letterSpacing: "-0.03em" }}
        >
          OtakuQuiz<span className="text-primary">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-0.5 py-3 font-display uppercase text-sm tracking-tight transition-colors flex items-center gap-1.5"
                aria-current={active ? "page" : undefined}
                style={{
                  color: active
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
                }}
              >
                {link.href === "/daily" && <Calendar size={14} aria-hidden="true" />}
                {link.href === "/duels" && <Swords size={14} aria-hidden="true" />}
                {link.href === "/shop" && <ShoppingBag size={14} aria-hidden="true" />}
                {link.href === "/stats" && <BarChart3 size={14} aria-hidden="true" />}
                {link.label}
                {link.href === "/duels" && pendingDuelCount > 0 && (
                  <span className="ml-0.5 min-w-[16px] h-4 px-1 bg-primary text-black text-[10px] font-mono font-bold flex items-center justify-center border border-black">
                    {pendingDuelCount}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-1 left-0 right-0 h-[3px] bg-primary"
                    transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              {profile?.subscription_tier === "pro" && (
                <span className="px-2 py-1 font-display uppercase text-[10px] tracking-tight bg-primary text-black border-2 border-black shadow-[2px_2px_0_0_#000]">
                  Pro
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
              {userTier && <TierBadge tier={userTier} size="sm" />}
              <div
                className="w-8 h-8 bg-primary text-black flex items-center justify-center font-display uppercase text-sm border-2 border-black shadow-[2px_2px_0_0_#000]"
                aria-hidden="true"
              >
                {displayInitial}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-text-muted hover:text-text transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 font-display uppercase text-sm tracking-tight bg-primary text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-hot transition-shadow"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text"
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
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-secondary flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b-2 border-rule">
              <Link
                href="/"
                className="font-display uppercase text-2xl text-text leading-none"
                style={{ letterSpacing: "-0.03em" }}
              >
                OtakuQuiz<span className="text-primary">.</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-text"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-5">
              {NAV_LINKS.map((link, i) => {
                const active = isActive(pathname, link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? { duration: 0 } : { delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="relative font-display uppercase text-3xl tracking-tight transition-colors flex items-center gap-2.5"
                      aria-current={active ? "page" : undefined}
                      style={{
                        color: active
                          ? "var(--color-text)"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {link.href === "/daily" && <Calendar size={22} aria-hidden="true" />}
                      {link.href === "/duels" && <Swords size={22} aria-hidden="true" />}
                      {link.href === "/shop" && <ShoppingBag size={22} aria-hidden="true" />}
                      {link.href === "/stats" && <BarChart3 size={22} aria-hidden="true" />}
                      {link.label}
                      {link.href === "/duels" && pendingDuelCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1 bg-primary text-black text-xs font-mono font-bold flex items-center justify-center border border-black">
                          {pendingDuelCount}
                        </span>
                      )}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { delay: NAV_LINKS.length * 0.05 }}
                className="mt-6"
              >
                {user ? (
                  <div className="flex flex-col items-center gap-4">
                    {profile?.subscription_tier === "pro" && (
                      <span className="px-3 py-1 font-display uppercase text-xs tracking-tight bg-primary text-black border-2 border-black shadow-[2px_2px_0_0_#000]">
                        Pro · VIP Access
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      {emblem && (
                        <BadgeIcon
                          iconName={emblem.icon_name}
                          iconColor={emblem.icon_color}
                          rarity={emblem.rarity}
                          size="sm"
                          earned
                        />
                      )}
                      {userTier && <TierBadge tier={userTier} size="sm" />}
                      <div
                        className="w-10 h-10 bg-primary text-black flex items-center justify-center font-display uppercase text-lg border-2 border-black shadow-[2px_2px_0_0_#000]"
                        aria-hidden="true"
                      >
                        {displayInitial}
                      </div>
                      <AgeBadge ageGroup={ageGroup} />
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-3 font-display uppercase text-sm tracking-tight bg-surface text-text border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-primary hover:text-black transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="px-6 py-3 font-display uppercase text-sm tracking-tight bg-primary text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-hot transition-shadow"
                  >
                    Sign In
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign-out failure overlay. Surfaces server-side signOut errors and
          offers a force-sign-out path after a second failed attempt — never
          show a fake logged-out UI when the cookies might still be valid. */}
      <AnimatePresence>
        {signOutError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
            role="alertdialog"
            aria-labelledby="signout-error-title"
          >
            <div className="bg-surface border-[2.5px] border-black shadow-hard-lg p-6 max-w-sm w-full">
              <h3
                id="signout-error-title"
                className="text-2xl text-text mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Couldn&apos;t sign you out
              </h3>
              <p className="text-sm text-text-muted mb-4">{signOutError}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 font-display uppercase text-sm tracking-tight bg-primary text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-hot transition-shadow min-h-[44px]"
                >
                  Try Again
                </button>
                {signOutAttempts >= 2 && (
                  <button
                    onClick={handleForceSignOut}
                    className="px-4 py-2 font-display uppercase text-sm tracking-tight bg-text text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-primary transition-colors min-h-[44px]"
                  >
                    Force Sign Out (reload page)
                  </button>
                )}
                <button
                  onClick={() => setSignOutError(null)}
                  className="px-4 py-2 font-display uppercase text-sm tracking-tight bg-secondary text-text-muted border-2 border-rule hover:text-text transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
