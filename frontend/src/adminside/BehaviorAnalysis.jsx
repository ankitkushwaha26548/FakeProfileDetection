import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, ArrowLeft, Zap } from "lucide-react";
import * as adminApi from "../api/adminApi";

export default function BehaviorAnalysis() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected userId for drill-down

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, activitiesRes] = await Promise.all([
          adminApi.getUsersWithRisk(),
          adminApi.getAllActivities(),
        ]);
        setUsers(usersRes.data || []);
        setActivities(activitiesRes.data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // For each user, calculate behavior signals from their activities
  const getBehaviorSignals = (userId) => {
    const userActivities = activities
      .filter((a) => String(a.user?._id || a.user) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    let rapidActions = 0;
    for (let i = 0; i < userActivities.length - 1; i++) {
      const diff = new Date(userActivities[i].createdAt) - new Date(userActivities[i + 1].createdAt);
      if (diff < 2000) rapidActions++;
    }

    const types = userActivities.map((a) => a.type);
    const sameActions = types.filter((t) => t === types[0]).length;
    const repetitive = sameActions >= 10;

    const rapidRisk = rapidActions >= 10 ? "HIGH" : rapidActions >= 5 ? "MEDIUM" : "LOW";

    return {
      totalActions: userActivities.length,
      rapidActions,
      rapidRisk,
      repetitive,
      dominantAction: types[0] || "N/A",
      recentActions: userActivities.slice(0, 5),
    };
  };

  const getRiskBadge = (risk) => {
    if (risk === "HIGH") return "bg-red-900/60 text-red-300 border border-red-700";
    if (risk === "MEDIUM") return "bg-yellow-900/60 text-yellow-300 border border-yellow-700";
    return "bg-green-900/60 text-green-300 border border-green-700";
  };

  const selectedUser = selected ? users.find((u) => String(u.user?._id) === String(selected)) : null;
  const selectedSignals = selected ? getBehaviorSignals(selected) : null;

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
        <span className="text-white font-semibold text-sm">Behavior Analysis</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* User list */}
          <div className="lg:col-span-1 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Users — Behavior Risk
              </h2>
            </div>
            <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
              {users.map((u) => {
                const signals = getBehaviorSignals(u.user?._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => setSelected(selected === u.user?._id ? null : u.user?._id)}
                    className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${
                      selected === u.user?._id ? "bg-indigo-900/30" : "hover:bg-gray-800/60"
                    }`}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.user?.name || 'U')}&background=312e81&color=fff`}
                      alt=""
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.user?.name}</p>
                      <p className="text-xs text-gray-500">{signals.totalActions} actions</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getRiskBadge(signals.rapidRisk)}`}>
                      {signals.rapidRisk}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 space-y-5">
            {!selected && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Select a user to view behavior signals</p>
                </div>
              </div>
            )}

            {selected && selectedSignals && (
              <>
                {/* Behavior summary */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.user?.name || 'U')}&background=312e81&color=fff`}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-white">{selectedUser?.user?.name}</p>
                      <p className="text-xs text-gray-500">{selectedUser?.user?.email}</p>
                    </div>
                    <span className={`ml-auto text-xs px-2.5 py-1 rounded-lg font-bold border ${
                      selectedUser?.level === 'FAKE' ? 'bg-red-900/40 text-red-300 border-red-700' :
                      selectedUser?.level === 'SUSPICIOUS' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700' :
                      'bg-green-900/40 text-green-300 border-green-700'
                    }`}>
                      {selectedUser?.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <SignalCard label="Total actions" value={selectedSignals.totalActions} />
                    <SignalCard
                      label="Rapid actions"
                      value={selectedSignals.rapidActions}
                      alert={selectedSignals.rapidRisk !== "LOW"}
                    />
                    <SignalCard
                      label="Repetitive pattern"
                      value={selectedSignals.repetitive ? "Yes" : "No"}
                      alert={selectedSignals.repetitive}
                    />
                  </div>

                  {/* Behavior verdict */}
                  <div className={`mt-5 rounded-xl p-4 border ${
                    selectedSignals.rapidRisk === "HIGH"
                      ? "bg-red-950/30 border-red-800/40"
                      : selectedSignals.rapidRisk === "MEDIUM"
                      ? "bg-yellow-950/30 border-yellow-800/40"
                      : "bg-green-950/30 border-green-800/40"
                  }`}>
                    <div className="flex items-start gap-2">
                      {selectedSignals.rapidRisk === "HIGH"
                        ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        : selectedSignals.rapidRisk === "MEDIUM"
                        ? <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                        : <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      }
                      <div>
                        <p className={`text-sm font-semibold ${
                          selectedSignals.rapidRisk === "HIGH" ? "text-red-300" :
                          selectedSignals.rapidRisk === "MEDIUM" ? "text-yellow-300" : "text-green-300"
                        }`}>
                          {selectedSignals.rapidRisk === "HIGH"
                            ? "Bot-like behavior detected"
                            : selectedSignals.rapidRisk === "MEDIUM"
                            ? "Some rapid actions detected"
                            : "Normal behavior pattern"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedSignals.rapidActions} actions within 2-second windows out of last 50 logged.
                          {selectedSignals.repetitive && ` Dominant action: ${selectedSignals.dominantAction}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent actions */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Recent Actions
                  </h3>
                  <div className="space-y-2">
                    {selectedSignals.recentActions.length === 0 && (
                      <p className="text-gray-600 text-sm">No recent actions.</p>
                    )}
                    {selectedSignals.recentActions.map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                          <span className="text-sm text-gray-300">{a.type}</span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalCard({ label, value, alert }) {
  return (
    <div className={`rounded-xl p-4 border ${alert ? "border-red-800/40 bg-red-950/20" : "border-gray-700 bg-gray-800/40"}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${alert ? "text-red-300" : "text-white"}`}>{value}</p>
    </div>
  );
}
