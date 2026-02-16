"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/leagues", label: "Leagues" },
  { href: "/leaderboard", label: "Leaderboard" },
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
  const { user, profile, ageGroup, signOut } = useAuth();

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
              className="relative px-1 py-2 text-sm font-medium transition-colors hover:text-primary"
              style={{
                color: isActive(pathname, link.href)
                  ? "var(--color-primary)"
                  : "rgba(255,255,255,0.7)",
              }}
            >
              {link.label}
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
              <AgeBadge ageGroup={ageGroup} />
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
                    className="text-2xl font-semibold transition-colors hover:text-primary"
                    style={{
                      color: isActive(pathname, link.href)
                        ? "var(--color-primary)"
                        : "white",
                    }}
                  >
                    {link.label}
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
                    <div className="flex items-center gap-2">
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
