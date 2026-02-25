import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Activity</h1>
          <Link to="/feed" className="text-blue-600 hover:underline">Back to Feed</Link>
        </div>
        {risk && (
          <div className={`mb-4 p-3 rounded-lg ${risk.level === "FAKE" ? "bg-red-100" : risk.level === "SUSPICIOUS" ? "bg-yellow-100" : "bg-green-100"}`}>
            <strong>Risk:</strong> {risk.level} (score: {risk.score})
          </div>
        )}
        <ul className="space-y-2">
          {activities.length === 0 ? (
            <li className="text-gray-500">No activities yet.</li>
          ) : (
            activities.map((a) => (
              <li key={a._id} className="bg-white p-3 rounded shadow text-sm">
                <span className="font-medium">{a.type}</span>
                {a.createdAt && <span className="text-gray-500 ml-2">{new Date(a.createdAt).toLocaleString()}</span>}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Activity;
