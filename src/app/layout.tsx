import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OtakuQuiz - Anime Trivia",
  description: "Test your anime knowledge with OtakuQuiz! Trivia questions from Easy to Hard across 50+ anime titles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-secondary`}>
        <Navbar />
        <main className="pt-16 min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
