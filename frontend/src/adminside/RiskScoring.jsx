import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

/* Score Bar */
const ScoreBar = ({ score, level }) => {
  const col =
    level === "FAKE" ? "bg-red-400 text-red-400"
    : level === "SUSPICIOUS" ? "bg-yellow-400 text-yellow-400"
    : level === "GENUINE" ? "bg-green-400 text-green-400"
    : score >= 60 ? "bg-red-400 text-red-400"
    : score >= 30 ? "bg-yellow-400 text-yellow-400"
    : "bg-green-400 text-green-400";

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-0.75 bg-[#1e1e30] rounded overflow-hidden">
        <div
          className={`h-full ${col.split(" ")[0]} transition-all duration-500`}
          style={{ width: `${Math.min(score || 0, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-6 text-right ${col.split(" ")[1]}`}>
        {score ?? 0}
      </span>
    </div>
  );
};

/* Risk Badge */
const RiskBadge = ({ level }) => {
  const cfg = {
    GENUINE: "text-green-400 bg-green-400/10 border-green-400/20",
    SUSPICIOUS: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    FAKE: "text-red-400 bg-red-400/10 border-red-400/20",
  }[level] || "text-gray-400 border-[#1e1e30]";

  return (
    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded border ${cfg}`}>
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
          <div className="w-7 h-7 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Risk Scoring">

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { range:"0 – 29", level:"GENUINE", col:"text-green-400", desc:"Normal activity." },
          { range:"30 – 59", level:"SUSPICIOUS", col:"text-yellow-400", desc:"Unusual patterns." },
          { range:"60 – 100", level:"FAKE", col:"text-red-400", desc:"Multiple triggers." },
        ].map(t => (
          <div key={t.level} className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-3">
            <div className="flex justify-between mb-1">
              <span className={`text-xs font-semibold ${t.col}`}>{t.level}</span>
              <span className="text-[10px] text-gray-500 font-mono">{t.range}</span>
            </div>
            <p className="text-[11px] text-gray-500">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          {["ALL","GENUINE","SUSPICIOUS","FAKE"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs font-semibold rounded border transition
              ${filter===f
                ? "bg-indigo-400 text-white border-indigo-400"
                : "text-gray-500 border-[#1e1e30]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-[#0e0e1a] border border-[#1e1e30] text-xs text-gray-400 rounded px-2 py-1"
        >
          <option value="score_desc">High → Low</option>
          <option value="score_asc">Low → High</option>
          <option value="name">Name A → Z</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg overflow-hidden">
        {sorted.length === 0 && (
          <div className="p-10 text-center text-gray-500 text-sm">
            No users found.
          </div>
        )}

        {sorted.map((u, i) => (
          <div key={i} className="border-b border-[#0d0d18]">

            {/* Row */}
            <div
              onClick={() => setExpanded(expanded === u._id ? null : u._id)}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition
              ${expanded === u._id ? "bg-[#0f0f1c]" : "hover:bg-[#0c0c17]"}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center text-indigo-400 text-xs font-semibold">
                {(u.user?.name || "?")[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200">{u.user?.name}</div>
                <div className="text-xs text-gray-500">{u.user?.email}</div>
              </div>

              <div className="w-40 flex">
                <ScoreBar score={u.score} level={u.level} />
              </div>

              <RiskBadge level={u.level} />

              {expanded === u._id
                ? <ChevronUp size={14} className="text-gray-500" />
                : <ChevronDown size={14} className="text-gray-500" />}
            </div>

            {/* Expanded */}
            {expanded === u._id && (
              <div className="pl-16 pr-5 pb-4 border-t border-[#0d0d18]">

                <div className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-3 mb-2">
                  Detection breakdown
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
                  {(u.reasons || []).map((r, j) => (
                    <div key={j} className="p-2 text-xs rounded bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400/30">
                      {r}
                    </div>
                  ))}
                </div>

                {u.accountAgeDays !== undefined && (
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {Math.round(u.accountAgeDays)} days old
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

    </AdminLayout>
  );
}