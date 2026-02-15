"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Download, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { getUsersList, type UsersListResult } from "../actions";

type UserRow = UsersListResult["users"][number];
type SortKey = keyof Pick<
  UserRow,
  | "username"
  | "display_name"
  | "rank"
  | "total_xp"
  | "current_streak"
  | "subscription_tier"
  | "created_at"
  | "last_played_at"
>;
type SortDir = "asc" | "desc";
type FilterTab = "all" | "pro" | "junior";

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
  { key: "rank", label: "Rank" },
  { key: "total_xp", label: "XP" },
  { key: "current_streak", label: "Streak" },
  { key: "subscription_tier", label: "Tier" },
  { key: "created_at", label: "Joined" },
  { key: "last_played_at", label: "Last Active" },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pro", label: "Pro" },
  { key: "junior", label: "Junior" },
];

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const sortUsers = (users: UserRow[], sortKey: SortKey, sortDir: SortDir): UserRow[] => {
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

const generateCSV = (users: UserRow[]): string => {
  const headers = [
    "Username",
    "Display Name",
    "Rank",
    "XP",
    "Streak",
    "Tier",
    "Joined",
    "Last Active",
  ];

  const rows = users.map((u) => [
    u.username ?? "",
    u.display_name ?? "",
    u.rank,
    String(u.total_xp),
    String(u.current_streak),
    u.subscription_tier,
    u.created_at,
    u.last_played_at ?? "",
  ]);

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  return lines.join("\n");
};

const AdminUsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UsersListResult | null>(null);
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

  // Fetch data when page, debouncedSearch, or filter changes
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getUsersList(page, debouncedSearch, filter);
        if (!cancelled) {
          setData(result);
        }
      } catch {
        // Server action failed — keep previous data
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
  }, [page, debouncedSearch, filter]);

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
    const csv = generateCSV(sorted);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `otakuquiz-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, sortKey, sortDir]);

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
        <div className="flex gap-2">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            RANK_COLORS[user.rank] ?? "bg-slate-600 text-slate-200"
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
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(user.last_played_at)}
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
            <Loader2 size={20} className="animate-spin text-orange-400 mr-2" />
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
