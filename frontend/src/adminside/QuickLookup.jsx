import React, { useState, useRef } from "react";
import { Search, CheckCircle, AlertTriangle, XCircle, RefreshCw, Flag, Mail, Clock } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const levelCfg = {
  GENUINE: {
    color: "text-green-800",
    bg: "bg-green-100",
    border: "border-green-200",
    icon: CheckCircle,
    label: "Genuine account",
    desc: "No suspicious behavior detected."
  },
  SUSPICIOUS: {
    color: "text-amber-800",
    bg: "bg-amber-100",
    border: "border-amber-200",
    icon: AlertTriangle,
    label: "Suspicious account",
    desc: "Unusual patterns require monitoring."
  },
  FAKE: {
    color: "text-red-800",
    bg: "bg-red-100",
    border: "border-red-200",
    icon: XCircle,
    label: "Fake account",
    desc: "Multiple detection criteria triggered."
  }
};

export default function QuickLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rerunning, setRerunning] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true); setResult(null); setError(null);

    try {
      const res = await adminApi.getUsersWithRisk();
      const q = query.trim().toLowerCase();

      const match = (res.data || []).find(u =>
        u.user?.email?.toLowerCase().includes(q) ||
        u.user?.name?.toLowerCase().includes(q)
      );

      match ? setResult(match) : setError(`No user found for "${query}"`);
    } catch {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = async () => {
    if (!result?.user?._id) return;

    setRerunning(true);
    try {
      await adminApi.runDetectionForUser(result.user._id);
      const res = await adminApi.getUsersWithRisk();
      const updated = (res.data || []).find(u => String(u.user?._id) === String(result.user._id));
      if (updated) setResult(updated);
    } finally {
      setRerunning(false);
    }
  };

  const handleFlag = async () => {
    if (!result?.user?._id) return;
    await adminApi.flagUser(result.user._id);
    setResult(prev => ({ ...prev, level: "FAKE", score: 100 }));
  };

  const cfg = result ? levelCfg[result.level] : null;
  const Icon = cfg?.icon;

  return (
    <AdminLayout title="Quick Lookup">
      <div className="max-w-xl mx-auto">

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Email or username..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm text-white flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Search size={14} />}
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Search size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-600 font-medium">Search any user</p>
            <p className="text-xs text-gray-400 mt-1">
              Try <span className="font-mono text-indigo-500">user@example.com</span>
            </p>
          </div>
        )}

        {/* Result Card */}
        {result && cfg && (
          <div className={`bg-white rounded-xl shadow-md border ${cfg.border} overflow-hidden`}>

            <div className={`h-1 ${cfg.bg}`} />

            <div className="p-5">

              {/* User Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                  {(result.user?.name || "?")[0].toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="text-base font-medium text-gray-800">{result.user?.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail size={12} />
                    {result.user?.email}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-3xl font-light ${cfg.color}`}>
                    {result.score}
                  </div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
              </div>

              {/* Verdict */}
              <div className={`flex gap-2 p-3 rounded-lg ${cfg.bg} border ${cfg.border} mb-4`}>
                <Icon size={16} className={`${cfg.color} shrink-0 mt-0.5`} />
                <div>
                  <div className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</div>
                  <div className="text-xs text-gray-500">{cfg.desc}</div>
                </div>
              </div>

              {/* Risk Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Risk score</span>
                  <span className={cfg.color}>{result.score}/100</span>
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cfg.bg}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Account Age */}
              {result.accountAgeDays !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono mb-4">
                  <Clock size={12} />
                  {Math.round(result.accountAgeDays)} days old
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={handleRerun}
                  disabled={rerunning}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50"
                >
                  <RefreshCw size={14} className={rerunning ? "animate-spin" : ""} />
                  {rerunning ? "Running…" : "Re-run"}
                </button>

                {result.level !== "FAKE" && (
                  <button
                    onClick={handleFlag}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                  >
                    <Flag size={14} />
                    Flag
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}