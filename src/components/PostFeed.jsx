// src/components/PostFeed.jsx
import { useState, useEffect } from "react";

const PostFeed = ({ api, apiBase }) => {
  const [posts, setPosts] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFields, setShowFields] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/posts")
      .then((res) => !cancelled && setPosts(res.data))
      .catch(() => !cancelled && setPosts([]));
    return () => { cancelled = true; };
  }, [api]);

  const togglePost = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      setEngagementData(null);
      setShowFields(false);
      return;
    }

    setExpandedPost(postId);
    setEngagementData(null);
    setLoadingDetail(true);
    setShowFields(false);

    try {
      const res = await api.get(`/api/posts/${encodeURIComponent(postId)}/engagements`);
      setEngagementData(res.data);
    } catch (err) {
      console.error("Failed to load engagements:", err);
      setEngagementData({ engagements: [], accessibleFields: [], totalCount: 0 });
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  if (posts === null) {
    return (
      <div className="table-card">
        <div className="table-header"><h2>Company Posts</h2></div>
        <p className="muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="table-card post-feed-card">
      <div className="table-header">
        <h2>Company Posts</h2>
        <span className="muted">{posts.length} posts</span>
      </div>

      {posts.length === 0 && (
        <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>
          No posts yet. Run a sync or publish a post.
        </p>
      )}

      <div className="post-list">
        {posts.map((post) => (
          <div key={post.postId} className="post-card">
            <div
              className="post-summary"
              onClick={() => togglePost(post.postId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && togglePost(post.postId)}
            >
              <div className="post-text">
                {post.text
                  ? post.text.length > 140
                    ? post.text.slice(0, 140) + "..."
                    : post.text
                  : "(No text)"}
              </div>
              <div className="post-meta">
                <span className="post-date">{formatDate(post.publishedAt)}</span>
                <span className="post-counts">
                  {post.reactionCount || 0} reactions &middot; {post.commentCount || 0} comments
                </span>
                {post.source === "published" && (
                  <span className="badge ok">Published</span>
                )}
              </div>
              <span className="post-expand-icon">
                {expandedPost === post.postId ? "\u25B2" : "\u25BC"}
              </span>
            </div>

            {expandedPost === post.postId && (
              <div className="post-detail">
                {loadingDetail ? (
                  <div className="loading-bar" />
                ) : engagementData ? (
                  <>
                    <div className="detail-header">
                      <h3>Engagements ({engagementData.totalCount})</h3>
                      <button
                        className="period-btn"
                        onClick={(e) => { e.stopPropagation(); setShowFields(!showFields); }}
                      >
                        {showFields ? "Hide" : "Data"} Transparency
                      </button>
                    </div>

                    {showFields && (
                      <div className="data-transparency-panel">
                        <h4>Accessible Member Data Fields</h4>
                        <ul>
                          {engagementData.accessibleFields.map((f) => (
                            <li key={f.field}>
                              <strong>{f.field}</strong>: {f.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {engagementData.engagements.length === 0 ? (
                      <p className="muted">No engagements recorded yet.</p>
                    ) : (
                      <div className="engagement-list">
                        {engagementData.engagements.map((eng, i) => (
                          <div key={i} className="engagement-row">
                            <img
                              src={`${apiBase}/api/avatar/${eng.sub}`}
                              alt={eng.name}
                              className="eng-avatar"
                              onError={(e) => (e.currentTarget.src = "/catLogoBlue.png")}
                            />
                            <div className="eng-info">
                              <span className="eng-name">{eng.name || "Unknown"}</span>
                              <span className="eng-email">{eng.email || ""}</span>
                            </div>
                            <div className="eng-type">
                              <span className={`badge ${eng.engagementType === "REACTION" ? "ok" : "no"}`}>
                                {eng.engagementType === "REACTION"
                                  ? eng.reactionType || "LIKE"
                                  : "COMMENT"}
                              </span>
                            </div>
                            <span className="eng-date">{formatDate(eng.engagedAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
