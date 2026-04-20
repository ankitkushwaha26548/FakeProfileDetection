import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Globe, Shield, Search, Eye, Flag, ShieldOff, CheckCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

/* Vibrant Badges - Using the 800/100/200 palette */
const RiskBadge = ({ level }) => {
  const styles = {
    GENUINE: "text-green-800 bg-green-100 border-green-200",
    SUSPICIOUS: "text-amber-800 bg-amber-100 border-amber-200",
    FAKE: "text-red-800 bg-red-100 border-red-200",
  };
  return (
    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border ${styles[level] || "text-gray-500 bg-gray-50 border-gray-200"}`}>
      {level}
    </span>
  );
};

const ScoreBar = ({ score, level }) => {
  const col =
    level === "FAKE" ? "bg-red-500"
    : level === "SUSPICIOUS" ? "bg-amber-500"
    : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${col} rounded-full transition-all duration-500`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-8 text-right">{score ?? 0}</span>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [flagging, setFlagging] = useState(null);
  const [blocking, setBlocking] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState("Fake account detected");

  useEffect(() => {
    Promise.all([adminApi.getDashboardStats(), adminApi.getUsersWithRisk()])
      .then(([s, u]) => { 
        setStats(s.data); 
        setUsers(u.data || []); 
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFlag = async (userId, name) => {
    if (!window.confirm(`Flag ${name} as FAKE?`)) return;
    setFlagging(userId);
    await adminApi.flagUser(userId);
    setUsers(prev => prev.map(u => u.user?._id === userId ? { ...u, level: "FAKE", score: 100 } : u));
    setFlagging(null);
  };

  const handleBlockClick = (user) => {
    setShowBlockModal(user);
    setBlockReason("Fake account detected");
  };

  const confirmBlock = async () => {
    if (!showBlockModal) return;
    setBlocking(showBlockModal.user?._id);
    try {
      await adminApi.blockUser(showBlockModal.user?._id, blockReason);
      setUsers(prev => prev.map(u =>
        u.user?._id === showBlockModal.user?._id
          ? { ...u, level: "FAKE", score: 100, user: { ...u.user, isBlocked: true } }
          : u
      ));
      setShowBlockModal(null);
    } catch (error) {
      alert("Failed to block user");
    } finally {
      setBlocking(null);
    }
  };

  const handleUnblock = async (userId) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    setBlocking(userId);
    try {
      await adminApi.unblockUser(userId);
      setUsers(prev => prev.map(u => u.user?._id === userId ? { ...u, user: { ...u.user, isBlocked: false } } : u));
    } catch (error) {
      alert("Failed to unblock user");
    } finally {
      setBlocking(null);
    }
  };

  const filtered = filter === "ALL" ? users : users.filter(u => u.level === filter);
  const alerts = users.filter(u => u.level !== "GENUINE").slice(0, 4);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-center h-75">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Dashboard">
      {/* 1. Status Grid - All in one line */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats?.totalUsers ?? 0, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100" },
          { label: "Genuine", value: stats?.genuine ?? 0, color: "text-green-800", bg: "bg-green-100 border-green-200" },
          { label: "Suspicious", value: stats?.suspicious ?? 0, color: "text-amber-800", bg: "bg-amber-100 border-amber-200" },
          { label: "Fake", value: stats?.fake ?? 0, color: "text-red-800", bg: "bg-red-100 border-red-200" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-3 shadow-sm transition-transform hover:scale-[1.02] flex flex-col justify-center`}>
            <div className={`text-[9px] font-bold uppercase tracking-tight mb-0.5 ${s.color} opacity-70 truncate`}>{s.label}</div>
            <div className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</div>    
          </div>
        ))}
      
      {/* 4. Recent Alerts Card - Side Positioned */}
        <div className="w-full lg:w-72 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Recent alerts</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
          </div>
          {alerts.map((u, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold mb-2 last:mb-0 border ${u.level === "FAKE" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
              <div className="w-1 h-1 rounded-full bg-current"></div>
              <span className="truncate flex-1">{u.level} — {u.user?.name}</span>
            </div>
          ))}
          {alerts.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">System clear</p>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          {/* 2. Quick Navigation - White/Bordered */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-6">
            {[
              { to: "/admin/behavior", icon: Activity, label: "Behavior" },
              { to: "/admin/ip-monitoring", icon: Globe, label: "IP Monitor" },
              { to: "/admin/risk", icon: Shield, label: "Risk Scoring" },
              { to: "/admin/lookup", icon: Search, label: "Lookup" },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to} to={to}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
              >
                <Icon size={14} className="text-indigo-500" />
                <span className="font-semibold">{label}</span>
              </Link>
            ))}
          </div>

          {/* 3. Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Monitoring</span>
              <div className="flex gap-1">
                {["ALL", "GENUINE", "SUSPICIOUS", "FAKE"].map(f => (
                  <button
                    key={f} onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-full transition ${filter === f ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filtered.map((u, i) => (
              <div key={u._id || i} className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                  {(u.user?.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 truncate">{u.user?.name}</div>
                    {u.user?.isBlocked && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">Blocked</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{u.user?.email}</div>
                </div>
                <div className="hidden md:block w-24">
                  <ScoreBar score={u.score ?? 0} level={u.level} />
                </div>
                <RiskBadge level={u.level} />
                <div className="flex items-center gap-1">
                  <Link to="/admin/risk" className="p-1.5 text-gray-300 hover:text-indigo-500 transition"><Eye size={14} /></Link>
                  {!u.user?.isBlocked ? (
                    <button onClick={() => handleBlockClick(u)} className="p-1.5 text-gray-300 hover:text-red-500 transition"><ShieldOff size={14} /></button>
                  ) : (
                    <button onClick={() => handleUnblock(u.user._id)} className="p-1.5 text-gray-300 hover:text-green-500 transition"><CheckCircle size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

    </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Block User</h2>
            <p className="text-sm text-gray-500 mb-4">{showBlockModal.user?.name}</p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
            />
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowBlockModal(null)} className="flex-1 rounded-full border border-gray-300 py-2 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={confirmBlock} className="flex-1 rounded-full bg-red-600 text-white py-2 text-sm font-bold hover:bg-red-700">Confirm Block</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}