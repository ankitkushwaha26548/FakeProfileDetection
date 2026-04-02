import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreVertical,
  AlertTriangle, Send
} from 'lucide-react';
import Header from '../components/Header';
import * as postApi from '../api/postApi';

const currentUserId = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u).id : null;
  } catch { return null; }
};

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const myId = currentUserId();

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await postApi.getFeed();
      setPosts(
        (data || []).map((p) => ({
          id: p._id,
          user: {
            _id: p.user?._id,
            name: p.user?.name || 'Unknown',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || 'U')}&background=6366f1&color=fff`,
          },
          content: p.content,
          timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          isLiked: Array.isArray(p.likes) && myId && p.likes.some((id) => String(id) === String(myId)),
          commentsList: (p.comments || []).map((c) => ({
            id: c._id,
            user: c.user?.name || 'User',
            text: c.text,
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          })),
        }))
      );
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err.response?.data?.message || 'Failed to load feed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  const handleLike = async (postId) => {
    try {
      await postApi.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked }
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

  const toggleComments = (postId) => {
    setShowComments((s) => ({ ...s, [postId]: !s[postId] }));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {!loading && posts.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share something!</p>
            <Link to="/post" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Create a Post
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto px-4 py-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200">

              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <img src={post.user.image} alt={post.user.name} className="w-11 h-11 rounded-full" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                      <p className="text-xs text-gray-400">{post.timestamp}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-4 text-gray-800 leading-relaxed">{post.content}</p>
              </div>

              {/* Post Stats */}
              <div className="px-6 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-2 border-t border-gray-100 flex gap-1">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium ${
                    post.isLiked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-600' : ''}`} />
                  Like
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="px-6 pb-5 border-t border-gray-100">
                  {post.commentsList?.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {post.commentsList.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.user)}&background=6366f1&color=fff`}
                            alt={c.user}
                            className="w-8 h-8 rounded-full shrink-0"
                          />
                          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2">
                            <p className="text-sm font-semibold text-gray-900">{c.user}</p>
                            <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{c.time}</p>
                          </div>
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
                      className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="text-indigo-600 hover:text-indigo-700 p-2">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="text-center pt-2">
            <button onClick={loadFeed} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Refresh Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
