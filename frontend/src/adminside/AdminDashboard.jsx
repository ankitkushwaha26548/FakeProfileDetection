import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Globe, Shield, Search, Eye, Flag } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const RiskBadge = ({ level }) => {
  const styles = {
    GENUINE: "text-green-400 bg-green-400/10 border-green-400/30",
    SUSPICIOUS: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    FAKE: "text-red-400 bg-red-400/10 border-red-400/30",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles[level] || "text-gray-400 border-[#1e1e30]"}`}>
      {level}
    </span>
  );
};

const ScoreBar = ({ score, level }) => {
  const col =
    level === "FAKE" ? "bg-red-400"
    : level === "SUSPICIOUS" ? "bg-yellow-400"
    : "bg-green-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-0.75 bg-[#1e1e30] rounded overflow-hidden">
        <div className={`h-full ${col}`} style={{ width: `${Math.min(score,100)}%` }} />
      </div>
      <span className="text-xs w-5 text-right text-gray-400">{score ?? 0}</span>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [flagging, setFlagging] = useState(null);

  useEffect(() => {
    Promise.all([adminApi.getDashboardStats(), adminApi.getUsersWithRisk()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const handleFlag = async (userId, name) => {
    if (!window.confirm(`Flag ${name} as FAKE?`)) return;
    setFlagging(userId);
    await adminApi.flagUser(userId);
    setUsers(prev => prev.map(u =>
      u.user?._id === userId ? { ...u, level:"FAKE", score:100 } : u
    ));
    setFlagging(null);
  };

  const filtered = filter === "ALL" ? users : users.filter(u => u.level === filter);
  const alerts = users.filter(u => u.level !== "GENUINE").slice(0, 4);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-center h-75">
        <div className="text-center">
          <div className="w-8 h-8 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#44445a]">Loading...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Dashboard">

      {/* Stats */}
      <div className="grid gap-3 mb-6 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
        {[
          { label:"Total users", value:stats?.totalUsers ?? 0, col:"text-indigo-400" },
          { label:"Genuine", value:stats?.genuine ?? 0, col:"text-green-400" },
          { label:"Suspicious", value:stats?.suspicious ?? 0, col:"text-yellow-400" },
          { label:"Fake", value:stats?.fake ?? 0, col:"text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-4">
            <div className="text-xs text-[#44445a] mb-2">{s.label}</div>
            <div className={`text-3xl font-light ${s.col}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-[1fr_300px] gap-4 mb-6">

        {/* Risk distribution */}
        <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-4">
          <div className="text-xs text-[#44445a] mb-3">Risk distribution</div>
          {[
            { label:"Genuine", pct: stats?.totalUsers ? Math.round((stats.genuine/stats.totalUsers)*100) : 0, col:"bg-green-400" },
            { label:"Suspicious", pct: stats?.totalUsers ? Math.round((stats.suspicious/stats.totalUsers)*100) : 0, col:"bg-yellow-400" },
            { label:"Fake", pct: stats?.totalUsers ? Math.round((stats.fake/stats.totalUsers)*100) : 0, col:"bg-red-400" },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-2 mb-2">
              <div className="w-16 text-xs text-[#8a8a9e]">{r.label}</div>
              <div className="flex-1 h-1 bg-[#1e1e30] rounded overflow-hidden">
                <div className={`h-full ${r.col}`} style={{ width:`${r.pct}%` }} />
              </div>
              <div className="text-xs text-gray-400 w-8 text-right">{r.pct}%</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-4">
          <div className="text-xs text-[#44445a] mb-3">Recent alerts</div>
          {alerts.length === 0 && <p className="text-xs text-[#44445a]">No alerts</p>}
          {alerts.map((u, i) => {
            const isFake = u.level === "FAKE";
            return (
              <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded text-xs mb-1
                ${isFake ? "bg-red-400/10 text-red-400 border border-red-400/20"
                         : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                <span className="truncate flex-1">
                  {isFake ? "Flagged FAKE" : "Suspicious"} — {u.user?.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid gap-2 mb-6 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
        {[
          { to:"/admin/behavior", icon:Activity, label:"Behavior" },
          { to:"/admin/ip-monitoring", icon:Globe, label:"IP Monitor" },
          { to:"/admin/risk", icon:Shield, label:"Risk Scoring" },
          { to:"/admin/lookup", icon:Search, label:"Quick Lookup" },
        ].map(({ to, icon:Icon, label }) => (
          <Link key={to} to={to}
            className="flex items-center gap-2 px-3 py-2 bg-[#0e0e1a] border border-[#1e1e30]
                       rounded-md text-sm text-[#8a8a9e] hover:text-white hover:border-[#2e2e46] transition">
            <Icon size={14} className="text-indigo-400" />
            {label}
          </Link>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1e1e30] flex-wrap gap-2">
          <span className="text-sm text-[#e4e4ec]">All users</span>

          <div className="flex gap-1">
            {["ALL","GENUINE","SUSPICIOUS","FAKE"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded border transition
                  ${filter===f
                    ? "bg-indigo-400 text-white border-indigo-400"
                    : "text-[#44445a] border-[#1e1e30]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-[#44445a]">No users found.</div>
        )}

        {filtered.map((u, i) => (
          <div key={u._id || i}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#13131f] hover:bg-[#0f0f1c]">

            <div className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center text-xs text-indigo-400 font-semibold">
              {(u.user?.name || "?")[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#e4e4ec] truncate">{u.user?.name}</div>
              <div className="text-xs text-[#44445a] truncate">{u.user?.email}</div>
            </div>

            <div className="hidden md:block w-28">
              <ScoreBar score={u.score ?? 0} level={u.level} />
            </div>

            <RiskBadge level={u.level} />

            <div className="flex gap-1">
              <Link to="/admin/risk" className="p-1 text-[#44445a] hover:text-indigo-400">
                <Eye size={14} />
              </Link>

              {u.level !== "FAKE" && (
                <button
                  onClick={() => handleFlag(u.user?._id, u.user?.name)}
                  disabled={flagging === u.user?._id}
                  className="p-1 text-[#44445a] hover:text-red-400"
                >
                  <Flag size={14} />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </AdminLayout>
  );
}