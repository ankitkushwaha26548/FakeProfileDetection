import React, { useEffect, useState } from "react";
import { Globe, Clock } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import * as adminApi from "../api/adminApi";

const RiskChip = ({ risk }) => {
  const cfg = {
    HIGH: "text-red-400 bg-red-400/10 border border-red-400/20",
    MEDIUM: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
    LOW: "text-green-400 bg-green-400/10 border border-green-400/20",
  }[risk] || "";

  return (
    <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded ${cfg}`}>
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
        <div className="w-7 h-7 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="IP Monitoring">

      {/* IP Summary */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[11px] text-[#44445a] font-medium tracking-wider mb-3">
          <Globe size={12} />
          IP CHANGE RISK — PER USER
        </div>

        <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {summary.slice(0, 8).map((u, i) => (
            <div key={i} className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-4">
              
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#13131f] flex items-center justify-center text-[11px] font-semibold text-indigo-400">
                    {(u.name || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-[#e4e4ec] truncate max-w-25">
                    {u.name}
                  </span>
                </div>
                <RiskChip risk={u.risk} />
              </div>

              <div className="text-[11px] text-[#44445a] mb-2">
                {u.ipCount} unique IP{u.ipCount !== 1 ? "s" : ""} · {u.logins.length} logins
              </div>

              <div className="flex flex-wrap gap-1">
                {u.ips.slice(0, 2).map((ip, j) => (
                  <span key={j} className="text-[10px] font-mono px-1.5 py-0.5 bg-[#13131f] text-indigo-400 border border-[#1e1e30] rounded">
                    {ip}
                  </span>
                ))}
                {u.ips.length > 2 && (
                  <span className="text-[10px] text-[#44445a]">
                    +{u.ips.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg overflow-hidden">

        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3 border-b border-[#1e1e30]">
          <div className="flex items-center gap-2 text-[11px] text-[#44445a] font-medium tracking-wider">
            <Clock size={12} />
            ALL LOGIN LOGS
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, IP..."
            className="bg-[#09090f] border border-[#1e1e30] rounded-md px-3 py-1.5 text-xs text-[#e4e4ec] outline-none w-55"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1e1e30]">
                {["User", "IP Address", "Device", "Time"].map(h => (
                  <th key={h} className="px-5 py-2 text-left text-[10px] text-[#44445a] font-semibold tracking-widest uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#44445a] text-sm">
                    No logs found.
                  </td>
                </tr>
              )}

              {filtered.slice(0, 60).map((log, i) => (
                <tr key={log._id || i} className="border-b border-[#0d0d18] hover:bg-[#0f0f1c] transition">
                  
                  <td className="px-5 py-2.5">
                    <div className="text-sm font-medium text-[#e4e4ec]">
                      {log.user?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-[#44445a]">
                      {log.user?.email || ""}
                    </div>
                  </td>

                  <td className="px-5 py-2.5">
                    <span className="text-xs font-mono px-2 py-0.5 bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 rounded">
                      {log.ip || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-2.5">
                    <span className="text-xs text-[#44445a] block max-w-50 truncate">
                      {log.device
                        ? (log.device.length > 35 ? log.device.slice(0, 35) + "…" : log.device)
                        : "—"}
                    </span>
                  </td>

                  <td className="px-5 py-2.5">
                    <span className="text-xs text-[#44445a] font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 60 && (
          <div className="px-5 py-2.5 border-t border-[#1e1e30] text-xs text-[#44445a]">
            Showing 60 of {filtered.length} logs
          </div>
        )}

      </div>
    </AdminLayout>
  );
}