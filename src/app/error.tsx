"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle size={48} className="text-accent mb-6" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-white/50 mb-6 max-w-md text-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
