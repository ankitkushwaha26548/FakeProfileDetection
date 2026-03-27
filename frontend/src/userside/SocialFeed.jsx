import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreVertical,
  AlertTriangle, CheckCircle, XCircle, Send, Shield
} from 'lucide-react';
import * as postApi from '../api/postApi';

const currentUserId = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u).id : null;
  } catch { return null; }
};

export default function FeedSystem() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const myId = currentUserId();

  const loadFeed = async () => {
    try {
      setLoading(true);
      const { data } = await postApi.getFeed();
      setPosts(
        (data || []).map((p) => ({
          id: p._id,
          _id: p._id,
          user: {
            _id: p.user?._id,
            name: p.user?.name || 'Unknown',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || 'U')}&background=10b981&color=fff`,
            riskLevel: p.user?.riskLevel ?? 'GENUINE',
          },
          content: p.content,
          timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          shares: 0,
          isLiked: Array.isArray(p.likes) && myId && p.likes.some((id) => String(id) === String(myId)),
          isBookmarked: false,
          commentsList: (p.comments || []).map((c) => ({
            id: c._id,
            user: c.user?.name || 'User',
            text: c.text,
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          })),
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleLike = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      await postApi.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                isLiked: !p.isLiked,
              }
            : p
        )
      );
    } catch (_) {}
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      await postApi.commentPost(postId, { text });
      setCommentText((c) => ({ ...c, [postId]: '' }));
      loadFeed();
    } catch (_) {}
  };

  const getRiskBadgeColor = (level) => {
    switch(level) {
      case "GENUINE":
        return "bg-green-100 text-green-700 border-green-200";
      case "SUSPICIOUS":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "FAKE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRiskIcon = (level) => {
    switch(level) {
      case "GENUINE":
        return <CheckCircle className="w-4 h-4" />;
      case "SUSPICIOUS":
        return <AlertTriangle className="w-4 h-4" />;
      case "FAKE":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getPostBorderColor = (level) => {
    switch(level) {
      case "GENUINE":
        return "border-green-200 hover:border-green-300";
      case "SUSPICIOUS":
        return "border-yellow-200 hover:border-yellow-300";
      case "FAKE":
        return "border-red-200 hover:border-red-300";
      default:
        return "border-gray-200 hover:border-gray-300";
    }
  };

  const toggleComments = (postId) => {
    setShowComments((s) => ({ ...s, [postId]: !s[postId] }));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
            <p className="text-sm text-gray-500">AI-powered security monitoring</p>
          </div>
          <div className="flex gap-2">
            <Link to="/post" className="text-indigo-600 hover:underline">Create Post</Link>
            <Link to="/activity" className="text-indigo-600 hover:underline">Activity</Link>
            <Link to="/profile" className="text-indigo-600 hover:underline">Profile</Link>
          </div>
        </div>
      </div>
      {error && <div className="max-w-2xl mx-auto px-4 py-2 text-red-600">{error}</div>}

      {/* Feed Container */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Risk Level Indicators:</h3>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Genuine</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Suspicious</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">Fake</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all relative ${getPostBorderColor(post.user.riskLevel)}`}
            >
              {/* FAKE Account Blur Overlay */}
              {post.user.riskLevel === "FAKE" && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-red-600 font-bold rounded-2xl z-10">
                  FAKE ACCOUNT CONTENT
                </div>
              )}
              
              {/* Post Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    {/* User Avatar */}
                    <img 
                      src={post.user.image} 
                      alt={post.user.name} 
                      className="w-12 h-12 rounded-full"
                    />
                    
                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                        
                        {/* Risk Badge */}
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 ${getRiskBadgeColor(post.user.riskLevel)}`}>
                          {getRiskIcon(post.user.riskLevel)}
                          {post.user.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  
                  {/* More Options */}
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="mt-4 text-gray-800 leading-relaxed">
                  {post.content}
                </p>

                {/* Warning Banners */}
                {post.user.riskLevel === "SUSPICIOUS" && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Suspicious Activity</p>
                      <p className="text-xs text-yellow-700">This user has been flagged for unusual behavior patterns.</p>
                    </div>
                  </div>
                )}

                {post.user.riskLevel === "FAKE" && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Fake Account Detected</p>
                      <p className="text-xs text-red-700">This account has been identified as fake. Exercise caution with content.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className="px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="hover:underline cursor-pointer">{post.likes} likes</span>
                  <div className="flex gap-3">
                    <span className="hover:underline cursor-pointer">{post.comments} comments</span>
                    <span className="hover:underline cursor-pointer">{post.shares} shares</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                
                <button
                  onClick={() => handleLike(post.id)}
                  disabled={post.user.riskLevel === "FAKE"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${
                    post.user.riskLevel === "FAKE"
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : post.isLiked 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart 
                    className={`w-5 h-5 ${post.isLiked ? 'fill-red-600' : ''}`} 
                  />
                  <span className="font-medium text-sm">Like</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => toggleComments(post.id)}
                  disabled={post.user.riskLevel === "FAKE"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
                    post.user.riskLevel === "FAKE"
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Comment</span>
                </button>

                {/* Share Button */}
                <button 
                  disabled={post.user.riskLevel === "FAKE"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
                    post.user.riskLevel === "FAKE"
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium text-sm">Share</span>
                </button>

                <span className={`p-2 ${post.user.riskLevel === "FAKE" ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-400 cursor-default'}`}>
                  <Bookmark className="w-5 h-5" />
                </span>
              </div>

              {showComments[post.id] && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {post.commentsList?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {post.commentsList.map((c) => (
                        <div key={c.id} className="flex gap-2 text-sm">
                          <span className="font-semibold text-gray-700">{c.user}:</span>
                          <span className="text-gray-800">{c.text}</span>
                          <span className="text-gray-400 text-xs">{c.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText((c) => ({ ...c, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Write a comment..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="text-indigo-600 hover:text-indigo-700 p-2">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={loadFeed} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Refresh Feed
          </button>
        </div>

      </div>
    </div>
  );
}