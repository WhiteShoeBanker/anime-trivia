import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-rule bg-secondary py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/"
          className="inline-block mb-6 font-display text-2xl text-text hover:text-primary transition-colors"
        >
          OtakuQuiz
        </Link>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-text mb-3">
              Play
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-text-muted hover:text-primary transition-colors">
                  Browse Anime
                </Link>
              </li>
              <li>
                <Link href="/daily" className="text-text-muted hover:text-primary transition-colors">
                  Daily Challenge
                </Link>
              </li>
              <li>
                <Link href="/badges" className="text-text-muted hover:text-primary transition-colors">
                  Badges
                </Link>
              </li>
              <li>
                <Link href="/leagues" className="text-text-muted hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-text-muted hover:text-primary transition-colors">
                  Swag Shop
                </Link>
              </li>
              <li>
                <Link href="/redeem" className="text-text-muted hover:text-primary transition-colors">
                  Redeem Code
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-text mb-3">
              Compete
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/duels" className="text-text-muted hover:text-primary transition-colors">
                  Duels
                </Link>
              </li>
              <li>
                <Link href="/grand-prix" className="text-text-muted hover:text-primary transition-colors">
                  Grand Prix
                </Link>
              </li>
              <li>
                <Link href="/star-league" className="text-text-muted hover:text-primary transition-colors">
                  Star League
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-text-muted hover:text-primary transition-colors">
                  Your Stats
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-text mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-text-muted hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-text mb-3">
              About
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              OtakuQuiz is not affiliated with any anime studio.
              All questions are based on publicly known facts.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-rule text-center text-xs text-text-muted">
          &copy; 2026 OtakuQuiz. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
