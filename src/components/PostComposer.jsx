// src/components/PostComposer.jsx
import { useState } from "react";

const PostComposer = ({ api }) => {
  const [text, setText] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePublish = async () => {
    if (!text.trim()) return;

    setPublishing(true);
    setMessage(null);

    try {
      const res = await api.post("/api/posts/publish", { text: text.trim() });
      setMessage({
        type: "success",
        text: `Post published${res.data.mockMode ? " (mock mode)" : ""}!`,
      });
      setText("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to publish post",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="table-card composer-card">
      <div className="table-header">
        <h2>Publish to Company Page</h2>
      </div>

      <div className="composer-body">
        <textarea
          className="composer-textarea"
          placeholder="Write a post for the company LinkedIn page..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={3000}
          disabled={publishing}
        />

        <div className="composer-footer">
          <span className="muted">{text.length} / 3,000</span>
          <button
            className="sync-btn composer-btn"
            onClick={handlePublish}
            disabled={publishing || !text.trim()}
          >
            {publishing ? "Publishing..." : "Publish Post"}
          </button>
        </div>

        {message && (
          <div className={`sync-message ${message.type}`}>{message.text}</div>
        )}
      </div>
    </div>
  );
};

export default PostComposer;
