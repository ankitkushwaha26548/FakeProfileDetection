import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, XCircle, Activity as ActivityIcon, TrendingUp } from "lucide-react";
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
        const [activitiesRes, riskRes] = await Promise.all([
          activityApi.getMyActivities(),
          detectionApi.getMyRisk().catch(() => ({ data: null })),
        ]);
        setActivities(activitiesRes.data || []);
        setRisk(riskRes.data || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRiskColor = (level) => {
    switch(level) {
      case 'GENUINE': return 'text-green-600 bg-green-50 border-green-200';
      case 'SUSPICIOUS': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAKE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch(level) {
      case 'GENUINE': return <CheckCircle className="w-5 h-5" />;
      case 'SUSPICIOUS': return <AlertTriangle className="w-5 h-5" />;
      case 'FAKE': return <XCircle className="w-5 h-5" />;
      default: return <ActivityIcon className="w-5 h-5" />;
    }
  };

  const getActivityTypeLabel = (type) => {
    const labels = {
      'LOGIN': 'User Login',
      'REGISTER': 'Account Registered',
      'POST': 'Created a Post',
      'LIKE_POST': 'Liked a Post',
      'COMMENT': 'Posted a Comment',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Link to="/socialfeed" className="text-indigo-600 hover:underline">Back to Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
            <p className="text-sm text-gray-500 mt-1">All your account actions and security events</p>
          </div>
          <Link to="/socialfeed" className="text-indigo-600 hover:text-indigo-700 font-medium">Back to Feed</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Risk Analysis Card */}
        {risk && (
          <div className={`mb-8 rounded-2xl border-2 p-6 ${getRiskColor(risk.level)}`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">{getRiskIcon(risk.level)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Risk Assessment</h3>
                <p className="text-sm mt-1 opacity-90">
                  Your account has been classified as <strong>{risk.level}</strong>
                </p>
                {risk.score !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Risk Score</span>
                      <span className="font-bold">{risk.score}/100</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          risk.level === 'FAKE' ? 'bg-red-500' :
                          risk.level === 'SUSPICIOUS' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(risk.score, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {risk.reasons && risk.reasons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-current/20">
                    <p className="text-sm font-medium mb-2">Detection Reasons:</p>
                    <ul className="space-y-1">
                      {risk.reasons.map((reason, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Activity Timeline
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-8">
              <ActivityIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activities yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((a, index) => (
                <div key={a._id || index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 flex-shrink-0">
                      <ActivityIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    {index !== activities.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{getActivityTypeLabel(a.type)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'No date'}
                          </p>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                          {a.type}
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
