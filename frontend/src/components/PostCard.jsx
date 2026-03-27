import React, { useState } from "react";

function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState("");

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">

      {/* User */}
      <h3 className="font-bold text-indigo-400">
        {post.user?.name || "User"}
      </h3>

      {/* Content */}
      <p className="text-gray-200">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <button onClick={() => onLike(post._id)}>
          ❤️ {post.likes.length}
        </button>

        <span>💬 {post.comments.length}</span>
      </div>

      {/* Comments */}
      <div className="space-y-1">
        {post.comments.map((c, i) => (
          <p key={i} className="text-xs text-gray-400">
            <span className="text-indigo-400">{c.user?.name}:</span> {c.text}
          </p>
        ))}
      </div>

      {/* Add Comment */}
      <div className="flex gap-2 mt-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add comment..."
          className="flex-1 bg-gray-800 px-3 py-2 rounded-lg text-sm"
        />
        <button
          onClick={() => {
            onComment(post._id, commentText);
            setCommentText("");
          }}
          className="bg-indigo-600 px-3 rounded-lg text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default PostCard;