import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserX, AlertTriangle, UserCheck, Shield, Activity,
  TrendingUp, TrendingDown, Eye, Clock, MapPin, Terminal,
  Search, Filter, Download, RefreshCw, Bell, Settings
} from 'lucide-react';
import * as adminApi from '../api/adminApi';
import * as detectionApi from '../api/detectionApi';
import * as activityApi from '../api/activityApi';

function Dashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    fakeUsers: 0,
    suspiciousUsers: 0,
    activeUsers: 0,
    totalActivities: 0,
    trends: { total: 0, fake: 0, suspicious: 0, active: 0 },
  });
  const [recentDetections, setRecentDetections] = useState([]);
  const [activityStats, setActivityStats] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [statsRes, risksRes, activityRes] = await Promise.all([
        adminApi.getDashboardStats(),
        detectionApi.getAllRiskyUsers().catch(() => ({ data: [] })),
        activityApi.getActivityStats().catch(() => ({ data: null })),
      ]);
      const s = statsRes.data || {};
      setStats({
        totalUsers: s.totalUsers ?? 0,
        fakeUsers: s.fake ?? 0,
        suspiciousUsers: s.suspicious ?? 0,
        activeUsers: s.genuine ?? 0,
        totalActivities: s.totalActivities ?? 0,
        trends: { total: 0, fake: 0, suspicious: 0, active: 0 },
      });
      const risks = Array.isArray(risksRes.data) ? risksRes.data : [];
      setRecentDetections(
        risks.slice(0, 8).map((r, i) => ({
          id: r._id || i,
          user: r.user?.name || r.user?.email || r.user?._id || 'Unknown',
          risk: r.level || 'GENUINE',
          reason: (r.reasons && r.reasons[0]) || 'Risk detected',
          time: r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : '',
          severity: r.level === 'FAKE' ? 'HIGH' : r.level === 'SUSPICIOUS' ? 'MEDIUM' : 'LOW',
        }))
      );
      if (activityRes?.data) setActivityStats(activityRes.data);
    } catch (_) {
      setStats({
        totalUsers: 0,
        fakeUsers: 0,
        suspiciousUsers: 0,
        activeUsers: 0,
        totalActivities: 0,
        trends: { total: 0, fake: 0, suspicious: 0, active: 0 },
      });
      setRecentDetections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loginActivity = activityStats
    ? [
        { hour: 'Logins', count: activityStats.logins ?? 0 },
        { hour: 'Posts', count: activityStats.posts ?? 0 },
        { hour: 'Likes', count: activityStats.likes ?? 0 },
        { hour: 'Comments', count: activityStats.comments ?? 0 },
        { hour: 'Total', count: activityStats.total ?? 0 },
      ]
    : [{ hour: '—', count: 0 }];
  const maxActivity = Math.max(1, ...loginActivity.map((d) => d.count));
  const topLocationsRaw = [
    { country: 'Genuine', count: stats.activeUsers, percentage: stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0 },
    { country: 'Suspicious', count: stats.suspiciousUsers, percentage: stats.totalUsers ? Math.round((stats.suspiciousUsers / stats.totalUsers) * 100) : 0 },
    { country: 'Fake', count: stats.fakeUsers, percentage: stats.totalUsers ? Math.round((stats.fakeUsers / stats.totalUsers) * 100) : 0 },
  ].filter((l) => l.count > 0);
  const topLocations = topLocationsRaw.length ? topLocationsRaw : [{ country: 'No data', count: 0, percentage: 0 }];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black">
      
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-indigo-500/20 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Security Dashboard</h1>
                <p className="text-xs text-gray-400 font-mono">Real-time threat monitoring</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users, IPs, or threats..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm">
              <RefreshCw className="w-4 h-4" />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <a href="/admin/alogin" className="text-gray-400 hover:text-white text-sm">Logout</a>
          </div>
        </div>
      </div>

      {loading && !stats.totalUsers && !recentDetections.length ? (
        <div className="p-6 flex justify-center">
          <p className="text-indigo-400">Loading dashboard...</p>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Users */}
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            trend={stats.trends.total}
            color="blue"
          />

          {/* Fake Users */}
          <StatCard
            icon={<UserX className="w-6 h-6" />}
            title="Fake Users"
            value={stats.fakeUsers}
            trend={stats.trends.fake}
            color="red"
            alert
          />

          {/* Suspicious Users */}
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Suspicious Users"
            value={stats.suspiciousUsers}
            trend={stats.trends.suspicious}
            color="yellow"
          />

          {/* Active Users */}
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            trend={stats.trends.active}
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Risk Distribution */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Risk Distribution</h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>

            {/* Pie Chart Representation */}
            <div className="space-y-4">
              <RiskBar label="Genuine" count={12044} percentage={93.8} color="green" />
              <RiskBar label="Suspicious" count={567} percentage={4.4} color="yellow" />
              <RiskBar label="Fake" count={234} percentage={1.8} color="red" />
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">93.8%</p>
                <p className="text-xs text-gray-500 font-mono">Safe</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">4.4%</p>
                <p className="text-xs text-gray-500 font-mono">Warning</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">1.8%</p>
                <p className="text-xs text-gray-500 font-mono">Threat</p>
              </div>
            </div>
          </div>

          {/* Login Activity Graph */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Login Activity (24h)</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>

            {/* Bar Chart */}
            <div className="space-y-3">
              {loginActivity.map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono w-12">{data.hour}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden relative">
                    <div 
                      className="bg-linear-to-r from-indigo-600 to-purple-600 h-full flex items-center px-3 transition-all duration-500"
                      style={{ width: `${(data.count / maxActivity) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{data.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Detections */}
          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Threat Detections</h3>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-mono flex items-center gap-1">
                View All
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentDetections.map((detection) => (
                <div key={detection.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        detection.risk === 'FAKE' ? 'bg-red-500' : 'bg-yellow-500'
                      } animate-pulse`}></div>
                      <div>
                        <p className="text-white font-mono text-sm">{detection.user}</p>
                        <p className="text-gray-400 text-xs mt-1">{detection.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        detection.severity === 'HIGH' 
                          ? 'bg-red-900/50 text-red-400 border border-red-500/30'
                          : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {detection.severity}
                      </span>
                      <span className="text-gray-500 text-xs font-mono">{detection.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Top Locations</h3>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {topLocations.map((location, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{location.country}</span>
                    <span className="text-sm text-gray-400 font-mono">{location.count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-linear-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-mono">Total Countries</span>
                <span className="text-white font-bold">47</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusIndicator label="Detection Engine" status="ONLINE" />
            <StatusIndicator label="Database" status="ONLINE" />
            <StatusIndicator label="AI Model" status="ACTIVE" />
            <StatusIndicator label="API Gateway" status="ONLINE" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, trend, color, alert }) {
  const colors = {
    blue: 'from-blue-600 to-cyan-600',
    red: 'from-red-600 to-pink-600',
    yellow: 'from-yellow-600 to-orange-600',
    green: 'from-green-600 to-emerald-600'
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-xl border ${alert ? 'border-red-500/30' : 'border-indigo-500/20'} rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-all`}>
      {alert && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-linear-to-br ${colors[color]} rounded-xl`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${
          trend >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <h3 className="text-gray-400 text-sm font-mono uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

// Risk Bar Component
function RiskBar({ label, count, percentage, color }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-mono">{count.toLocaleString()}</span>
          <span className="text-sm font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3">
        <div 
          className={`${colors[color]} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// Status Indicator Component
function StatusIndicator({ label, status }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${status === 'ONLINE' || status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <span className="text-xs text-gray-400 font-mono uppercase">{label}</span>
      </div>
      <p className={`text-sm font-bold ${status === 'ONLINE' || status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>{status}</p>
    </div>
  );
}

export default Dashboard