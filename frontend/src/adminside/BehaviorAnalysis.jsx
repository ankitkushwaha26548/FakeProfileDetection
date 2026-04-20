import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const RiskChip = ({ risk }) => {
  const cfg = {
    HIGH:   "text-red-700 bg-red-50 border-red-200",
    MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
    LOW:    "text-green-700 bg-green-50 border-green-200",
  }[risk] || "text-gray-500 bg-gray-50 border-gray-200";

  return (
    <span className={`text-[10px] font-bold font-mono tracking-widest px-2 py-0.5 rounded-full border ${cfg}`}>
      {risk}
    </span>
  );
};

const getBehaviorSignals = (activities) => {
  const sorted = [...activities].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,50);
  let rapid = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (new Date(sorted[i].createdAt) - new Date(sorted[i+1].createdAt) < 2000) rapid++;
  }
  const types = sorted.map(a => a.type);
  const dominant = types[0];
  const sameCount = types.filter(t => t === dominant).length;
  const risk = rapid >= 10 || sameCount >= 15 ? "HIGH" : rapid >= 5 ? "MEDIUM" : "LOW";
  return { total: sorted.length, rapid, risk, repetitive: sameCount >= 15, dominant, recent: sorted.slice(0,8) };
};

export default function BehaviorAnalysis() {
  const [users, setUsers]       = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([adminApi.getUsersWithRisk(), adminApi.getAllActivities()])
      .then(([u, a]) => { setUsers(u.data || []); setActivities(a.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getUserActivities = (uid) =>
    activities.filter(a => String(a.user?._id || a.user) === String(uid));

  const sel = selected ? users.find(u => String(u.user?._id) === String(selected)) : null;
  const sig = selected ? getBehaviorSignals(getUserActivities(selected)) : null;

  const actLabel = { LOGIN:"Login", POST:"Post created", LIKE_POST:"Post liked",
                     COMMENT:"Comment", REGISTER:"Registered" };

  if (loading) return (
    <AdminLayout title="Behavior Analysis">
      <div className="flex items-center justify-center h-75">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Behavior Analysis">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-120px)]">

        {/* User List Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</div>
          </div>

          <div className="overflow-auto flex-1">
            {users.map(u => {
              const sig = getBehaviorSignals(getUserActivities(u.user?._id));
              const isActive = selected === u.user?._id;

              return (
                <div
                  key={u._id}
                  onClick={() => setSelected(isActive ? null : u.user?._id)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition
                    ${isActive ? "bg-indigo-50 border-l-4 border-indigo-500" : "hover:bg-gray-50"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                    {(u.user?.name || "?")[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {u.user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sig.total} actions
                    </div>
                  </div>

                  <RiskChip risk={sig.risk} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="overflow-auto">
          {!selected && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center h-75 gap-3">
              <Activity size={32} className="text-gray-300" />
              <p className="text-sm text-gray-400">
                Select a user to view behavior signals
              </p>
            </div>
          )}

          {selected && sig && sel && (
            <div className="flex flex-col gap-4">

              {/* User Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-semibold text-indigo-700">
                  {(sel.user?.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-800">{sel.user?.name}</div>
                  <div className="text-sm text-gray-500">{sel.user?.email}</div>
                </div>
                <RiskChip risk={sig.risk} />
              </div>

              {/* Signal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total actions", value: sig.total, alert: false },
                  { label: "Rapid actions", value: sig.rapid, alert: sig.risk !== "LOW" },
                  { label: "Repetitive pattern", value: sig.repetitive ? "Yes" : "No", alert: sig.repetitive },
                ].map(card => (
                  <div
                    key={card.label}
                    className={`rounded-xl p-4 border ${
                      card.alert
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {card.label}
                    </div>
                    <div className={`text-2xl font-light ${
                      card.alert ? "text-red-600" : "text-gray-800"
                    }`}>
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict */}
              <div className={`rounded-xl p-5 flex gap-4 border ${
                sig.risk === "HIGH"
                  ? "border-red-200 bg-red-50"
                  : sig.risk === "MEDIUM"
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
              }`}>
                {sig.risk === "HIGH"
                  ? <XCircle className="text-red-600 mt-0.5" size={18} />
                  : sig.risk === "MEDIUM"
                  ? <AlertTriangle className="text-amber-600 mt-0.5" size={18} />
                  : <CheckCircle className="text-green-600 mt-0.5" size={18} />
                }

                <div>
                  <div className={`text-base font-semibold mb-1 ${
                    sig.risk === "HIGH"
                      ? "text-red-700"
                      : sig.risk === "MEDIUM"
                      ? "text-amber-700"
                      : "text-green-700"
                  }`}>
                    {sig.risk === "HIGH"
                      ? "Bot-like behavior detected"
                      : sig.risk === "MEDIUM"
                      ? "Some rapid actions detected"
                      : "Normal behavior pattern"}
                  </div>

                  <div className="text-sm text-gray-600 leading-relaxed">
                    {sig.rapid} rapid actions in last 50 logged.
                    {sig.repetitive && ` Dominant action: ${sig.dominant}.`}
                    {sig.risk === "LOW" && " No anomalies found."}
                  </div>
                </div>
              </div>

              {/* Recent Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent actions
                  </span>
                </div>

                {sig.recent.length === 0 && (
                  <p className="text-sm text-gray-400">No activity recorded.</p>
                )}

                <div className="divide-y divide-gray-100">
                  {sig.recent.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="text-gray-700">{actLabel[a.type] || a.type}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}