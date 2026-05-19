"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, LogOut, Swords, ShoppingBag, BarChart3, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ModalShell } from "@/components/ui/ModalShell";
import { SignOutErrorModal } from "@/components/SignOutErrorModal";
import BadgeIcon from "@/components/BadgeIcon";
import { Pill } from "@/components/ui/Pill";
import { CountBadge } from "@/components/ui/CountBadge";
import { Button } from "@/components/ui/Button";
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
      <Pill tone="audience-junior" size="sm">
        Jr
      </Pill>
    );
  }
  if (ageGroup === "teen") {
    return (
      <Pill tone="audience-teen" size="sm">
        T
      </Pill>
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

  // Body scroll lock is owned by ModalShell's useScrollLock when the
  // mobile overlay opens (DESIGN.md L649 — single source of truth; the
  // former inline document.body.style.overflow effect was retired in
  // Phase 5 #7c).

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-nav h-16 bg-secondary/80 backdrop-blur-lg border-b border-white/10">
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
                <CountBadge size="sm" className="ml-0.5">
                  {pendingDuelCount}
                </CountBadge>
              )}
              {isActive(pathname, link.href) && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
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
                <Pill tone="pro" size="sm">
                  PRO
                </Pill>
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
        <Button
          variant="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={24} />
        </Button>
      </div>
    </nav>

    {/* Mobile overlay — rendered as a sibling of <nav> so its fixed
        positioning is anchored to the viewport, not trapped by the
        nav's backdrop-filter containing block. */}
    <ModalShell
      isOpen={mobileOpen}
      onClose={() => setMobileOpen(false)}
      zIndex="nav"
      id="mobile-menu"
      backdropClassName="bg-secondary flex flex-col"
      dismissOnBackdrop={false}
      aria-label="Navigation menu"
    >
          {/* Top bar */}
          <div className="flex-shrink-0 flex items-center justify-between h-16 px-4">
            <Link href="/" className="text-xl font-bold text-primary">
              OtakuQuiz
            </Link>
            <Button
              variant="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} aria-hidden="true" />
            </Button>
          </div>

          {/* Scrollable link region — overscroll-contain prevents the
              scroll chain from leaking to <body> when the user reaches
              the top/bottom edge inside the overlay. */}
          <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col items-center justify-center gap-6 py-8 px-4">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { delay: i * 0.1 }}
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
                    <CountBadge size="md">
                      {pendingDuelCount}
                    </CountBadge>
                  )}
                </Link>
              </motion.div>
            ))}

            {user ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { delay: NAV_LINKS.length * 0.1 }}
                className="mt-4 flex flex-col items-center gap-3"
              >
                {profile?.subscription_tier === "pro" && (
                  <Pill tone="pro" size="md">
                    PRO
                  </Pill>
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
              </motion.div>
            ) : (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { delay: NAV_LINKS.length * 0.1 }}
                className="mt-4"
              >
                <button
                  onClick={handleSignIn}
                  className="px-6 py-3 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer — logout pinned at bottom when authenticated. */}
          {user && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleSignOut();
              }}
              className="flex-shrink-0 w-full px-6 py-4 flex items-center justify-center gap-3 text-text-muted hover:text-error border-t border-rule transition-colors min-h-[44px]"
            >
              <LogOut size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          )}
    </ModalShell>

    {/* Sign-out failure overlay. Surfaces server-side signOut errors and
        offers a force-sign-out path after a second failed attempt — never
        show a fake logged-out UI when the cookies might still be valid.
        Extracted to <SignOutErrorModal> (role="alertdialog", non-
        dismissible) in Phase 5 #7c. */}
    <SignOutErrorModal
      error={signOutError}
      attempts={signOutAttempts}
      onRetry={handleSignOut}
      onForceSignOut={handleForceSignOut}
      onCancel={() => setSignOutError(null)}
    />
    </>
  );
};

export default Navbar;
