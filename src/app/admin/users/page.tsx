"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  Loader2,
  Crown,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getUsersList,
  upgradeUserToPro,
  revokeUserPro,
  getUserDuelStats,
  type UsersListResult,
} from "../actions";

type UserRow = UsersListResult["users"][number];
type SortKey = keyof Pick<
  UserRow,
  | "username"
  | "display_name"
  | "age_group"
  | "rank"
  | "total_xp"
  | "current_streak"
  | "subscription_tier"
  | "subscription_source"
  | "created_at"
  | "last_played_at"
>;
type SortDir = "asc" | "desc";
type FilterTab = "all" | "pro" | "junior" | "teen" | "churned" | "admin_grant";

const RANK_COLORS: Record<string, string> = {
  Genin: "bg-slate-600 text-slate-200",
  Chunin: "bg-green-700 text-green-100",
  Jonin: "bg-blue-700 text-blue-100",
  ANBU: "bg-purple-700 text-purple-100",
  Kage: "bg-yellow-600 text-yellow-100",
  Hokage: "bg-orange-600 text-orange-100",
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "username", label: "Username" },
  { key: "display_name", label: "Display Name" },
  { key: "age_group", label: "Age Group" },
  { key: "rank", label: "Rank" },
  { key: "total_xp", label: "XP" },
  { key: "current_streak", label: "Streak" },
  { key: "subscription_tier", label: "Tier" },
  { key: "subscription_source", label: "Source" },
  { key: "created_at", label: "Joined" },
  { key: "last_played_at", label: "Last Active" },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pro", label: "Pro" },
  { key: "junior", label: "Junior" },
  { key: "teen", label: "Teen" },
  { key: "churned", label: "Churned" },
  { key: "admin_grant", label: "Admin Grant" },
];

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const sortUsers = (
  users: UserRow[],
  sortKey: SortKey,
  sortDir: SortDir
): UserRow[] => {
  const sorted = [...users].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return aVal - bVal;
    }

    return String(aVal).localeCompare(String(bVal));
  });

  return sortDir === "desc" ? sorted.reverse() : sorted;
};

const generateCSV = (users: UserRow[], statsMap: Record<string, DuelStats>): string => {
  const headers = [
    "Username",
    "Display Name",
    "Age Group",
    "Rank",
    "XP",
    "Streak",
    "Tier",
    "Source",
    "Joined",
    "Last Active",
    "Wins",
    "Losses",
    "Draws",
  ];

  const rows = users.map((u) => {
    const s = statsMap[u.id];
    return [
      u.username ?? "",
      u.display_name ?? "",
      u.age_group,
      u.rank,
      String(u.total_xp),
      String(u.current_streak),
      u.subscription_tier,
      u.subscription_source,
      u.created_at,
      u.last_played_at ?? "",
      String(s?.wins ?? 0),
      String(s?.losses ?? 0),
      String(s?.draws ?? 0),
    ];
  });

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ];
  return lines.join("\n");
};

type DuelStats = { wins: number; losses: number; draws: number };

const AdminUsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UsersListResult | null>(null);
  const [upgradeDropdownOpen, setUpgradeDropdownOpen] = useState<string | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [duelStatsMap, setDuelStatsMap] = useState<Record<string, DuelStats>>({});
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsersList(page, debouncedSearch, filter);
      setData(result);
    } catch {
      // Server action failed - keep previous data
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  // Fetch data when page, debouncedSearch, or filter changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getUsersList(page, debouncedSearch, filter);
        if (!cancelled) {
          setData(result);
        }
      } catch {
        // Server action failed - keep previous data
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, filter]);

  // Fetch duel stats for current page of users
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const fetchStats = async () => {
      const entries = await Promise.all(
        data.users.map(async (u) => {
          const stats = await getUserDuelStats(u.id);
          return [u.id, stats ?? { wins: 0, losses: 0, draws: 0 }] as const;
        })
      );
      if (!cancelled) {
        setDuelStatsMap(Object.fromEntries(entries));
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [data]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const handleFilterChange = useCallback((tab: FilterTab) => {
    setFilter(tab);
    setPage(1);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!data) return;
    const sorted = sortUsers(data.users, sortKey, sortDir);
    const csv = generateCSV(sorted, duelStatsMap);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `otakuquiz-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, sortKey, sortDir, duelStatsMap]);

  const handleUpgrade = useCallback(
    async (
      userId: string,
      tier: "pro_monthly" | "pro_yearly" | "pro_lifetime"
    ) => {
      setActionLoading(userId);
      setUpgradeDropdownOpen(null);
      try {
        await upgradeUserToPro(userId, tier, "admin");
        await fetchData();
      } catch {
        // Action failed
      } finally {
        setActionLoading(null);
      }
    },
    [fetchData]
  );

  const handleRevoke = useCallback(
    async (userId: string) => {
      setActionLoading(userId);
      try {
        await revokeUserPro(userId, "admin");
        await fetchData();
      } catch {
        // Action failed
      } finally {
        setActionLoading(null);
      }
    },
    [fetchData]
  );

  const sortedUsers = data ? sortUsers(data.users, sortKey, sortDir) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Users</h1>
          <p className="text-sm text-slate-400 mt-1">
            {data ? `${data.total} total users` : "Loading..."}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!data || data.users.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-slate-200 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by username or display name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-orange-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700">
                  {COLUMNS.map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3 text-left font-semibold text-slate-300 cursor-pointer select-none hover:text-slate-100 transition-colors whitespace-nowrap"
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {sortKey === key ? (
                          sortDir === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <span className="w-3.5" />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-emerald-400 whitespace-nowrap">W</th>
                  <th className="px-4 py-3 text-center font-semibold text-red-400 whitespace-nowrap">L</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-400 whitespace-nowrap">D</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length + 4}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-750 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">
                        {user.username ?? "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {user.display_name ?? "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {user.age_group}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            RANK_COLORS[user.rank] ??
                            "bg-slate-600 text-slate-200"
                          }`}
                        >
                          {user.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums whitespace-nowrap">
                        {user.total_xp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums whitespace-nowrap">
                        {user.current_streak}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.subscription_tier === "pro"
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {user.subscription_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {user.subscription_source}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(user.last_played_at)}
                      </td>
                      {(() => {
                        const s = duelStatsMap[user.id];
                        return (
                          <>
                            <td className="px-4 py-3 text-center tabular-nums text-emerald-400 whitespace-nowrap">{s?.wins ?? 0}</td>
                            <td className="px-4 py-3 text-center tabular-nums text-red-400 whitespace-nowrap">{s?.losses ?? 0}</td>
                            <td className="px-4 py-3 text-center tabular-nums text-slate-400 whitespace-nowrap">{s?.draws ?? 0}</td>
                          </>
                        );
                      })()}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {actionLoading === user.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-orange-400"
                          />
                        ) : user.subscription_tier === "pro" ? (
                          <button
                            onClick={() => handleRevoke(user.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            <XCircle size={14} />
                            Revoke Pro
                          </button>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setUpgradeDropdownOpen(
                                  upgradeDropdownOpen === user.id
                                    ? null
                                    : user.id
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Crown size={14} />
                              Upgrade to Pro
                              <ChevronDown size={12} />
                            </button>
                            {upgradeDropdownOpen === user.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-slate-700 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                                <button
                                  onClick={() =>
                                    handleUpgrade(user.id, "pro_monthly")
                                  }
                                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-200 hover:bg-slate-600 transition-colors"
                                >
                                  Monthly
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpgrade(user.id, "pro_yearly")
                                  }
                                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-200 hover:bg-slate-600 transition-colors"
                                >
                                  Yearly
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpgrade(user.id, "pro_lifetime")
                                  }
                                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-200 hover:bg-slate-600 transition-colors"
                                >
                                  Lifetime
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Loading overlay for subsequent fetches */}
        {loading && data && (
          <div className="flex items-center justify-center py-4 border-t border-slate-700">
            <Loader2
              size={20}
              className="animate-spin text-orange-400 mr-2"
            />
            <span className="text-sm text-slate-400">Updating...</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-slate-300 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-slate-300 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
