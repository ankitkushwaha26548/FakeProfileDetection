import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Send, MoreHorizontal } from "lucide-react";
import UserHeader from "../components/UserHeader";
import * as postApi from "../api/postApi";

const myId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id;
  } catch {
    return null;
  }
};

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const uid = myId();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await postApi.getFeed();
      setPosts(
        (data || []).map((p) => ({
          id: p._id,
          name: p.user?.name || "Unknown",
          initials: (p.user?.name || "U")[0].toUpperCase(),
          content: p.content,
          time: p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          isLiked:
            Array.isArray(p.likes) &&
            uid &&
            p.likes.some((id) => String(id) === String(uid)),
          commentsList: (p.comments || []).map((c) => ({
            id: c._id,
            user: c.user?.name || "User",
            text: c.text,
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
          })),
        }))
      );
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLike = async (id) => {
    await postApi.likePost(id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );
    setTimeout(load, 300);
  };

  const handleComment = async (id) => {
    const text = commentText[id]?.trim();
    if (!text) return;
    await postApi.commentPost(id, { text });
    setCommentText((c) => ({ ...c, [id]: "" }));
    setTimeout(load, 300);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-100">
      <UserHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Loader */}
        {loading && (
          <div className="flex justify-center pt-16">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center pt-20 bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-indigo-400" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No posts yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Be the first to share something with the community.
            </p>
            <Link
              to="/post"
              className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full shadow-sm transition"
            >
              Create a post
            </Link>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-5">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700 shadow-inner">
                  {post.initials}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{post.name}</div>
                  <div className="text-xs text-gray-400">{post.time}</div>
                </div>

                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-3">
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
              </div>

              {/* Stats */}
              <div className="flex justify-between px-5 py-2 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-medium">{post.likes} likes</span>
                <span className="font-medium">{post.comments} comments</span>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-100 text-sm">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-medium transition ${
                    post.isLiked
                      ? "text-red-500 bg-red-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    size={16}
                    fill={post.isLiked ? "#f87171" : "none"}
                    className="transition"
                  />
                  Like
                </button>

                <button
                  onClick={() =>
                    setShowComments((s) => ({ ...s, [post.id]: !s[post.id] }))
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  <MessageCircle size={16} />
                  Comment
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 font-medium hover:bg-gray-50 transition">
                  <Share2 size={16} />
                  Share
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="bg-gray-50 border-t border-gray-200 px-5 py-4">
                  {post.commentsList.map((c) => (
                    <div key={c.id} className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {c.user[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
                        <div className="text-xs font-semibold text-gray-700">
                          {c.user}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {c.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <input
                      value={commentText[post.id] || ""}
                      placeholder="Write a comment…"
                      onChange={(e) =>
                        setCommentText((c) => ({ ...c, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                      className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                    />

                    <button
                      onClick={() => handleComment(post.id)}
                      className="text-indigo-600 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 transition"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Refresh Button */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={load}
              className="px-5 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              Refresh feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}