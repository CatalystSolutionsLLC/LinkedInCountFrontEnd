// src/components/Leaderboard.jsx
import { useState, useEffect } from "react";

const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "quarter", label: "Quarter" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

const Leaderboard = ({ api, apiBase }) => {
  const [users, setUsers] = useState(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get(`/api/engagement/leaderboard?period=${period}`)
      .then((res) => {
        if (!cancelled) setUsers(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err);
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, period]);

  if (users === null) {
    return (
      <div className="table-card">
        <div className="table-header">
          <h2>Engagement Leaderboard</h2>
        </div>
        <p className="muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>Engagement Leaderboard</h2>
        <div className="period-filter">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`period-btn ${period === p.value ? "active" : ""}`}
              onClick={() => setPeriod(p.value)}
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading-bar" />}

      <div className="table-scroll">
        <table className="nice-table">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th>Employee</th>
              <th className="numeric">Reactions</th>
              <th className="numeric">Comments</th>
              <th className="numeric">Total</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const rank = idx + 1;
              const medal =
                rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : null;

              return (
                <tr key={u.sub} className={medal ? `rank-${medal}` : ""}>
                  <td className="rank-col">
                    {medal ? (
                      <span className={`medal ${medal}`}>{rank}</span>
                    ) : (
                      <span className="rank-num">{rank}</span>
                    )}
                  </td>
                  <td>
                    <div className="user-pill">
                      <img
                        src={`${apiBase}/api/avatar/${u.sub}`}
                        alt={u.name || u.email || "User"}
                        onError={(e) => (e.currentTarget.src = "/catLogoBlue.png")}
                      />
                      <div className="user-info">
                        <span className="user-name">{u.name || "Unnamed"}</span>
                        <span className="user-email">{u.email || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td className="numeric">{u.reactions || 0}</td>
                  <td className="numeric">{u.comments || 0}</td>
                  <td className="numeric total-cell">{u.total || 0}</td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="muted" style={{ textAlign: "center" }}>
                  No engagement data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
