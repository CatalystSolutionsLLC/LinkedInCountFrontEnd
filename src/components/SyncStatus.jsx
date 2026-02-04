// src/components/SyncStatus.jsx
import { useState, useEffect } from "react";

const SyncStatus = ({ api }) => {
  const [status, setStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/api/sync/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [api]);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const res = await api.post("/api/sync/trigger");
      setMessage({
        type: "success",
        text: `Sync complete: ${res.data.postsProcessed} posts, ${res.data.engagementsFound} engagements${res.data.mockMode ? " (mock mode)" : ""}`,
      });
      fetchStatus();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Sync failed",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const lastSync = status?.logs?.[0];

  return (
    <div className="sync-card">
      <div className="sync-header">
        <h3>LinkedIn Sync</h3>
        {status?.mockMode && <span className="badge mock">Mock Mode</span>}
      </div>

      <div className="sync-info">
        {lastSync ? (
          <div className="last-sync">
            <span className="sync-label">Last sync:</span>
            <span className={`sync-status ${lastSync.status.toLowerCase()}`}>
              {lastSync.status}
            </span>
            <span className="sync-time">{formatDate(lastSync.startedAt)}</span>
            <span className="sync-stats">
              {lastSync.postsProcessed} posts, {lastSync.engagementsFound} engagements
            </span>
          </div>
        ) : (
          <p className="muted">No sync history</p>
        )}
      </div>

      {message && (
        <div className={`sync-message ${message.type}`}>{message.text}</div>
      )}

      <button
        className="sync-btn"
        onClick={handleSync}
        disabled={syncing}
      >
        {syncing ? "Syncing..." : "Sync Now"}
      </button>

      {status?.logs?.length > 1 && (
        <details className="sync-history">
          <summary>Recent sync history</summary>
          <ul>
            {status.logs.slice(1, 5).map((log) => (
              <li key={log.id}>
                <span className={`sync-status ${log.status.toLowerCase()}`}>
                  {log.status}
                </span>
                <span>{formatDate(log.startedAt)}</span>
                <span className="muted">
                  {log.postsProcessed}p / {log.engagementsFound}e
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

export default SyncStatus;
