import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, AlertTriangle, X } from "lucide-react";
import UserHeader from "../components/UserHeader";
import * as postApi from "../api/postApi";
import * as detectionApi from "../api/detectionApi";

const myId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id;
  } catch {
    return null;
  }
};

export default function Post() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [warning, setWarning] = useState(null);
  const timer = useRef(null);
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

  const showWarn = (level, msg) => {
    if (level === "GENUINE") return;
    setWarning({ level, msg });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setWarning(null), 7000);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      await postApi.createPost({ content: text.trim() });
      setText("");
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const r = await detectionApi.getMyRisk();
        if (r.data?.level)
          showWarn(
            r.data.level,
            r.data.level === "FAKE"
              ? "Your account has been flagged for unusual activity."
              : "Unusual activity detected. Slow down to stay in good standing."
          );
      } catch {}
      load();
    } finally {
      setPosting(false);
    }
  };

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
    const t = commentText[id]?.trim();
    if (!t) return;
    await postApi.commentPost(id, { text: t });
    setCommentText((c) => ({ ...c, [id]: "" }));
    setTimeout(load, 300);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <UserHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        {warning && (
          <div
            className={`flex items-start gap-3 p-3 rounded-xl mb-5 text-sm shadow-sm ${
              warning.level === "FAKE"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-amber-50 border border-amber-200 text-amber-700"
            }`}
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{warning.msg}</span>
            <button onClick={() => setWarning(null)} className="shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Compose Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-6">
          <form onSubmit={handlePost}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />

            <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={posting || !text.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-5">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
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
                  {post.likes} Likes
                </button>

                <button
                  onClick={() =>
                    setShowComments((s) => ({ ...s, [post.id]: !s[post.id] }))
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  <MessageCircle size={16} />
                  {post.comments} Comments
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
                      className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
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
      </div>
    </div>
  );
}