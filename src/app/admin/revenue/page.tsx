"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Crown,
  TrendingUp,
  Star,
  AlertCircle,
  Copy,
  Plus,
  Loader2,
  CheckCircle2,
  Gift,
  ShoppingBag,
} from "lucide-react";
import { getRevenueData, generatePromoCode } from "../actions";
import type { RevenueData } from "../actions";

const PRO_PRICE = 4.99;

const PIE_COLORS: Record<string, string> = {
  paid: "#fb923c",
  promo_code: "#a855f7",
  admin_grant: "#34d399",
};

const PIE_LABELS: Record<string, string> = {
  paid: "Paid",
  promo_code: "Promo Code",
  admin_grant: "Admin Grant",
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  pro_monthly: "bg-orange-500/10 text-orange-400",
  pro_yearly: "bg-purple-500/10 text-purple-400",
  pro_lifetime: "bg-emerald-500/10 text-emerald-400",
};

const formatDateTick = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateLabel = (label: ReactNode): ReactNode => {
  if (typeof label !== "string") return String(label ?? "");
  return formatDateTick(label);
};

const RevenuePage = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate promo code form state
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [genType, setGenType] = useState<
    "pro_monthly" | "pro_yearly" | "pro_lifetime"
  >("pro_monthly");
  const [genMaxUses, setGenMaxUses] = useState(1);
  const [genExpiresAt, setGenExpiresAt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getRevenueData();
        setData(result);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedCode(null);
    try {
      const result = await generatePromoCode(
        genType,
        genMaxUses,
        genExpiresAt || null,
        "admin@otakuquiz.com"
      );
      setGeneratedCode(result.code);
      // Refresh data to show new code in table
      const refreshed = await getRevenueData();
      setData(refreshed);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-slate-400 py-12">
        Failed to load revenue data.
      </div>
    );
  }

  const conversionRate =
    data.totalUsers > 0
      ? ((data.proSubscribers / data.totalUsers) * 100).toFixed(2) + "%"
      : "0.00%";

  const estimatedMRR = (data.proSubscribers * PRO_PRICE).toFixed(2);

  const pieData = [
    { name: "paid", value: data.proBySource.paid },
    { name: "promo_code", value: data.proBySource.promo_code },
    { name: "admin_grant", value: data.proBySource.admin_grant },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Revenue</h1>
        <p className="text-slate-400 mt-1">
          Subscription metrics, promo codes, and monetization insights
          &mdash; Est. MRR:{" "}
          <span className="font-semibold text-emerald-400">
            ${estimatedMRR}
          </span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pro Subscribers */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Crown size={20} className="text-orange-400" />
            </div>
            <span className="text-sm text-slate-400">Pro Subscribers</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">
            {data.proSubscribers.toLocaleString()}
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <span className="text-sm text-slate-400">Conversion Rate</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {conversionRate}
          </p>
        </div>

        {/* Star League Waitlist */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Star size={20} className="text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">Star League Waitlist</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {data.waitlistCount.toLocaleString()}
          </p>
        </div>

        {/* Quiz Limit Hits */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <span className="text-sm text-slate-400">Quiz Limit Hits</span>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {data.limitHits.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pro by Source - Pie Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Pro by Source
          </h2>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[entry.name] ?? "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "0.5rem",
                      color: "#f1f5f9",
                      fontSize: "0.875rem",
                    }}
                    formatter={(value: number | undefined, name: string | undefined) => [
                      value ?? 0,
                      PIE_LABELS[name ?? ""] ?? name ?? "",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          PIE_COLORS[entry.name] ?? "#64748b",
                      }}
                    />
                    <span className="text-sm text-slate-300">
                      {PIE_LABELS[entry.name] ?? entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-slate-500 text-sm">
              No Pro subscribers yet
            </div>
          )}
        </div>

        {/* Quiz Limit Hits per Day - Bar Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Quiz Limit Hits per Day
          </h2>
          {data.limitHitsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.limitHitsByDay}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateTick}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem",
                    color: "#f1f5f9",
                    fontSize: "0.875rem",
                  }}
                  labelFormatter={formatDateLabel}
                />
                <Bar
                  dataKey="count"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="Limit Hits"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
              No limit hit data available
            </div>
          )}
        </div>
      </div>

      {/* Promo Codes Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gift size={20} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Promo Codes
            </h2>
          </div>
          <button
            onClick={() => {
              setShowGenerateForm(!showGenerateForm);
              setGeneratedCode(null);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Generate
          </button>
        </div>

        {/* Generate Promo Code Form */}
        {showGenerateForm && (
          <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Generate Promo Code
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type Select */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Type
                </label>
                <select
                  value={genType}
                  onChange={(e) =>
                    setGenType(
                      e.target.value as
                        | "pro_monthly"
                        | "pro_yearly"
                        | "pro_lifetime"
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pro_monthly">Pro Monthly</option>
                  <option value="pro_yearly">Pro Yearly</option>
                  <option value="pro_lifetime">Pro Lifetime</option>
                </select>
              </div>

              {/* Max Uses Input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Max Uses
                </label>
                <input
                  type="number"
                  min={1}
                  value={genMaxUses}
                  onChange={(e) => setGenMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Expiration Date Input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Expires At (optional)
                </label>
                <input
                  type="date"
                  value={genExpiresAt}
                  onChange={(e) => setGenExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {generating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {generating ? "Generating..." : "Generate Code"}
              </button>

              {/* Generated Code Display */}
              {generatedCode && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-emerald-500/30 rounded-lg">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <code className="text-sm font-mono text-emerald-400">
                    {generatedCode}
                  </code>
                  <button
                    onClick={() => handleCopyCode(generatedCode)}
                    className="p-1 rounded hover:bg-slate-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} className="text-slate-400" />
                  </button>
                  {copySuccess && (
                    <span className="text-xs text-emerald-400">Copied!</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promo Codes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Code
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Type
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400 text-right">
                  Max Uses
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400 text-right">
                  Current Uses
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Expires At
                </th>
                <th className="pb-3 text-sm font-medium text-slate-400">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody>
              {data.promoCodes.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-b border-slate-700/50 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <code className="text-sm font-mono text-slate-200">
                      {promo.code}
                    </code>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        TYPE_BADGE_STYLES[promo.type] ??
                        "bg-slate-600/50 text-slate-400"
                      }`}
                    >
                      {promo.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-300 text-right tabular-nums">
                    {promo.max_uses}
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-300 text-right tabular-nums">
                    {promo.current_uses}
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">
                    {promo.expires_at
                      ? new Date(promo.expires_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="py-3 text-sm text-slate-400">
                    {promo.created_by ?? "System"}
                  </td>
                </tr>
              ))}
              {data.promoCodes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No promo codes created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redemption Log */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Redemption Log (Last 50)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Username
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Code
                </th>
                <th className="pb-3 pr-4 text-sm font-medium text-slate-400">
                  Type
                </th>
                <th className="pb-3 text-sm font-medium text-slate-400">
                  Redeemed At
                </th>
              </tr>
            </thead>
            <tbody>
              {data.redemptions.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-700/50 last:border-0"
                >
                  <td className="py-3 pr-4 text-sm text-slate-200">
                    {r.username ?? "Anonymous"}
                  </td>
                  <td className="py-3 pr-4">
                    <code className="text-sm font-mono text-slate-300">
                      {r.code}
                    </code>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        TYPE_BADGE_STYLES[r.type] ??
                        "bg-slate-600/50 text-slate-400"
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-slate-400">
                    {new Date(r.redeemed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.redemptions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    No redemptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <ShoppingBag size={20} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Swag Shop Views</p>
            <p className="text-2xl font-bold text-slate-100">
              {data.shopViews.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
