import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, AlertTriangle, XCircle, CheckCircle,
  Activity, Shield, TrendingUp, Eye, Flag
} from "lucide-react";
import * as adminApi from "../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flagging, setFlagging] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getUsersWithRisk(),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Admin load error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFlag = async (userId) => {
    if (!window.confirm("Flag this user as FAKE?")) return;
    setFlagging(userId);
    try {
      await adminApi.flagUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.user?._id === userId ? { ...u, level: "FAKE", score: 100 } : u
        )
      );
    } catch (err) {
      alert("Failed to flag user.");
    } finally {
      setFlagging(null);
    }
  };

  const filtered = filter === "ALL" ? users : users.filter((u) => u.level === filter);

  const getLevelStyle = (level) => {
    if (level === "FAKE") return "bg-red-100 text-red-700 border border-red-200";
    if (level === "SUSPICIOUS") return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    return "bg-green-100 text-green-700 border border-green-200";
  };

  const getLevelIcon = (level) => {
    if (level === "FAKE") return <XCircle className="w-3 h-3" />;
    if (level === "SUSPICIOUS") return <AlertTriangle className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-white">FakeDetect</span>
          <span className="text-gray-600 text-sm">/</span>
          <span className="text-gray-400 text-sm">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/admin/behavior" className="text-gray-400 hover:text-white transition-colors">Behavior</Link>
          <Link to="/admin/ip-monitoring" className="text-gray-400 hover:text-white transition-colors">IP Monitor</Link>
          <Link to="/admin/risk" className="text-gray-400 hover:text-white transition-colors">Risk Scoring</Link>
          <Link to="/socialfeed" className="px-3 py-1 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            User Side
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5 text-indigo-400" />} label="Total Users" value={stats?.totalUsers ?? 0} color="indigo" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-green-400" />} label="Genuine" value={stats?.genuine ?? 0} color="green" />
          <StatCard icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />} label="Suspicious" value={stats?.suspicious ?? 0} color="yellow" />
          <StatCard icon={<XCircle className="w-5 h-5 text-red-400" />} label="Fake" value={stats?.fake ?? 0} color="red" />
        </div>

        {/* Quick nav cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <NavCard to="/admin/behavior" icon={<Activity className="w-5 h-5 text-purple-400" />} title="Behavior Analysis" desc="Rapid actions, repetitive patterns, anomaly logs" color="purple" />
          <NavCard to="/admin/ip-monitoring" icon={<TrendingUp className="w-5 h-5 text-blue-400" />} title="IP Monitoring" desc="Login location changes, device switching" color="blue" />
          <NavCard to="/admin/risk" icon={<Shield className="w-5 h-5 text-orange-400" />} title="Risk Scoring" desc="Score breakdown per user, detection reasons" color="orange" />
        </div>

        {/* User Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-semibold text-white">All Users</h2>
            <div className="flex gap-2">
              {["ALL", "GENUINE", "SUSPICIOUS", "FAKE"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-800">
            {filtered.length === 0 && (
              <p className="text-center text-gray-600 py-10 text-sm">No users found.</p>
            )}
            {filtered.map((u, i) => (
              <div key={u._id || i} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.user?.name || 'U')}&background=312e81&color=fff`}
                  alt={u.user?.name}
                  className="w-9 h-9 rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.user?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500 truncate">{u.user?.email || ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Risk score bar */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          u.level === "FAKE" ? "bg-red-500" :
                          u.level === "SUSPICIOUS" ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(u.score || 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{u.score ?? 0}</span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${getLevelStyle(u.level)}`}>
                    {getLevelIcon(u.level)}
                    {u.level}
                  </span>

                  <Link
                    to={`/admin/user/${u.user?._id}`}
                    className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {u.level !== "FAKE" && (
                    <button
                      onClick={() => handleFlag(u.user?._id)}
                      disabled={flagging === u.user?._id}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40"
                      title="Flag as fake"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    indigo: "border-indigo-800/50 bg-indigo-950/30",
    green: "border-green-800/50 bg-green-950/30",
    yellow: "border-yellow-800/50 bg-yellow-950/30",
    red: "border-red-800/50 bg-red-950/30",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-400">{label}</span></div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function NavCard({ to, icon, title, desc, color }) {
  const colors = {
    purple: "border-purple-800/40 hover:border-purple-500/60 hover:bg-purple-950/20",
    blue: "border-blue-800/40 hover:border-blue-500/60 hover:bg-blue-950/20",
    orange: "border-orange-800/40 hover:border-orange-500/60 hover:bg-orange-950/20",
  };
  return (
    <Link to={to} className={`block rounded-xl border p-5 bg-gray-900 transition-all ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="font-semibold text-sm text-white">{title}</span></div>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      <p className={`text-xs mt-3 font-medium ${
        color === 'purple' ? 'text-purple-500' : color === 'blue' ? 'text-blue-500' : 'text-orange-500'
      }`}>Open →</p>
    </Link>
  );
}
