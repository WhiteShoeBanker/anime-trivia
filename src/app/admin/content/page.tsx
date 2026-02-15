"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, BookOpen, BarChart3, Target } from "lucide-react";
import { getContentStats, type ContentStats } from "../actions";

interface AnimePopularityRow {
  id: string;
  title: string;
  totalQuestions: number;
  isActive: boolean;
  quizCount: number;
}

interface DifficultyCount {
  easy: number;
  medium: number;
  hard: number;
}

interface AnimeAccuracyRow {
  id: string;
  title: string;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

const computeAnimePopularity = (
  data: ContentStats
): AnimePopularityRow[] => {
  // Build a map of question_id -> anime_id
  const questionToAnime = new Map<string, string>();
  for (const q of data.questions) {
    questionToAnime.set(q.id, q.anime_id);
  }

  // Count answers per anime (quiz count = number of answers for questions in that anime)
  const animeQuizCounts = new Map<string, number>();
  for (const answer of data.answers) {
    const animeId = questionToAnime.get(answer.question_id);
    if (animeId) {
      animeQuizCounts.set(animeId, (animeQuizCounts.get(animeId) ?? 0) + 1);
    }
  }

  return data.anime.map((a) => ({
    id: a.id,
    title: a.title,
    totalQuestions: a.total_questions,
    isActive: a.is_active,
    quizCount: animeQuizCounts.get(a.id) ?? 0,
  }));
};

const computeDifficultyDistribution = (
  questions: ContentStats["questions"]
): DifficultyCount => {
  const counts: DifficultyCount = { easy: 0, medium: 0, hard: 0 };

  for (const q of questions) {
    const diff = q.difficulty.toLowerCase();
    if (diff === "easy") counts.easy++;
    else if (diff === "medium") counts.medium++;
    else if (diff === "hard") counts.hard++;
  }

  return counts;
};

const computeAnimeAccuracy = (data: ContentStats): AnimeAccuracyRow[] => {
  // Build a map of question_id -> anime_id
  const questionToAnime = new Map<string, string>();
  for (const q of data.questions) {
    questionToAnime.set(q.id, q.anime_id);
  }

  // Aggregate answers per anime
  const animeStats = new Map<
    string,
    { total: number; correct: number }
  >();
  for (const answer of data.answers) {
    const animeId = questionToAnime.get(answer.question_id);
    if (animeId) {
      const existing = animeStats.get(animeId) ?? { total: 0, correct: 0 };
      existing.total++;
      if (answer.is_correct) existing.correct++;
      animeStats.set(animeId, existing);
    }
  }

  return data.anime
    .map((a) => {
      const stats = animeStats.get(a.id) ?? { total: 0, correct: 0 };
      return {
        id: a.id,
        title: a.title,
        totalAnswers: stats.total,
        correctAnswers: stats.correct,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      };
    })
    .filter((a) => a.totalAnswers > 0)
    .sort((a, b) => b.totalAnswers - a.totalAnswers);
};

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy > 70) return "bg-green-500";
  if (accuracy >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const getAccuracyTextColor = (accuracy: number): string => {
  if (accuracy > 70) return "text-green-400";
  if (accuracy >= 40) return "text-yellow-400";
  return "text-red-400";
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  easy: { bg: "bg-green-500/10", text: "text-green-400", bar: "bg-green-500" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", bar: "bg-yellow-500" },
  hard: { bg: "bg-red-500/10", text: "text-red-400", bar: "bg-red-500" },
};

const AdminContentPage = () => {
  const [data, setData] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getContentStats();
        if (!cancelled) {
          setData(result);
        }
      } catch {
        // Server action failed -- keep previous data
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const popularityData = useMemo(
    () => (data ? computeAnimePopularity(data) : []),
    [data]
  );

  const difficultyData = useMemo(
    () => (data ? computeDifficultyDistribution(data.questions) : null),
    [data]
  );

  const accuracyData = useMemo(
    () => (data ? computeAnimeAccuracy(data) : []),
    [data]
  );

  const totalQuestions = data?.questions.length ?? 0;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Content</h1>
        <p className="text-sm text-slate-400 mt-1">
          {data
            ? `${data.anime.length} anime series, ${totalQuestions} questions, ${data.answers.length} answers`
            : "Loading..."}
        </p>
      </div>

      {/* Difficulty Distribution */}
      {difficultyData && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <BarChart3 size={18} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">
              Difficulty Distribution
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["easy", "medium", "hard"] as const).map((level) => {
              const count = difficultyData[level];
              const percentage =
                totalQuestions > 0
                  ? ((count / totalQuestions) * 100).toFixed(1)
                  : "0";
              const colors = DIFFICULTY_COLORS[level];

              return (
                <div
                  key={level}
                  className={`${colors.bg} border border-slate-700 rounded-xl p-4`}
                >
                  <p className="text-sm font-medium text-slate-400 capitalize mb-1">
                    {level}
                  </p>
                  <p className={`text-3xl font-bold tabular-nums ${colors.text}`}>
                    {count}
                  </p>
                  <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`${colors.bar} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Anime Popularity Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-700">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BookOpen size={18} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">
            Anime Popularity
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700">
                <th className="px-4 py-3 text-left font-semibold text-slate-300 whitespace-nowrap">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300 whitespace-nowrap">
                  Questions
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300 whitespace-nowrap">
                  Quiz Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {popularityData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No anime series found.
                  </td>
                </tr>
              ) : (
                popularityData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            row.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            row.isActive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {row.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {row.quizCount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question Accuracy */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-700">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Target size={18} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">
            Question Accuracy by Anime
          </h2>
        </div>

        {accuracyData.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-500 text-sm">
            No answer data available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 whitespace-nowrap">
                    Anime
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-300 whitespace-nowrap">
                    Answers
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-300 whitespace-nowrap">
                    Correct
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 whitespace-nowrap min-w-[200px]">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {accuracyData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {row.totalAnswers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums whitespace-nowrap">
                      {row.correctAnswers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-700 rounded-full h-2.5 min-w-[120px]">
                          <div
                            className={`${getAccuracyColor(row.accuracy)} h-2.5 rounded-full transition-all`}
                            style={{
                              width: `${Math.min(row.accuracy, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-semibold tabular-nums w-14 text-right ${getAccuracyTextColor(row.accuracy)}`}
                        >
                          {row.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading overlay for refetching */}
      {loading && data && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin text-orange-400 mr-2" />
          <span className="text-sm text-slate-400">
            Updating content stats...
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminContentPage;
