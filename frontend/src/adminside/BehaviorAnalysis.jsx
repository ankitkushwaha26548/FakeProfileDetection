import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const RiskChip = ({ risk }) => {
  const cfg = {
    HIGH:   "text-red-400 bg-red-500/10 border-red-500/20",
    MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    LOW:    "text-green-400 bg-green-500/10 border-green-500/20",
  }[risk] || "text-gray-400 border border-[#1e1e30]";

  return (
    <span className={`text-[10px] font-bold font-mono tracking-widest px-2 py-0.5 rounded border ${cfg}`}>
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
        <div className="w-7 h-7 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Behavior Analysis">
      <div className="grid grid-cols-[240px_1fr] gap-4 h-[calc(100vh-120px)]">

        {/* User list */}
        <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#1e1e30]">
            <div className="text-[11px] text-[#44445a] font-medium tracking-wide">USERS</div>
          </div>

          <div className="overflow-auto flex-1">
            {users.map(u => {
              const sig = getBehaviorSignals(getUserActivities(u.user?._id));
              const isActive = selected === u.user?._id;

              return (
                <div
                  key={u._id}
                  onClick={() => setSelected(isActive ? null : u.user?._id)}
                  className={`flex items-center gap-3 px-4 py-2 border-b border-[#13131f] cursor-pointer transition
                    ${isActive ? "bg-[#13132a] border-l-2 border-indigo-400" : "hover:bg-[#0f0f1c]"}`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#13131f] flex items-center justify-center text-[11px] font-semibold text-indigo-400">
                    {(u.user?.name || "?")[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#e4e4ec] truncate">
                      {u.user?.name}
                    </div>
                    <div className="text-[11px] text-[#44445a]">
                      {sig.total} actions
                    </div>
                  </div>

                  <RiskChip risk={sig.risk} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="overflow-auto">
          {!selected && (
            <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg flex flex-col items-center justify-center h-75 gap-3">
              <Activity size={32} className="text-[#1e1e30]" />
              <p className="text-sm text-[#44445a]">
                Select a user to view behavior signals
              </p>
            </div>
          )}

          {selected && sig && sel && (
            <div className="flex flex-col gap-3">

              {/* Header */}
              <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#13131f] flex items-center justify-center text-sm font-semibold text-indigo-400">
                  {(sel.user?.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#e4e4ec]">{sel.user?.name}</div>
                  <div className="text-xs text-[#44445a]">{sel.user?.email}</div>
                </div>
                <RiskChip risk={sig.risk} />
              </div>

              {/* Signal cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Total actions", value:sig.total, alert:false },
                  { label:"Rapid actions", value:sig.rapid, alert:sig.risk !== "LOW" },
                  { label:"Repetitive pattern", value:sig.repetitive ? "Yes" : "No", alert:sig.repetitive },
                ].map(card => (
                  <div key={card.label}
                    className={`rounded-lg p-4 border ${
                      card.alert
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-[#0e0e1a] border-[#1e1e30]"
                    }`}>
                    <div className="text-xs text-[#44445a] mb-1">{card.label}</div>
                    <div className={`text-xl font-light ${
                      card.alert ? "text-red-400" : "text-[#e4e4ec]"
                    }`}>
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict */}
              <div className={`rounded-lg p-4 flex gap-3 border ${
                sig.risk === "HIGH"
                  ? "border-red-500/20"
                  : sig.risk === "MEDIUM"
                  ? "border-yellow-500/20"
                  : "border-[#1e1e30]"
              }`}>
                {sig.risk === "HIGH"
                  ? <XCircle className="text-red-400 mt-1" size={16} />
                  : sig.risk === "MEDIUM"
                  ? <AlertTriangle className="text-yellow-400 mt-1" size={16} />
                  : <CheckCircle className="text-green-400 mt-1" size={16} />
                }

                <div>
                  <div className={`text-sm font-medium mb-1 ${
                    sig.risk === "HIGH"
                      ? "text-red-400"
                      : sig.risk === "MEDIUM"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}>
                    {sig.risk === "HIGH"
                      ? "Bot-like behavior detected"
                      : sig.risk === "MEDIUM"
                      ? "Some rapid actions detected"
                      : "Normal behavior pattern"}
                  </div>

                  <div className="text-xs text-[#44445a] leading-relaxed">
                    {sig.rapid} rapid actions in last 50 logged.
                    {sig.repetitive && ` Dominant action: ${sig.dominant}.`}
                    {sig.risk === "LOW" && " No anomalies found."}
                  </div>
                </div>
              </div>

              {/* Recent actions */}
              <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-4">
                <div className="text-[11px] text-[#44445a] font-medium tracking-wide mb-3 flex items-center gap-2">
                  <Zap size={12} className="text-yellow-400" />
                  RECENT ACTIONS
                </div>

                {sig.recent.length === 0 && (
                  <p className="text-xs text-[#44445a]">No activity recorded.</p>
                )}

                {sig.recent.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#13131f] text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[#8a8a9e]">{actLabel[a.type] || a.type}</span>
                    </div>
                    <span className="text-[#44445a] font-mono text-[11px]">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}