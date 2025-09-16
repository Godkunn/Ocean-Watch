import React, { useState } from 'react';

const SocialFeed = ({ posts, token }) => {
  const [keyword, setKeyword] = useState('');
  const [analyzedPosts, setAnalyzedPosts] = useState([]);

  const analyzePost = async (post) => {
    try {
      const response = await fetch('http://localhost:5000/api/social/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: post.text })
      });
      
      const analysis = await response.json();
      return { ...post, analysis };
    } catch (error) {
      console.error('Error analyzing post:', error);
      return { ...post, analysis: { sentiment: 'unknown', keywords: [], urgency: 'unknown' } };
    }
  };

  const handleAnalyzeAll = async () => {
    const analyzed = await Promise.all(posts.map(analyzePost));
    setAnalyzedPosts(analyzed);
  };

  const handleKeywordSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/social/posts?keyword=${keyword}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const filteredPosts = await response.json();
      setAnalyzedPosts(filteredPosts);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };

  return (
    <div className="social-feed">
      <h2>Social Media Analytics</h2>
      
      <div className="controls">
        <div className="keyword-search">
          <input
            type="text"
            placeholder="Search for keywords..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button onClick={handleKeywordSearch}>Search</button>
        </div>
        
        <button onClick={handleAnalyzeAll}>Analyze All Posts</button>
      </div>
      
      <div className="posts-list">
        {analyzedPosts.length > 0 ? (
          analyzedPosts.map(post => (
            <div key={post.id} className={`post ${post.analysis?.sentiment}`}>
              <div className="post-header">
                <span className="platform">{post.platform}</span>
                <span className="user">@{post.user}</span>
                <span className="timestamp">{new Date(post.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="post-content">
                <p>{post.text}</p>
              </div>
              
              {post.analysis && (
                <div className="post-analysis">
                  <div className={`sentiment ${post.analysis.sentiment}`}>
                    Sentiment: {post.analysis.sentiment}
                  </div>
                  <div className="urgency">
                    Urgency: {post.analysis.urgency}
                  </div>
                  <div className="keywords">
                    Keywords: {post.analysis.keywords.join(', ')}
                  </div>
                </div>
              )}
              
              <div className="post-location">
                Location: {post.location.latitude.toFixed(4)}, {post.location.longitude.toFixed(4)}
              </div>
            </div>
          ))
        ) : (
          posts.map(post => (
            <div key={post.id} className="post">
              <div className="post-header">
                <span className="platform">{post.platform}</span>
                <span className="user">@{post.user}</span>
                <span className="timestamp">{new Date(post.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="post-content">
                <p>{post.text}</p>
              </div>
              
              <div className="post-location">
                Location: {post.location.latitude.toFixed(4)}, {post.location.longitude.toFixed(4)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;