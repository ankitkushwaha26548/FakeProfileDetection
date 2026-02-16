import React, { useState } from 'react';
import { Search,AlertTriangle,Shield,Ban,Eye,Trash2,Download,RefreshCw,
    XCircle,Zap,Activity,MapPin,Wifi,Clock,TrendingUp,Filter,ChevronDown,UserX
} from 'lucide-react';

function FakeAccount() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score-desc');
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  // Fake Accounts Data
  const [fakeAccounts, setFakeAccounts] = useState([
    {
      id: 1,
      username: "SuspiciousBot123",
      email: "bot123@spam.com",
      riskScore: 95,
      autoFlagged: true,
      createdAt: "2 hours ago",
      lastActive: "5 minutes ago",
      rapidActivity: true,
      activityCount: 523,
      activityRate: "87 actions/hour",
      ipMismatch: 8,
      deviceCount: 12,
      locations: ["Unknown", "VPN Proxy", "Multiple"],
      flagReasons: [
        "Bot-like behavior detected",
        "Rapid posting (50+ posts in 10 min)",
        "IP address changes frequently",
        "Incomplete profile (0% complete)"
      ]
    },
    {
      id: 2,
      username: "FakeAccount999",
      email: "fake999@bot.net",
      riskScore: 88,
      autoFlagged: true,
      createdAt: "1 day ago",
      lastActive: "2 minutes ago",
      rapidActivity: true,
      activityCount: 891,
      activityRate: "120 actions/hour",
      ipMismatch: 15,
      deviceCount: 20,
      locations: ["Unknown", "Tor Network", "VPN"],
      flagReasons: [
        "Account created and immediately active",
        "Suspicious email domain",
        "Multiple IP addresses detected",
        "Bot pattern matching 98%"
      ]
    },
    {
      id: 3,
      username: "SpamMaster2024",
      email: "spam2024@fake.com",
      riskScore: 92,
      autoFlagged: true,
      createdAt: "3 hours ago",
      lastActive: "1 minute ago",
      rapidActivity: true,
      activityCount: 678,
      activityRate: "95 actions/hour",
      ipMismatch: 12,
      deviceCount: 18,
      locations: ["Multiple Countries", "Proxy Server"],
      flagReasons: [
        "Spam keywords detected in posts",
        "Rapid friend requests (100+ in 5 min)",
        "Device fingerprint mismatch",
        "Similar to known bot patterns"
      ]
    },
    {
      id: 4,
      username: "BotNet456",
      email: "botnet456@evil.org",
      riskScore: 97,
      autoFlagged: true,
      createdAt: "30 minutes ago",
      lastActive: "Active now",
      rapidActivity: true,
      activityCount: 1234,
      activityRate: "150 actions/hour",
      ipMismatch: 25,
      deviceCount: 30,
      locations: ["Rotating IPs", "Bot Network"],
      flagReasons: [
        "CRITICAL: Part of known botnet",
        "Automated behavior confirmed",
        "Mass following/unfollowing",
        "Cookie manipulation detected"
      ]
    },
    {
      id: 5,
      username: "CryptoScam77",
      email: "scam77@phish.io",
      riskScore: 85,
      autoFlagged: true,
      createdAt: "5 hours ago",
      lastActive: "10 minutes ago",
      rapidActivity: false,
      activityCount: 234,
      activityRate: "45 actions/hour",
      ipMismatch: 6,
      deviceCount: 8,
      locations: ["Nigeria", "India", "Russia"],
      flagReasons: [
        "Phishing links in bio",
        "Crypto scam keywords",
        "Mass DM campaign",
        "Fake verification badge attempt"
      ]
    },
    {
      id: 6,
      username: "AutoPoster321",
      email: "auto321@spam.net",
      riskScore: 79,
      autoFlagged: true,
      createdAt: "1 day ago",
      lastActive: "3 minutes ago",
      rapidActivity: true,
      activityCount: 456,
      activityRate: "78 actions/hour",
      ipMismatch: 10,
      deviceCount: 14,
      locations: ["Cloud Server", "AWS", "VPN"],
      flagReasons: [
        "Identical posts repeated",
        "Posting at exact intervals",
        "No human interaction patterns",
        "API abuse detected"
      ]
    }
  ]);

  // Filter and Sort
  const filteredAccounts = fakeAccounts
    .filter(account => 
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.riskScore - a.riskScore;
      if (sortBy === 'score-asc') return a.riskScore - b.riskScore;
      if (sortBy === 'activity-desc') return b.activityCount - a.activityCount;
      if (sortBy === 'ip-desc') return b.ipMismatch - a.ipMismatch;
      return 0;
    });

  const handleSelectAccount = (id) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(a => a.id));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black">
      
      {/* Header */}
      <div className="bg-linear-to-r from-red-900/30 to-orange-900/30 backdrop-blur-xl border-b border-red-500/30 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-3 rounded-xl">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Fake Account Detection
                  <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold">
                    CRITICAL
                  </span>
                </h1>
                <p className="text-sm text-red-300 font-mono mt-1">
                  {filteredAccounts.length} confirmed threats detected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors text-sm">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors text-sm">
                <Ban className="w-4 h-4" />
                Ban Selected ({selectedAccounts.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Alert Banner */}
        <div className="bg-red-900/20 border-2 border-red-500/40 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-600 p-3 rounded-xl animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-400 mb-2">Active Threat Alert</h3>
              <p className="text-gray-300 mb-4">
                Multiple fake accounts detected with high-risk patterns. Immediate action recommended.
              </p>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-mono mb-1">Auto-Flagged</p>
                  <p className="text-2xl font-bold text-red-400">{fakeAccounts.filter(a => a.autoFlagged).length}</p>
                </div>
                <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-mono mb-1">Avg Risk Score</p>
                  <p className="text-2xl font-bold text-red-400">
                    {Math.round(fakeAccounts.reduce((sum, a) => sum + a.riskScore, 0) / fakeAccounts.length)}
                  </p>
                </div>
                <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-mono mb-1">Rapid Activity</p>
                  <p className="text-2xl font-bold text-red-400">
                    {fakeAccounts.filter(a => a.rapidActivity).length}
                  </p>
                </div>
                <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-mono mb-1">Total IPs</p>
                  <p className="text-2xl font-bold text-red-400">
                    {fakeAccounts.reduce((sum, a) => sum + a.ipMismatch, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono uppercase">
                Search Fake Accounts
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono uppercase">
                Sort By
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="score-desc">Highest Risk First</option>
                  <option value="score-asc">Lowest Risk First</option>
                  <option value="activity-desc">Most Active</option>
                  <option value="ip-desc">Most IP Changes</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Fake Accounts List */}
        <div className="space-y-4">
          {filteredAccounts.map((account) => (
            <div 
              key={account.id}
              className="bg-gray-900/50 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all"
            >
              
              {/* Header */}
              <div className="bg-red-900/20 px-6 py-4 flex items-center justify-between border-b border-red-500/30">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={() => handleSelectAccount(account.id)}
                    className="w-5 h-5 rounded border-red-600 bg-gray-700 text-red-600 focus:ring-red-500"
                  />
                  
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        {account.username}
                        {account.autoFlagged && (
                          <span className="px-2 py-0.5 bg-red-600 rounded text-xs font-bold text-white animate-pulse">
                            AUTO-FLAGGED
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm font-mono">{account.email}</p>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="ml-6 px-4 py-2 bg-red-950/50 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-gray-400 font-mono">Risk Score</p>
                    <p className="text-2xl font-bold text-red-400">{account.riskScore}</p>
                  </div>

                  {/* Rapid Activity Badge */}
                  {account.rapidActivity && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-900/30 border border-orange-500/30 rounded-lg">
                      <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
                      <span className="text-xs font-bold text-orange-400">RAPID ACTIVITY</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors" title="View Details">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors" title="Ban Account">
                    <Ban className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Account">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Activity Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase">Activity Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Total Actions
                      </span>
                      <span className="text-white font-bold">{account.activityCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Activity Rate
                      </span>
                      <span className="text-red-400 font-bold">{account.activityRate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last Active
                      </span>
                      <span className="text-white font-mono text-sm">{account.lastActive}</span>
                    </div>
                  </div>
                </div>

                {/* Network Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase">Network Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        IP Mismatches
                      </span>
                      <span className="text-red-400 font-bold">{account.ipMismatch}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Devices
                      </span>
                      <span className="text-red-400 font-bold">{account.deviceCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {account.locations.map((loc, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-950/50 border border-red-500/30 rounded text-xs text-red-400">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detection Reasons */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase">Detection Reasons</h4>
                  <div className="space-y-2">
                    {account.flagReasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default FakeAccount
