import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Image as ImageIcon,
  AlertTriangle,
  User,
  MoreVertical,
  Trash2,
  Flag
} from 'lucide-react';

export default function PostSystem() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      authorImage: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff",
      riskLevel: "GENUINE",
      content: "Just finished an amazing project on AI security! Really excited about the results. 🚀",
      timestamp: "2 hours ago",
      likes: 45,
      comments: 12,
      isLiked: false,
      commentsList: [
        { id: 1, user: "John Doe", text: "Awesome work!", time: "1h ago" },
        { id: 2, user: "Mike Wilson", text: "Can't wait to see it!", time: "30m ago" }
      ]
    },
    {
      id: 2,
      author: "Bot Suspect",
      authorImage: "https://ui-avatars.com/api/?name=Bot+User&background=ef4444&color=fff",
      riskLevel: "SUSPICIOUS",
      content: "Check out this amazing offer! Click here now!!!",
      timestamp: "5 minutes ago",
      likes: 2,
      comments: 0,
      isLiked: false,
      commentsList: []
    },
    {
      id: 3,
      author: "Alex Chen",
      authorImage: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981&color=fff",
      riskLevel: "GENUINE",
      content: "Beautiful sunset today 🌅 Nature never disappoints.",
      timestamp: "1 day ago",
      likes: 128,
      comments: 23,
      isLiked: true,
      commentsList: []
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [lastPostTime, setLastPostTime] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const handleCreatePost = (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) return;

    // Bot detection - rapid posting
    const now = Date.now();
    const timeSinceLastPost = lastPostTime ? (now - lastPostTime) / 1000 : 9999;
    
    if (timeSinceLastPost < 30 && postCount > 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }

    const post = {
      id: Date.now(),
      author: "John Doe",
      authorImage: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff",
      riskLevel: timeSinceLastPost < 30 ? "SUSPICIOUS" : "GENUINE",
      content: newPost,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      isLiked: false,
      commentsList: []
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setPostCount(postCount + 1);
    setLastPostTime(now);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleAddComment = (postId) => {
    if (!newComment[postId]?.trim()) return;

    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            comments: post.comments + 1,
            commentsList: [
              ...post.commentsList,
              {
                id: Date.now(),
                user: "John Doe",
                text: newComment[postId],
                time: "Just now"
              }
            ]
          }
        : post
    ));

    setNewComment({ ...newComment, [postId]: '' });
  };

  const getRiskBadge = (level) => {
    if (level === "GENUINE") return "bg-green-100 text-green-700";
    if (level === "SUSPICIOUS") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-sm text-gray-500">Share what's on your mind</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Bot Detection Alert */}
        {showAlert && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">⚠ Unusual activity detected</p>
              <p className="text-sm text-red-700">Rapid posting detected. Please slow down to avoid being flagged.</p>
            </div>
          </div>
        )}

        {/* Create Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-3">
              <img 
                src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff" 
                alt="User" 
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="3"
                />
                
                <div className="flex items-center justify-between mt-3">
                  <button 
                    type="button"
                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200">
            
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <img 
                    src={post.authorImage} 
                    alt={post.author} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{post.author}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(post.riskLevel)}`}>
                        {post.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <p className="mt-4 text-gray-800 leading-relaxed">{post.content}</p>

              {/* Suspicious Post Warning */}
              {post.riskLevel === "SUSPICIOUS" && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">This post may contain suspicious content</span>
                </div>
              )}
            </div>

            {/* Post Stats */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
            </div>

            {/* Post Actions */}
            <div className="px-6 py-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                  post.isLiked 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart 
                  className={`w-5 h-5 ${post.isLiked ? 'fill-red-600' : ''}`} 
                />
                <span className="font-medium">Like</span>
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Comment</span>
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <Flag className="w-5 h-5" />
                <span className="font-medium">Report</span>
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="px-6 pb-6 border-t border-gray-100">
                
                {/* Existing Comments */}
                <div className="mt-4 space-y-3">
                  {post.commentsList.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${comment.user}&background=6366f1&color=fff`}
                        alt={comment.user} 
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <p className="font-semibold text-sm">{comment.user}</p>
                        <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{comment.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4 flex gap-2">
                  <img 
                    src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff" 
                    alt="You" 
                    className="w-8 h-8 rounded-full"
                  />
                  <input
                    type="text"
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Write a comment..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <Send className="w-5 h-5" />
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