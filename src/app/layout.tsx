import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ToastContainer from "@/components/ToastContainer";
import { AuthProvider } from "@/contexts/AuthContext";
import { getConfig } from "@/lib/admin-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://otakuquiz.app"),
  title: {
    default: "OtakuQuiz - Anime Trivia",
    template: "%s | OtakuQuiz",
  },
  description:
    "Test your anime knowledge with OtakuQuiz! Trivia questions from Easy to Hard across 50+ anime titles. Rank up from Genin to Hokage.",
  keywords: [
    "anime trivia",
    "anime quiz",
    "otaku quiz",
    "naruto quiz",
    "one piece trivia",
    "anime knowledge test",
  ],
  openGraph: {
    title: "OtakuQuiz - Anime Trivia",
    description:
      "Test your anime knowledge with trivia questions across 50+ anime titles. Compete, rank up, and prove you're the ultimate otaku.",
    url: "https://otakuquiz.app",
    siteName: "OtakuQuiz",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OtakuQuiz - Anime Trivia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OtakuQuiz - Anime Trivia",
    description:
      "Test your anime knowledge with trivia questions across 50+ anime titles.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  other: {
    "theme-color": "#1A1A2E",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let maintenanceMode = false;
  let announcementBanner = "";

  try {
    maintenanceMode = await getConfig<boolean>("maintenance_mode");
    announcementBanner = await getConfig<string>("announcement_banner");
  } catch {
    // Config unavailable — use defaults
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-secondary`}>
        <AuthProvider>
          {maintenanceMode ? (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Under Maintenance
              </h1>
              <p className="text-white/60 max-w-md">
                OtakuQuiz is temporarily down for maintenance. We&apos;ll be back
                shortly — thanks for your patience!
              </p>
            </div>
          ) : (
            <>
              {announcementBanner && (
                <AnnouncementBanner message={announcementBanner} />
              )}
              <Navbar />
              <main className="pt-16 pb-20 md:pb-0 min-h-screen flex flex-col">
                <div className="flex-1">{children}</div>
                <Footer />
              </main>
              <ToastContainer />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
