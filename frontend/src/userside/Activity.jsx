import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, XCircle,
  Activity as ActivityIcon, TrendingUp, ShieldCheck
} from "lucide-react";
import Header from "../components/Header";
import * as activityApi from "../api/activityApi";
import * as detectionApi from "../api/detectionApi";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [activitiesRes, riskRes] = await Promise.all([
          activityApi.getMyActivities(),
          detectionApi.getMyRisk().catch(() => ({ data: null })),
        ]);
        setActivities(activitiesRes.data || []);
        setRisk(riskRes.data || null);
      } catch (err) {
        if (err.response?.status !== 429) {
          setError(err.response?.data?.message || "Failed to load activity");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getActivityTypeLabel = (type) => {
    const labels = {
      LOGIN: 'Logged in',
      REGISTER: 'Account created',
      POST: 'Created a post',
      LIKE_POST: 'Liked a post',
      COMMENT: 'Posted a comment',
    };
    return labels[type] || type;
  };

  // Only show a banner if SUSPICIOUS or FAKE — never show for GENUINE
  const renderOwnAccountBanner = () => {
    if (!risk || risk.level === 'GENUINE') return null;

    const isFake = risk.level === 'FAKE';
    return (
      <div className={`mb-6 rounded-2xl border p-5 ${
        isFake
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {isFake
            ? <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            : <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
          }
          <div className="flex-1">
            <p className={`font-semibold text-sm ${isFake ? 'text-red-800' : 'text-yellow-800'}`}>
              {isFake
                ? 'Your account has been flagged'
                : 'Unusual activity detected on your account'}
            </p>
            <p className={`text-xs mt-1 ${isFake ? 'text-red-600' : 'text-yellow-600'}`}>
              {isFake
                ? 'Your account shows patterns associated with fake profiles. If you believe this is wrong, please reduce automated activity.'
                : 'Your recent activity looks unusual. Slow down to keep your account in good standing.'}
            </p>

            {/* Risk score bar — shown but framed gently */}
            {risk.score !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className={isFake ? 'text-red-700' : 'text-yellow-700'}>Account standing</span>
                  <span className={`font-semibold ${isFake ? 'text-red-700' : 'text-yellow-700'}`}>
                    {100 - risk.score}% trust
                  </span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isFake ? 'bg-red-400' : 'bg-yellow-400'}`}
                    style={{ width: `${100 - risk.score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Show reasons in plain language, not raw detection labels */}
            {risk.reasons?.filter(r => r.startsWith('❌') || r.startsWith('⚠️')).length > 0 && (
              <div className="mt-3">
                <p className={`text-xs font-semibold mb-1 ${isFake ? 'text-red-700' : 'text-yellow-700'}`}>
                  What triggered this:
                </p>
                <ul className="space-y-0.5">
                  {risk.reasons
                    .filter(r => r.startsWith('❌') || r.startsWith('⚠️'))
                    .map((reason, i) => (
                      <li key={i} className={`text-xs ${isFake ? 'text-red-600' : 'text-yellow-600'}`}>
                        {reason}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading activity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Link to="/socialfeed" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Back to Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Own account banner — only if flagged */}
        {renderOwnAccountBanner()}

        {/* If GENUINE — show a clean "all good" card */}
        {risk && risk.level === 'GENUINE' && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Your account is in good standing.</p>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Activity Timeline
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-10">
              <ActivityIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No activity yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a, index) => (
                <div key={a._id || index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-indigo-50 shrink-0">
                      <ActivityIcon className="w-4 h-4 text-indigo-500" />
                    </div>
                    {index !== activities.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {getActivityTypeLabel(a.type)}
                        </p>
                        <span className="text-xs text-gray-400">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Activity;
