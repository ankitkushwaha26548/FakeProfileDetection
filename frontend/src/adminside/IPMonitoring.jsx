import React, { useEffect, useState } from "react";
import { Globe, Clock } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const RiskChip = ({ risk }) => {
  const cfg = {
    HIGH:   "text-red-800 bg-red-100 border-red-200",
    MEDIUM: "text-amber-800 bg-amber-100 border-amber-200",
    LOW:    "text-green-800 bg-green-100 border-green-200",
  }[risk] || "text-gray-500 bg-gray-100 border-gray-200";

  return (
    <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full border ${cfg}`}>
      {risk}
    </span>
  );
};

export default function IPMonitoring() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.getLoginLogs()
      .then(r => setLogs(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const userIPMap = () => {
    const map = {};
    logs.forEach(l => {
      const uid = String(l.user?._id || l.user);
      if (!map[uid]) map[uid] = { name: l.user?.name || "Unknown", ips: new Set(), logins: [] };
      if (l.ip) map[uid].ips.add(l.ip);
      map[uid].logins.push(l);
    });
    return Object.values(map).map(u => ({
      ...u,
      ipCount: u.ips.size,
      ips: [...u.ips],
      risk: u.ips.size >= 5 ? "HIGH" : u.ips.size >= 3 ? "MEDIUM" : "LOW",
    })).sort((a, b) => b.ipCount - a.ipCount);
  };

  const summary = userIPMap();
  const q = search.toLowerCase();

  const filtered = logs.filter(l =>
    !q ||
    l.user?.name?.toLowerCase().includes(q) ||
    l.user?.email?.toLowerCase().includes(q) ||
    l.ip?.toLowerCase().includes(q)
  );

  if (loading) return (
    <AdminLayout title="IP Monitoring">
      <div className="flex items-center justify-center h-75">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="IP Monitoring">

      {/* IP Summary - Risk per user */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          <Globe size={14} />
          IP CHANGE RISK — PER USER
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {summary.slice(0, 8).map((u, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                    {(u.name || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-30">
                    {u.name}
                  </span>
                </div>
                <RiskChip risk={u.risk} />
              </div>

              <div className="text-xs text-gray-500 mb-2">
                {u.ipCount} unique IP{u.ipCount !== 1 ? "s" : ""} · {u.logins.length} logins
              </div>

              <div className="flex flex-wrap gap-1">
                {u.ips.slice(0, 2).map((ip, j) => (
                  <span key={j} className="text-[10px] font-mono px-2 py-0.5 bg-gray-100 text-indigo-600 rounded-md">
                    {ip}
                  </span>
                ))}
                {u.ips.length > 2 && (
                  <span className="text-[10px] text-gray-400">+{u.ips.length - 2}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Clock size={14} />
            ALL LOGIN LOGS
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, IP..."
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["User", "IP Address", "Device", "Time"].map(h => (
                  <th key={h} className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">
                    No logs found.
                  </td>
                </tr>
              )}

              {filtered.slice(0, 60).map((log, i) => (
                <tr key={log._id || i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  
                  <td className="px-5 py-2.5">
                    <div className="text-sm font-medium text-gray-800">
                      {log.user?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.user?.email || ""}
                    </div>
                  </td>

                  <td className="px-5 py-2.5">
                    <span className="text-xs font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                      {log.ip || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-2.5">
                    <span className="text-xs text-gray-500 block max-w-50 truncate">
                      {log.device
                        ? (log.device.length > 35 ? log.device.slice(0, 35) + "…" : log.device)
                        : "—"}
                    </span>
                  </td>

                  <td className="px-5 py-2.5">
                    <span className="text-xs text-gray-500 font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 60 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
            Showing 60 of {filtered.length} logs
          </div>
        )}

      </div>
    </AdminLayout>
  );
}   