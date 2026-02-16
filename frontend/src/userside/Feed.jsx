import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreVertical,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';

export default function FeedSystem() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff",
        riskLevel: "GENUINE"
      },
      content: "Just completed my first AI project! The results are amazing. Thanks to everyone who helped me along the way. 🚀✨",
      timestamp: "2 hours ago",
      likes: 124,
      comments: 18,
      shares: 5,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      user: {
        name: "Mike Thompson",
        image: "https://ui-avatars.com/api/?name=Mike+Thompson&background=10b981&color=fff",
        riskLevel: "GENUINE"
      },
      content: "Beautiful sunset at the beach today 🌅 Nature never ceases to amaze me!",
      timestamp: "4 hours ago",
      likes: 89,
      comments: 12,
      shares: 3,
      isLiked: true,
      isBookmarked: false
    },
    {
      id: 3,
      user: {
        name: "SuspiciousBot123",
        image: "https://ui-avatars.com/api/?name=SB&background=eab308&color=fff",
        riskLevel: "SUSPICIOUS"
      },
      content: "🔥🔥 AMAZING OFFER!!! Click here for FREE rewards NOW!! Limited time only! Don't miss out!!! 💰💰💰",
      timestamp: "10 minutes ago",
      likes: 2,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 4,
      user: {
        name: "Alex Chen",
        image: "https://ui-avatars.com/api/?name=Alex+Chen&background=10b981&color=fff",
        riskLevel: "GENUINE"
      },
      content: "Had an incredible meeting with the team today. Innovation happens when great minds collaborate! 💡",
      timestamp: "1 day ago",
      likes: 156,
      comments: 24,
      shares: 8,
      isLiked: false,
      isBookmarked: true
    },
    {
      id: 5,
      user: {
        name: "FakeAccount999",
        image: "https://ui-avatars.com/api/?name=FA&background=ef4444&color=fff",
        riskLevel: "FAKE"
      },
      content: "WIN BIG MONEY NOW!!! 💵💵💵 GUARANTEED RETURNS!!! CLICK LINK IN BIO!!! ACT FAST!!!",
      timestamp: "3 minutes ago",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 6,
      user: {
        name: "Emma Wilson",
        image: "https://ui-avatars.com/api/?name=Emma+Wilson&background=10b981&color=fff",
        riskLevel: "GENUINE"
      },
      content: "Learning something new every day keeps the mind sharp. Today's topic: Machine Learning algorithms 📚",
      timestamp: "2 days ago",
      likes: 201,
      comments: 31,
      shares: 12,
      isLiked: true,
      isBookmarked: true
    },
    {
      id: 7,
      user: {
        name: "SpamBot2024",
        image: "https://ui-avatars.com/api/?name=SB&background=eab308&color=fff",
        riskLevel: "SUSPICIOUS"
      },
      content: "Check out this website for instant cash! Everyone is doing it! Join now before it's too late!",
      timestamp: "1 hour ago",
      likes: 1,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false
    }
  ]);

  const [showComments, setShowComments] = useState({});

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

  const handleBookmark = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
          <p className="text-sm text-gray-500">AI-powered security monitoring</p>
        </div>
      </div>

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
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${getPostBorderColor(post.user.riskLevel)}`}
            >
              
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
                
                {/* Like Button */}
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${
                    post.isLiked 
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-1 justify-center"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Comment</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-1 justify-center">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium text-sm">Share</span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`p-2 rounded-lg transition-all ${
                    post.isBookmarked 
                      ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark 
                    className={`w-5 h-5 ${post.isBookmarked ? 'fill-indigo-600' : ''}`} 
                  />
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="mt-4 flex gap-2">
                    <img 
                      src="https://ui-avatars.com/api/?name=You&background=6366f1&color=fff" 
                      alt="You" 
                      className="w-8 h-8 rounded-full"
                    />
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="text-indigo-600 hover:text-indigo-700 p-2">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Load More Posts
          </button>
        </div>

      </div>
    </div>
  );
}