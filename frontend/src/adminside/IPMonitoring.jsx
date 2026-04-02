import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, ArrowLeft, Globe, Smartphone, Clock } from "lucide-react";
import * as adminApi from "../api/adminApi";

export default function IPMonitoring() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getLoginLogs();
        setLogs(res.data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group logs by user to find IP change patterns
  const userIPSummary = () => {
    const map = {};
    logs.forEach((log) => {
      const uid = String(log.user?._id || log.user);
      const name = log.user?.name || "Unknown";
      if (!map[uid]) map[uid] = { name, ips: new Set(), logins: [], uid };
      map[uid].ips.add(log.ip || "unknown");
      map[uid].logins.push(log);
    });
    return Object.values(map).map((u) => ({
      ...u,
      ipCount: u.ips.size,
      ips: [...u.ips],
      risk: u.ips.size >= 5 ? "HIGH" : u.ips.size >= 3 ? "MEDIUM" : "LOW",
    })).sort((a, b) => b.ipCount - a.ipCount);
  };

  const summary = userIPSummary();

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.user?.name?.toLowerCase().includes(q) ||
      l.ip?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q)
    );
  });

  const getRiskStyle = (risk) => {
    if (risk === "HIGH") return "bg-red-900/50 text-red-300 border-red-700";
    if (risk === "MEDIUM") return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
    return "bg-green-900/50 text-green-300 border-green-700";
  };

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
        <span className="text-white font-semibold text-sm">IP Monitoring</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* IP Risk Summary per user */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              IP Change Risk — Per User
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Users with 3+ distinct IPs are flagged</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {summary.slice(0, 6).map((u) => (
              <div key={u.uid} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=312e81&color=fff`}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm font-medium text-white truncate max-w-[120px]">{u.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getRiskStyle(u.risk)}`}>
                    {u.risk}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">{u.ipCount} unique IP{u.ipCount !== 1 ? "s" : ""} · {u.logins.length} logins</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {u.ips.slice(0, 3).map((ip, i) => (
                      <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                        {ip}
                      </span>
                    ))}
                    {u.ips.length > 3 && (
                      <span className="text-xs text-gray-600">+{u.ips.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Log Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              All Login Logs
            </h2>
            <input
              type="text"
              placeholder="Search by name, email, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">IP Address</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Device</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Location</th>
                  <th className="text-left px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filtered.slice(0, 50).map((log, i) => (
                  <tr key={log._id || i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.user?.name || 'U')}&background=312e81&color=fff`}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <p className="text-white text-xs font-medium">{log.user?.name || "Unknown"}</p>
                          <p className="text-gray-600 text-xs">{log.user?.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-mono text-xs text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded">
                        {log.ip || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400 truncate max-w-[160px] block">
                        {log.device
                          ? log.device.length > 40
                            ? log.device.substring(0, 40) + "..."
                            : log.device
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{log.location || "Unknown"}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-gray-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-600 py-10 text-sm">No logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <div className="px-6 py-3 border-t border-gray-800 text-xs text-gray-600">
              Showing 50 of {filtered.length} logs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
