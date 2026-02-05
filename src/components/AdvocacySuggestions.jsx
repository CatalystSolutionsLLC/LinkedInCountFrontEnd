// src/components/AdvocacySuggestions.jsx
import { useState, useEffect } from "react";

const AdvocacySuggestions = ({ api, apiBase }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get("/api/advocacy/suggestions");
      setSuggestions(res.data);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/advocacy/stats");
      setStats(res.data);
    } catch {
      setStats(null);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchStats();
  }, [api]);

  const handleShare = async (postId, postText) => {
    // Record the share in our DB
    try {
      await api.post("/api/advocacy/share", { postId });
    } catch (err) {
      console.error("Failed to record share:", err);
    }

    // Open LinkedIn share-offsite intent
    // Uses the post text as a pre-filled share — user can edit in LinkedIn's compose window
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://www.linkedin.com"
    )}&summary=${encodeURIComponent(postText || "")}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");

    // Refresh suggestions to show updated share status
    fetchSuggestions();
    fetchStats();
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(undefined, {
      month: "short", day: "numeric",
    });
  };

  if (suggestions === null) {
    return (
      <div className="table-card">
        <div className="table-header"><h2>Employee Advocacy</h2></div>
        <p className="muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="table-card advocacy-card">
      <div className="table-header">
        <h2>Employee Advocacy</h2>
        <span className="muted">Share company posts</span>
      </div>

      {/* Advocacy stats summary */}
      {stats && (
        <div className="advocacy-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.totalShares}</span>
            <span className="stat-label">Total Shares</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.activeAdvocates}</span>
            <span className="stat-label">Advocates</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.postsAvailable}</span>
            <span className="stat-label">Posts Available</span>
          </div>
        </div>
      )}

      {/* Top advocates */}
      {stats?.topAdvocates?.length > 0 && (
        <div className="top-advocates">
          <h4>Top Advocates</h4>
          <div className="advocate-list">
            {stats.topAdvocates.map((adv) => (
              <div key={adv.sub} className="advocate-pill">
                <img
                  src={`${apiBase}/api/avatar/${adv.sub}`}
                  alt={adv.name}
                  className="advocate-avatar"
                  onError={(e) => (e.currentTarget.src = "/catLogoBlue.png")}
                />
                <span className="advocate-name">{adv.name}</span>
                <span className="badge ok">{adv.shareCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested posts to share */}
      <div className="suggestion-list">
        {suggestions.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>
            No posts available for sharing yet.
          </p>
        )}

        {suggestions.map((post) => (
          <div key={post.postId} className="suggestion-card">
            <div className="suggestion-text">
              {post.text
                ? post.text.length > 200
                  ? post.text.slice(0, 200) + "..."
                  : post.text
                : "(No text)"}
            </div>
            <div className="suggestion-footer">
              <span className="post-date">{formatDate(post.publishedAt)}</span>
              <span className="muted">{post.totalShares || 0} shares</span>
              {post.alreadyShared ? (
                <span className="badge ok">Shared</span>
              ) : (
                <button
                  className="share-btn"
                  onClick={() => handleShare(post.postId, post.text)}
                >
                  Share to LinkedIn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvocacySuggestions;
