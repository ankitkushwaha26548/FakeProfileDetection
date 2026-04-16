import React, { useState, useRef } from "react";
import { Search, CheckCircle, AlertTriangle, XCircle, RefreshCw, Flag, Mail, Clock } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const levelCfg = {
  GENUINE: {
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    icon: CheckCircle,
    label: "Genuine account",
    desc: "No suspicious behavior detected."
  },
  SUSPICIOUS: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    icon: AlertTriangle,
    label: "Suspicious account",
    desc: "Unusual patterns require monitoring."
  },
  FAKE: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
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

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Email or username..."
              className="w-full bg-[#0e0e1a] border border-[#1e1e30] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:border-indigo-400 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-indigo-400 rounded-lg text-sm text-white flex items-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Search size={14} />}
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-6 text-center text-sm text-gray-500">
            {error}
          </div>
        )}

        {/* Empty */}
        {!result && !error && !loading && (
          <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-8 text-center">
            <Search size={28} className="mx-auto mb-3 text-gray-700" />
            <p className="text-sm text-gray-400 font-medium">Search any user</p>
            <p className="text-xs text-gray-500 mt-1">
              Try <span className="font-mono text-indigo-400">user@example.com</span>
            </p>
          </div>
        )}

        {/* Result */}
        {result && cfg && (
          <div className={`bg-[#0e0e1a] border ${cfg.border} rounded-lg overflow-hidden`}>

            <div className={`h-1 ${cfg.bg}`} />

            <div className="p-5">

              {/* User */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-[#13131f] flex items-center justify-center text-indigo-400 font-semibold">
                  {(result.user?.name || "?")[0]}
                </div>

                <div className="flex-1">
                  <div className="text-sm text-gray-200">{result.user?.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail size={11} />
                    {result.user?.email}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-3xl font-light ${cfg.color}`}>
                    {result.score}
                  </div>
                  <div className="text-xs text-gray-500">/100</div>
                </div>
              </div>

              {/* Verdict */}
              <div className={`flex gap-2 p-3 rounded-md ${cfg.bg} border ${cfg.border} mb-4`}>
                <Icon size={14} className={cfg.color} />
                <div>
                  <div className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</div>
                  <div className="text-xs text-gray-400">{cfg.desc}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Risk score</span>
                  <span className={cfg.color}>{result.score}/100</span>
                </div>

                <div className="h-1 bg-[#13131f] rounded overflow-hidden">
                  <div
                    className={`h-full ${cfg.bg}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Meta */}
              {result.accountAgeDays !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono mb-4">
                  <Clock size={11} />
                  {Math.round(result.accountAgeDays)} days old
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 border-t border-[#1e1e30] pt-3">
                <button
                  onClick={handleRerun}
                  disabled={rerunning}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md bg-indigo-400/10 border border-indigo-400/20 text-indigo-400"
                >
                  <RefreshCw size={12} className={rerunning ? "animate-spin" : ""} />
                  {rerunning ? "Running…" : "Re-run"}
                </button>

                {result.level !== "FAKE" && (
                  <button
                    onClick={handleFlag}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md bg-red-400/10 border border-red-400/20 text-red-400"
                  >
                    <Flag size={12} />
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