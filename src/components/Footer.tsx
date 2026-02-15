import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-secondary py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-3">Play</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-white/40 hover:text-primary transition-colors">
                  Browse Anime
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-white/40 hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-white/40 hover:text-primary transition-colors">
                  Cosmetic Shop
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-3">Compete</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/star-league" className="text-white/40 hover:text-primary transition-colors">
                  Star League
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-white/40 hover:text-primary transition-colors">
                  Your Stats
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-white/40 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-3">About</h3>
            <p className="text-xs text-white/30 leading-relaxed">
              OtakuQuiz is not affiliated with any anime studio.
              All questions are based on publicly known facts.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-white/5 text-center text-xs text-white/20">
          &copy; 2026 OtakuQuiz. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
