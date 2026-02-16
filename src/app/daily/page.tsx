import type { Metadata } from "next";
import DailyContent from "./DailyContent";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description:
    "Play the OtakuQuiz daily challenge! 10 mixed-difficulty questions across multiple anime series with 1.5x XP bonus.",
};

export default function DailyPage() {
  return <DailyContent />;
}
