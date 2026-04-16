import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, AlertTriangle, X } from "lucide-react";
import UserHeader from "../components/UserHeader";
import * as postApi from "../api/postApi";
import * as detectionApi from "../api/detectionApi";

const myId = () => { try { return JSON.parse(localStorage.getItem("user")||"{}").id; } catch { return null; } };

export default function Post() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText]       = useState("");
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText]   = useState({});
  const [warning, setWarning] = useState(null);
  const timer = useRef(null);
  const uid = myId();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await postApi.getFeed();
      setPosts((data||[]).map(p => ({
        id:p._id, name:p.user?.name||"Unknown",
        initials:(p.user?.name||"U")[0].toUpperCase(),
        content:p.content,
        time:p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
        likes: Array.isArray(p.likes) ? p.likes.length : 0,
        comments: Array.isArray(p.comments) ? p.comments.length : 0,
        isLiked: Array.isArray(p.likes) && uid && p.likes.some(id => String(id)===String(uid)),
        commentsList:(p.comments||[]).map(c => ({
          id:c._id, user:c.user?.name||"User", text:c.text,
        })),
      })));
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
      await postApi.createPost({ content:text.trim() });
      setText("");
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        const r = await detectionApi.getMyRisk();
        if (r.data?.level) showWarn(r.data.level,
          r.data.level === "FAKE" ? "Your account has been flagged for unusual activity."
          : "Unusual activity detected. Slow down to stay in good standing.");
      } catch {}
      load();
    } finally { setPosting(false); }
  };

  const handleLike = async (id) => {
    await postApi.likePost(id);
    setPosts(prev => prev.map(p =>
      p.id===id ? { ...p, likes:p.isLiked?p.likes-1:p.likes+1, isLiked:!p.isLiked } : p
    ));
    setTimeout(load, 300);
  };

  const handleComment = async (id) => {
    const t = commentText[id]?.trim();
    if (!t) return;
    await postApi.commentPost(id, { text:t });
    setCommentText(c => ({ ...c,[id]:"" }));
    setTimeout(load, 300);
  };

  return (
    <div className="min-h-screen bg-[#09090f]">
      <UserHeader />

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Warning */}
        {warning && (
          <div className={`flex items-start gap-2 px-3 py-2 rounded-md mb-4 text-xs
            ${warning.level==="FAKE" ? "bg-red-400/10 border border-red-400/30 text-red-400"
                                    : "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"}`}>
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span className="flex-1">{warning.msg}</span>
            <button onClick={() => setWarning(null)}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Compose */}
        <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl p-4 mb-4">
          <form onSubmit={handlePost}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full bg-transparent outline-none text-sm text-[#e4e4ec] resize-none min-h-17.5"
            />

            <div className="flex justify-end mt-2 pt-2 border-t border-[#13131f]">
              <button
                type="submit"
                disabled={posting || !text.trim()}
                className="px-4 py-1.5 bg-indigo-400 rounded-md text-xs font-medium text-white flex items-center gap-1 disabled:opacity-50"
              >
                <Send size={12} />
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Posts */}
        {posts.map(post => (
          <div key={post.id} className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl mb-3 overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
              <div className="w-8 h-8 rounded-full bg-[#13131f] flex items-center justify-center text-xs font-semibold text-indigo-400">
                {post.initials}
              </div>

              <div className="flex-1">
                <div className="text-sm text-[#e4e4ec] font-medium">{post.name}</div>
                <div className="text-[11px] text-[#44445a]">{post.time}</div>
              </div>

              <button className="text-[#44445a]">
                <MoreHorizontal size={13} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <p className="text-sm text-[#c4c4d0] leading-relaxed">{post.content}</p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-[#13131f] text-xs">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 font-medium
                  ${post.isLiked ? "text-red-400" : "text-[#44445a]"}`}
              >
                <Heart size={12} fill={post.isLiked ? "#f87171" : "none"} />
                {post.likes} Likes
              </button>

              <button
                onClick={() => setShowComments(s => ({ ...s,[post.id]:!s[post.id] }))}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-[#44445a] font-medium"
              >
                <MessageCircle size={12} />
                {post.comments} Comments
              </button>
            </div>

            {/* Comments */}
            {showComments[post.id] && (
              <div className="bg-[#09090f] border-t border-[#13131f] px-4 py-3">
                {post.commentsList.map(c => (
                  <div key={c.id} className="flex gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#13131f] flex items-center justify-center text-[10px] font-semibold text-indigo-400">
                      {c.user[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 bg-[#0e0e1a] border border-[#1e1e30] rounded-md px-2 py-1">
                      <div className="text-[10px] text-[#44445a] font-semibold">{c.user}</div>
                      <div className="text-xs text-[#c4c4d0]">{c.text}</div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-2">
                  <input
                    value={commentText[post.id]||""}
                    placeholder="Comment…"
                    onChange={e => setCommentText(c => ({ ...c,[post.id]:e.target.value }))}
                    onKeyDown={e => e.key==="Enter" && handleComment(post.id)}
                    className="flex-1 bg-[#0e0e1a] border border-[#1e1e30] rounded-full px-3 py-1.5 text-xs text-[#e4e4ec] outline-none"
                  />

                  <button onClick={() => handleComment(post.id)} className="text-indigo-400">
                    <Send size={13} />
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