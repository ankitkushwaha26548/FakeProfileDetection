import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Send, MoreHorizontal } from "lucide-react";
import UserHeader from "../components/UserHeader";
import * as postApi from "../api/postApi";

const myId = () => { try { return JSON.parse(localStorage.getItem("user")||"{}").id; } catch { return null; } };

export default function SocialFeed() {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText]   = useState({});
  const uid = myId();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await postApi.getFeed();
      setPosts((data||[]).map(p => ({
        id: p._id,
        name: p.user?.name || "Unknown",
        initials: (p.user?.name||"U")[0].toUpperCase(),
        content: p.content,
        time: p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
        likes: Array.isArray(p.likes) ? p.likes.length : 0,
        comments: Array.isArray(p.comments) ? p.comments.length : 0,
        isLiked: Array.isArray(p.likes) && uid && p.likes.some(id => String(id)===String(uid)),
        commentsList: (p.comments||[]).map(c => ({
          id: c._id, user: c.user?.name||"User", text: c.text,
          time: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
        })),
      })));
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleLike = async (id) => {
    await postApi.likePost(id);
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likes: p.isLiked ? p.likes-1 : p.likes+1, isLiked: !p.isLiked } : p
    ));
    setTimeout(load, 300);
  };

  const handleComment = async (id) => {
    const text = commentText[id]?.trim();
    if (!text) return;
    await postApi.commentPost(id, { text });
    setCommentText(c => ({ ...c, [id]:"" }));
    setTimeout(load, 300);
  };

  return (
    <div className="min-h-screen bg-[#09090f]">
      <UserHeader />

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Loader */}
        {loading && (
          <div className="flex justify-center pt-16">
            <div className="w-6 h-6 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center pt-20">
            <Heart className="mx-auto mb-3 text-[#1e1e30]" size={40} />
            <p className="text-sm font-medium text-[#8a8a9e]">No posts yet</p>
            <p className="text-xs text-[#44445a] mb-5">Be the first to share something</p>
            <Link to="/post" className="px-4 py-2 bg-indigo-400 text-white rounded-md text-xs font-medium">
              Create a post
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <div key={post.id} className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div className="w-9 h-9 rounded-full bg-[#13131f] flex items-center justify-center text-xs font-semibold text-indigo-400">
                  {post.initials}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium text-[#e4e4ec]">{post.name}</div>
                  <div className="text-[11px] text-[#44445a]">{post.time}</div>
                </div>

                <button className="text-[#44445a] p-1 rounded hover:bg-[#13131f]">
                  <MoreHorizontal size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-4">
                <p className="text-sm text-[#c4c4d0] leading-relaxed">{post.content}</p>
              </div>

              {/* Stats */}
              <div className="flex justify-between px-4 py-2 border-t border-[#13131f] text-xs text-[#44445a]">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>

              {/* Actions */}
              <div className="flex border-t border-[#13131f] text-xs font-medium">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 transition ${
                    post.isLiked ? "text-red-400" : "text-[#44445a]"
                  }`}
                >
                  <Heart size={13} fill={post.isLiked ? "#f87171" : "none"} />
                  Like
                </button>

                <button
                  onClick={() => setShowComments(s => ({ ...s, [post.id]:!s[post.id] }))}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-[#44445a]"
                >
                  <MessageCircle size={13} />
                  Comment
                </button>

                <button className="flex-1 flex items-center justify-center gap-1 py-2 text-[#44445a]">
                  <Share2 size={13} />
                  Share
                </button>
              </div>

              {/* Comments */}
              {showComments[post.id] && (
                <div className="bg-[#09090f] border-t border-[#13131f] px-4 py-3">

                  {post.commentsList.map(c => (
                    <div key={c.id} className="flex gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-[#13131f] flex items-center justify-center text-[10px] font-semibold text-indigo-400">
                        {c.user[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 bg-[#0e0e1a] border border-[#1e1e30] rounded-md px-3 py-1">
                        <div className="text-[11px] font-semibold text-[#8a8a9e]">{c.user}</div>
                        <div className="text-xs text-[#c4c4d0]">{c.text}</div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-2">
                    <input
                      value={commentText[post.id]||""}
                      placeholder="Write a comment…"
                      onChange={e => setCommentText(c => ({ ...c, [post.id]:e.target.value }))}
                      onKeyDown={e => e.key==="Enter" && handleComment(post.id)}
                      className="flex-1 bg-[#0e0e1a] border border-[#1e1e30] rounded-full px-4 py-2 text-xs text-[#e4e4ec] outline-none"
                    />

                    <button onClick={() => handleComment(post.id)} className="text-indigo-400 p-1">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Refresh */}
        {posts.length > 0 && (
          <div className="text-center pt-3">
            <button
              onClick={load}
              className="px-4 py-2 bg-[#0e0e1a] border border-[#1e1e30] rounded-md text-xs text-[#44445a]"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}