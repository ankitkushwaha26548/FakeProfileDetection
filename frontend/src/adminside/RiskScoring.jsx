import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

/* Score Bar (light theme) */
const ScoreBar = ({ score, level }) => {
  const getColor = () => {
    if (level === "FAKE") return "bg-red-500";
    if (level === "SUSPICIOUS") return "bg-amber-500";
    if (level === "GENUINE") return "bg-green-500";
    if (score >= 60) return "bg-red-500";
    if (score >= 30) return "bg-amber-500";
    return "bg-green-500";
  };

  const barColor = getColor();
  const textColor = barColor.replace("bg-", "text-");

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(score || 0, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-6 text-right ${textColor}`}>
        {score ?? 0}
      </span>
    </div>
  );
};

/* Risk Badge (light theme) */
const RiskBadge = ({ level }) => {
  const cfg = {
    GENUINE: "text-green-700 bg-green-50 border-green-200",
    SUSPICIOUS: "text-amber-700 bg-amber-50 border-amber-200",
    FAKE: "text-red-700 bg-red-50 border-red-200",
  }[level] || "text-gray-500 bg-gray-50 border-gray-200";

  return (
    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border ${cfg}`}>
      {level}
    </span>
  );
};

export default function RiskScoring() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("score_desc");

  useEffect(() => {
    adminApi.getUsersWithRisk()
      .then(r => setUsers(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...users]
    .filter(u => filter === "ALL" || u.level === filter)
    .sort((a, b) => {
      if (sort === "score_desc") return (b.score || 0) - (a.score || 0);
      if (sort === "score_asc") return (a.score || 0) - (b.score || 0);
      return (a.user?.name || "").localeCompare(b.user?.name || "");
    });

  if (loading) {
    return (
      <AdminLayout title="Risk Scoring">
        <div className="flex justify-center items-center h-75">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Risk Scoring">

      {/* Legend Cards – darker backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { range: "0 – 29", level: "GENUINE", color: "text-green-800", bg: "bg-green-100", desc: "Normal activity." },
          { range: "30 – 59", level: "SUSPICIOUS", color: "text-amber-800", bg: "bg-amber-100", desc: "Unusual patterns." },
          { range: "60 – 100", level: "FAKE", color: "text-red-800", bg: "bg-red-100", desc: "Multiple triggers." },
        ].map(t => (
          <div key={t.level} className={`${t.bg} border border-gray-300 rounded-xl p-3`}>
            <div className="flex justify-between mb-1">
              <span className={`text-xs font-semibold ${t.color}`}>{t.level}</span>
              <span className="text-[10px] text-gray-600 font-mono">{t.range}</span>
            </div>
            <p className="text-[11px] text-gray-700">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between flex-wrap gap-3 mb-4">
        <div className="flex gap-1">
          {["ALL", "GENUINE", "SUSPICIOUS", "FAKE"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-white border border-gray-200 text-sm text-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="score_desc">High → Low</option>
          <option value="score_asc">Low → High</option>
          <option value="name">Name A → Z</option>
        </select>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {sorted.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            No users found.
          </div>
        )}

        {sorted.map((u, i) => (
          <div key={i} className="border-b border-gray-100">

            {/* Row */}
            <div
              onClick={() => setExpanded(expanded === u._id ? null : u._id)}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition ${
                expanded === u._id ? "bg-indigo-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                {(u.user?.name || "?")[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{u.user?.name}</div>
                <div className="text-xs text-gray-500">{u.user?.email}</div>
              </div>

              <div className="w-40 flex">
                <ScoreBar score={u.score} level={u.level} />
              </div>

              <RiskBadge level={u.level} />

              {expanded === u._id
                ? <ChevronUp size={14} className="text-gray-400" />
                : <ChevronDown size={14} className="text-gray-400" />}
            </div>

            {/* Expanded Details */}
            {expanded === u._id && (
              <div className="pl-16 pr-5 pb-4 border-t border-gray-100">

                <div className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-3 mb-3">
                  Detection breakdown
                </div>

                <div className="space-y-2">
                  {Array.isArray(u.reasons) && u.reasons.length > 0 ? (
                    u.reasons.map((r, j) => {
                      // Identify if reason is a risk indicator
                      const riskKeywords = [
                        "Multiple", "Rapid", "No activity", "Incomplete", "High activity", 
                        "Bot", "Suspicious", "Unusual", "Inactive", "Frequent", "different IPs",
                        "IP risk", "IP changes", "combo", "New account"
                      ];
                      
                      const isRisk = riskKeywords.some(keyword => r.includes(keyword));
                      const bgColor = isRisk ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
                      const textColor = isRisk ? "text-red-700" : "text-green-700";
                      const icon = isRisk ? "⚠" : "✓";
                      
                      return (
                        <div key={j} className={`p-2.5 text-xs rounded-lg border ${bgColor} ${textColor} flex items-start gap-2`}>
                          <span className="shrink-0 mt-0.5">{icon}</span>
                          <span>{r}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                      No detection details available
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  {u.accountAgeDays !== undefined && (
                    <div className="text-xs text-gray-600 flex justify-between">
                      <span className="font-medium text-gray-700">Account Age:</span>
                      <span className="font-mono">{Math.round(u.accountAgeDays)} days</span>
                    </div>
                  )}
                  {u.confidence !== undefined && (
                    <div className="text-xs text-gray-600 flex justify-between">
                      <span className="font-medium text-gray-700">Confidence:</span>
                      <span className="font-mono">{Math.round(u.confidence)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </AdminLayout>
  );
}