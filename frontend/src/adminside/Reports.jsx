import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, FileText, TrendingUp, MapPin, Activity, Shield, Clock,
  AlertTriangle, Eye, Calendar, Wifi, Smartphone, BarChart3, LineChart, PieChart,
  Search, Filter, ChevronDown, FileDown, Printer, Share2
} from 'lucide-react';
import * as adminApi from '../api/adminApi';

function Reports() {
  const [selectedUser, setSelectedUser] = useState('user_8234');
  const [reportType, setReportType] = useState('full');
  const [dateRange, setDateRange] = useState('7d');
  const [loginLogs, setLoginLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    adminApi.getLoginLogs()
      .then((res) => setLoginLogs(Array.isArray(res.data) ? res.data.slice(0, 50) : []))
      .catch(() => setLoginLogs([]))
      .finally(() => setLoadingLogs(false));
  }, []);

  // Sample Report Data (template)
  const reportData = {
    user: {
      id: 'user_8234',
      username: 'SuspiciousBot123',
      email: 'bot123@spam.com',
      currentRiskScore: 95,
      riskLevel: 'FAKE',
      accountAge: '2 days',
      totalActivity: 523,
      flaggedDate: '2024-02-14 14:23:45'
    },
    
    // Risk Score Timeline
    riskHistory: [
      { date: '2024-02-13', score: 45, event: 'Account created' },
      { date: '2024-02-13', score: 62, event: 'Rapid posting detected' },
      { date: '2024-02-13', score: 78, event: 'IP change #3' },
      { date: '2024-02-14', score: 85, event: 'Bot pattern detected' },
      { date: '2024-02-14', score: 95, event: 'Auto-flagged as FAKE' }
    ],

    // IP Change Pattern
    ipHistory: [
      { timestamp: '2024-02-13 10:15:22', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome/Windows' },
      { timestamp: '2024-02-13 10:18:45', ip: '45.123.67.89', location: 'London, UK', device: 'Chrome/Windows' },
      { timestamp: '2024-02-13 11:02:33', ip: '203.45.178.22', location: 'Tokyo, Japan', device: 'Firefox/Linux' },
      { timestamp: '2024-02-13 12:45:18', ip: '89.234.12.45', location: 'Berlin, Germany', device: 'Safari/MacOS' },
      { timestamp: '2024-02-14 09:23:11', ip: '167.89.234.12', location: 'Mumbai, India', device: 'Chrome/Android' },
      { timestamp: '2024-02-14 14:12:56', ip: '78.145.23.67', location: 'Paris, France', device: 'Chrome/Windows' }
    ],

    // Behavior Anomalies
    behaviorAnomalies: [
      { 
        type: 'Rapid Posting',
        severity: 'HIGH',
        detected: '2024-02-13 10:30:00',
        description: '50 posts created in 10 minutes',
        confidence: 98
      },
      { 
        type: 'Bot Pattern',
        severity: 'CRITICAL',
        detected: '2024-02-14 09:15:00',
        description: 'Actions performed at exact 30-second intervals',
        confidence: 99
      },
      { 
        type: 'Mass Following',
        severity: 'HIGH',
        detected: '2024-02-13 15:20:00',
        description: '200 users followed in 5 minutes',
        confidence: 95
      },
      { 
        type: 'IP Hopping',
        severity: 'CRITICAL',
        detected: '2024-02-13 11:00:00',
        description: '6 IP changes in 4 hours',
        confidence: 97
      },
      { 
        type: 'Device Switching',
        severity: 'MEDIUM',
        detected: '2024-02-14 10:00:00',
        description: '4 different devices in 2 hours',
        confidence: 85
      }
    ],

    // Activity Pattern (24h distribution)
    activityPattern: [
      { hour: 0, count: 12 },
      { hour: 3, count: 18 },
      { hour: 6, count: 35 },
      { hour: 9, count: 52 },
      { hour: 12, count: 48 },
      { hour: 15, count: 61 },
      { hour: 18, count: 45 },
      { hour: 21, count: 38 }
    ],

    // Detection Reasons
    detectionReasons: [
      'Profile completeness: 0% (no bio, no profile picture)',
      'Account created and immediately active (< 5 minutes)',
      'Suspicious email domain (spam.com)',
      'Rapid content creation (87 actions per hour)',
      'Multiple geographic locations in short time',
      'IP address changes exceed threshold (6 in 4 hours)',
      'Device fingerprint mismatches detected',
      'Bot-like behavior pattern match: 98%',
      'Activity timestamps show automated intervals',
      'Similar to known botnet patterns'
    ]
  };

  const maxActivity = Math.max(...reportData.activityPattern.map(d => d.count));

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-900/30 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-900/30 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black">
      
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-indigo-500/20 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Detection Report</h1>
                <p className="text-sm text-gray-400 font-mono">
                  Forensic Analysis • Case ID: {reportData.user.id}
                </p>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors text-sm">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors text-sm">
                <FileDown className="w-4 h-4" />
                Export PDF
              </button>
              <Link to="/" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm">
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-900/50 border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent login activity</h3>
          {loadingLogs ? <p className="text-gray-400">Loading...</p> : loginLogs.length === 0 ? <p className="text-gray-400">No login logs.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 border-b border-gray-700"><th className="py-2 pr-4">User</th><th className="py-2 pr-4">IP</th><th className="py-2 pr-4">Device</th><th className="py-2">Date</th></tr></thead>
                <tbody>
                  {loginLogs.map((log, i) => (
                    <tr key={log._id || i} className="border-b border-gray-800">
                      <td className="py-2 text-white">{log.user?.name || log.user?.email || '—'}</td>
                      <td className="py-2 text-gray-300 font-mono">{log.ip || '—'}</td>
                      <td className="py-2 text-gray-300">{log.device ? String(log.device).slice(0, 40) : '—'}</td>
                      <td className="py-2 text-gray-400">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Report Summary Header */}
        <div className="bg-linear-to-r from-red-900/30 to-orange-900/30 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            <div className="md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{reportData.user.username}</h2>
                  <p className="text-gray-400 text-sm font-mono mb-2">{reportData.user.email}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-red-900/50 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold">
                      {reportData.user.riskLevel}
                    </span>
                    <span className="px-3 py-1 bg-gray-800 rounded-lg text-gray-400 text-xs font-mono">
                      ID: {reportData.user.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-mono mb-1">Risk Score</p>
              <p className="text-3xl font-bold text-red-400">{reportData.user.currentRiskScore}</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-mono mb-1">Total Activity</p>
              <p className="text-3xl font-bold text-white">{reportData.user.totalActivity}</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-mono mb-1">Account Age</p>
              <p className="text-xl font-bold text-white">{reportData.user.accountAge}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-red-500/20">
            <p className="text-sm text-gray-400 font-mono">
              <Clock className="w-4 h-4 inline mr-2" />
              Flagged: {reportData.user.flaggedDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Risk Score Timeline */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Risk Score Timeline
              </h3>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {reportData.riskHistory.map((entry, index) => (
                <div key={index} className="relative pl-8">
                  {index < reportData.riskHistory.length - 1 && (
                    <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-linear-to-b from-indigo-500 to-transparent"></div>
                  )}
                  <div className="absolute left-0 top-2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-gray-900"></div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 font-mono">{entry.date}</span>
                      <span className={`text-xl font-bold ${
                        entry.score >= 80 ? 'text-red-400' :
                        entry.score >= 50 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {entry.score}
                      </span>
                    </div>
                    <p className="text-white text-sm">{entry.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IP Change Pattern */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-400" />
                IP Change Pattern
              </h3>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reportData.ipHistory.map((entry, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-mono">{entry.timestamp}</span>
                    <span className="px-2 py-1 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-400 font-mono">
                      Change #{index + 1}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-mono text-sm">{entry.ip}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {entry.location}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        {entry.device}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Behavior Anomaly Graph */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Behavior Anomalies Detected
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.behaviorAnomalies.map((anomaly, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(anomaly.severity)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm mb-1">{anomaly.type}</h4>
                    <p className="text-xs opacity-80">{anomaly.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60">{anomaly.detected}</span>
                  <span className="font-bold">Confidence: {anomaly.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Pattern Distribution */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              24-Hour Activity Distribution
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {reportData.activityPattern.map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono w-12">
                  {String(data.hour).padStart(2, '0')}:00
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden relative">
                  <div 
                    className="bg-linear-to-r from-indigo-600 to-purple-600 h-full flex items-center px-3 transition-all duration-500"
                    style={{ width: `${(data.count / maxActivity) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{data.count} actions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Detection Reasons */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Detailed Detection Reasons
            </h3>
            <span className="px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-bold">
              {reportData.detectionReasons.length} Violations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportData.detectionReasons.map((reason, index) => (
              <div key={index} className="bg-gray-800/50 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-red-400 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-300 text-sm">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report Footer */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-2">Report Generated</h4>
              <p className="text-white font-mono text-sm">{new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
              <h4 className="text-sm font-bold text-gray-400 mb-2">Analysis System</h4>
              <p className="text-white font-mono text-sm">FakeDetect AI v2.5.1</p>
            </div>
            <div className="text-right">
              <h4 className="text-sm font-bold text-gray-400 mb-2">Confidence Level</h4>
              <p className="text-red-400 font-bold text-2xl">98%</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reports