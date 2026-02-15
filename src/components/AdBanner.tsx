"use client";

interface AdBannerProps {
  isPro?: boolean;
  isJunior?: boolean;
  isVisible?: boolean;
}

const AdBanner = ({ isPro = false, isJunior = false, isVisible = true }: AdBannerProps) => {
  if (isPro || isJunior || !isVisible) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <p className="text-[10px] text-white/20 mb-1 text-center uppercase tracking-wider">
        Advertisement
      </p>
      <div className="h-[90px] bg-surface border border-white/10 rounded-xl flex items-center justify-center">
        <p className="text-white/20 text-sm">
          Ad Space — Never targeted. Never for users under 13.
        </p>
      </div>
    </div>
  );
};

export default AdBanner;
