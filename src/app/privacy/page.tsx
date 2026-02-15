import { Shield, Eye, Ban, Baby, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy - OtakuQuiz",
  description: "How OtakuQuiz handles your data — in plain language.",
};

const sections = [
  {
    icon: Shield,
    title: "What we collect",
    color: "text-success",
    content: "Username, email, quiz scores, and age. That's it. We need these to run your account, track your progress, and keep the experience age-appropriate.",
  },
  {
    icon: Ban,
    title: "What we DON'T collect",
    color: "text-primary",
    content: "Photos, location, contacts, or browsing history. We have zero interest in tracking what you do outside OtakuQuiz.",
  },
  {
    icon: Eye,
    title: "Ads",
    color: "text-yellow-400",
    content: "Banner ads on the results page only. Never targeted. Never personalized. Never for users under 13. Pro subscribers see no ads at all.",
  },
  {
    icon: Shield,
    title: "Data selling",
    color: "text-accent",
    content: "NEVER. We don't sell your data. Period. Not to advertisers, not to data brokers, not to anyone. Your quiz scores are yours.",
  },
  {
    icon: Baby,
    title: "Under 13",
    color: "text-blue-400",
    content: "We collect minimal data with parent consent. No analytics cookies. No third-party tracking. We take COPPA seriously because your safety matters more than our metrics.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy at OtakuQuiz</h1>
      <p className="text-white/50 mb-10">
        Plain language, no legal jargon. Here's exactly how we handle your data.
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-surface rounded-2xl border border-white/10 p-5 md:p-6"
          >
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 ${section.color}`}>
                <section.icon size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full legal policy link */}
      <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
        <FileText size={20} className="mx-auto text-white/30 mb-2" />
        <p className="text-sm text-white/40 mb-2">
          Need the full legal version?
        </p>
        <Link
          href="#"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Read Full Privacy Policy (Coming Soon)
        </Link>
      </div>
    </div>
  );
}
