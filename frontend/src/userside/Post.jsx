import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, Send, Image as ImageIcon,
  AlertTriangle, MoreVertical
} from 'lucide-react';
import Header from '../components/Header';
import * as postApi from '../api/postApi';
import * as detectionApi from '../api/detectionApi';

const currentUserId = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u).id : null;
  } catch { return null; }
};

export default function PostSystem() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  // Own-account warning only
  const [ownWarning, setOwnWarning] = useState(null); // { level, message }
  const myId = currentUserId();
  const warningTimer = useRef(null);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const { data } = await postApi.getFeed();
      setPosts(
        (data || []).map((p) => ({
          id: p._id,
          author: p.user?.name || 'Unknown',
          authorImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || 'U')}&background=6366f1&color=fff`,
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
    } catch (_) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  // Show own-account warning banner for 6 seconds then auto-dismiss
  const showOwnAccountWarning = (level, reasons) => {
    if (level === 'GENUINE') return;
    const msg = level === 'FAKE'
      ? 'Your account has been flagged. Please review your activity.'
      : 'Your account shows unusual activity. Slow down to avoid being flagged.';
    setOwnWarning({ level, message: msg, reasons });
    if (warningTimer.current) clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setOwnWarning(null), 6000);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      await postApi.createPost({ content: newPost.trim() });
      setNewPost('');
      // Check own risk silently after posting
      try {
        const riskRes = await detectionApi.getMyRisk();
        if (riskRes.data?.level) {
          showOwnAccountWarning(riskRes.data.level, riskRes.data.reasons);
        }
      } catch (_) {}
      loadFeed();
    } catch (_) {}
    finally { setPosting(false); }
  };

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

  const toggleComments = (postId) => setShowComments((s) => ({ ...s, [postId]: !s[postId] }));

  const handleAddComment = async (postId) => {
    const text = newComment[postId]?.trim();
    if (!text) return;
    try {
      await postApi.commentPost(postId, { text });
      setNewComment((c) => ({ ...c, [postId]: '' }));
      loadFeed();
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Own-account gentle warning — only visible if flagged */}
        {ownWarning && (
          <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
            ownWarning.level === 'FAKE'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
              ownWarning.level === 'FAKE' ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                ownWarning.level === 'FAKE' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {ownWarning.level === 'FAKE' ? 'Account flagged' : 'Unusual activity detected'}
              </p>
              <p className={`text-xs mt-0.5 ${
                ownWarning.level === 'FAKE' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {ownWarning.message}
              </p>
            </div>
            <button
              onClick={() => setOwnWarning(null)}
              className="text-gray-400 hover:text-gray-600 text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Create Post */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-3">
              <img
                src="https://ui-avatars.com/api/?name=Me&background=6366f1&color=fff"
                alt="You"
                className="w-10 h-10 rounded-full shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  rows="3"
                />
                <div className="flex items-center justify-between mt-2">
                  <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={posting || !newPost.trim()}
                    className="bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-40 flex items-center gap-2 font-medium"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading posts...</p>
          </div>
        )}

        {/* Posts Feed */}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200">

            {/* Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <img src={post.authorImage} alt={post.author} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
                    <p className="text-xs text-gray-400">{post.timestamp}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-gray-800 text-sm leading-relaxed">{post.content}</p>
            </div>

            {/* Stats */}
            <div className="px-5 py-2 border-t border-gray-100 flex justify-between text-xs text-gray-400">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
            </div>

            {/* Actions */}
            <div className="px-5 py-2 border-t border-gray-100 flex gap-1">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  post.isLiked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-red-600' : ''}`} />
                Like
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Comment
              </button>
            </div>

            {/* Comments */}
            {showComments[post.id] && (
              <div className="px-5 pb-5 border-t border-gray-100">
                {post.commentsList?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {post.commentsList.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.user)}&background=6366f1&color=fff`}
                          alt={c.user}
                          className="w-7 h-7 rounded-full shrink-0"
                        />
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-gray-900">{c.user}</p>
                          <p className="text-xs text-gray-700 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Write a comment..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={() => handleAddComment(post.id)} className="text-indigo-600 hover:text-indigo-700 p-1.5">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
