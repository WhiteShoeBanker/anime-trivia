"use client";

import { useEffect, useState } from "react";
import { Crown, TrendingUp, Star, AlertCircle } from "lucide-react";
import { getRevenueData } from "../actions";
import type { RevenueData } from "../actions";

const PRO_PRICE = 4.99;

const RevenuePage = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
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
      ? ((data.proSubscribers / data.totalUsers) * 100).toFixed(2)
      : "0.00";

  const estimatedMRR = (data.proSubscribers * PRO_PRICE).toFixed(2);

  const funnelProWidth =
    data.totalUsers > 0
      ? Math.max((data.proSubscribers / data.totalUsers) * 100, 4)
      : 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Revenue</h1>
        <p className="text-slate-400 mt-1">
          Subscription metrics and monetization insights
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
            {conversionRate}%
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

      {/* Conversion Funnel */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-1">
          Conversion Funnel
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Total users to Pro subscribers
        </p>

        <div className="space-y-4">
          {/* Step 1: Total Users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                Total Users
              </span>
              <span className="text-sm text-slate-400">
                {data.totalUsers.toLocaleString()}
              </span>
            </div>
            <div className="h-10 w-full bg-slate-600 rounded-lg flex items-center px-4">
              <span className="text-xs font-medium text-slate-200">
                {data.totalUsers.toLocaleString()} users
              </span>
            </div>
          </div>

          {/* Step 2: Pro Users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                Pro Users
              </span>
              <span className="text-sm text-slate-400">
                {data.proSubscribers.toLocaleString()} ({conversionRate}%)
              </span>
            </div>
            <div
              className="h-10 bg-orange-500 rounded-lg flex items-center px-4 transition-all duration-500"
              style={{ width: `${funnelProWidth}%` }}
            >
              <span className="text-xs font-medium text-white whitespace-nowrap">
                {data.proSubscribers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Insight */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-3">
          Revenue Insight
        </h2>
        <p className="text-slate-300 leading-relaxed">
          At{" "}
          <span className="font-semibold text-orange-400">
            ${PRO_PRICE.toFixed(2)}/month
          </span>
          , Pro subscribers generate an estimated{" "}
          <span className="font-semibold text-emerald-400">
            ${estimatedMRR} MRR
          </span>
          .
        </p>
        {data.limitHits > 0 && (
          <p className="text-slate-400 text-sm mt-3">
            {data.limitHits.toLocaleString()} quiz limit hits indicate potential
            upsell opportunities for free-tier users.
          </p>
        )}
      </div>
    </div>
  );
};

export default RevenuePage;
