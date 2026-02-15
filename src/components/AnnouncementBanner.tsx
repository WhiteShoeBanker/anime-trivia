"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementBannerProps {
  message: string;
}

const AnnouncementBanner = ({ message }: AnnouncementBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !message) return null;

  return (
    <div className="bg-primary text-white text-sm text-center px-4 py-2 relative">
      <span>{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
