import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, AlertTriangle, CheckCircle, XCircle,
  ArrowLeft, TrendingUp, ChevronDown, ChevronUp
} from "lucide-react";
import * as adminApi from "../api/adminApi";

export default function RiskScoring() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("score_desc");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getUsersWithRisk();
        setUsers(res.data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sorted = [...users]
    .filter((u) => filter === "ALL" || u.level === filter)
    .sort((a, b) => {
      if (sortBy === "score_desc") return (b.score || 0) - (a.score || 0);
      if (sortBy === "score_asc") return (a.score || 0) - (b.score || 0);
      if (sortBy === "name") return (a.user?.name || "").localeCompare(b.user?.name || "");
      return 0;
    });

  const scoreBarColor = (level) => {
    if (level === "FAKE") return "bg-red-500";
    if (level === "SUSPICIOUS") return "bg-yellow-500";
    return "bg-green-500";
  };

  const levelBadge = (level) => {
    if (level === "FAKE") return "bg-red-900/50 text-red-300 border border-red-700/60";
    if (level === "SUSPICIOUS") return "bg-yellow-900/50 text-yellow-300 border border-yellow-700/60";
    return "bg-green-900/50 text-green-300 border border-green-700/60";
  };

  const levelIcon = (level) => {
    if (level === "FAKE") return <XCircle className="w-3.5 h-3.5" />;
    if (level === "SUSPICIOUS") return <AlertTriangle className="w-3.5 h-3.5" />;
    return <CheckCircle className="w-3.5 h-3.5" />;
  };

  // Score thresholds explanation
  const thresholds = [
    { range: "0 – 49", level: "GENUINE", color: "text-green-400", desc: "Normal activity, no suspicious patterns detected." },
    { range: "50 – 69", level: "SUSPICIOUS", color: "text-yellow-400", desc: "Some unusual behavior. May indicate bot activity or account misuse." },
    { range: "70 – 100", level: "FAKE", color: "text-red-400", desc: "High-risk account. Multiple detection criteria triggered." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <Shield className="w-4 h-4 text-indigo-400" />
        <span className="text-sm text-gray-400">Admin</span>
        <span className="text-gray-700">/</span>
        <span className="text-white font-semibold text-sm">Risk Scoring</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Threshold legend */}
        <div className="grid md:grid-cols-3 gap-4">
          {thresholds.map((t) => (
            <div key={t.level} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${t.color}`}>{t.level}</span>
                <span className="text-xs text-gray-600 font-mono">{t.range}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {["ALL", "GENUINE", "SUSPICIOUS", "FAKE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="score_desc">Score: High to Low</option>
            <option value="score_asc">Score: Low to High</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {/* Risk score cards */}
        <div className="space-y-3">
          {sorted.length === 0 && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center">
              <p className="text-gray-600 text-sm">No users found.</p>
            </div>
          )}
          {sorted.map((u) => (
            <div key={u._id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">

              {/* Row */}
              <div
                className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-800/40 transition-colors"
                onClick={() => setExpanded(expanded === u._id ? null : u._id)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.user?.name || 'U')}&background=312e81&color=fff`}
                  alt=""
                  className="w-9 h-9 rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{u.user?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-600">{u.user?.email || ""}</p>
                </div>

                {/* Score bar */}
                <div className="hidden md:flex items-center gap-3 w-48">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreBarColor(u.level)}`}
                      style={{ width: `${Math.min(u.score || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-8 text-right">{u.score ?? 0}</span>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${levelBadge(u.level)}`}>
                  {levelIcon(u.level)}
                  {u.level}
                </span>

                {expanded === u._id
                  ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                }
              </div>

              {/* Expanded: detection reasons */}
              {expanded === u._id && (
                <div className="px-6 pb-5 border-t border-gray-800/60">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-4 mb-3">
                    Detection breakdown
                  </p>

                  {/* Mobile score bar */}
                  <div className="md:hidden mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBarColor(u.level)}`}
                          style={{ width: `${Math.min(u.score || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">{u.score ?? 0} / 100</span>
                    </div>
                  </div>

                  {u.reasons && u.reasons.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-2">
                      {u.reasons.map((r, i) => {
                        const isPass = r.startsWith("✅");
                        const isFail = r.startsWith("❌");
                        const isWarn = r.startsWith("⚠️");
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                              isFail ? "bg-red-950/30 text-red-300" :
                              isWarn ? "bg-yellow-950/30 text-yellow-300" :
                              "bg-gray-800/60 text-gray-400"
                            }`}
                          >
                            <span className="shrink-0 mt-0.5">{r.slice(0, 2)}</span>
                            <span>{r.slice(2).trim()}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs">No detection reasons recorded yet.</p>
                  )}

                  {u.accountAgeDays !== undefined && (
                    <p className="text-xs text-gray-600 mt-3">
                      Account age: {Math.round(u.accountAgeDays)} day{Math.round(u.accountAgeDays) !== 1 ? "s" : ""}
                      {u.lastUpdated && ` · Last scored: ${new Date(u.lastUpdated).toLocaleString()}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
