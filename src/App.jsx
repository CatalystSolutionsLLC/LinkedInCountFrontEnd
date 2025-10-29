// src/App.jsx
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// ---- API base (prod SWA -> Azure App Service) ----
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  window.__API_BASE__ ||
  "http://localhost:3003";

/* ---------------------------------- API ---------------------------------- */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // not needed for JWT
});

function setAuthHeader() {
  const token = localStorage.getItem("jwt");
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}
setAuthHeader();

/* ------------------------- UsersTable Component -------------------------- */
const UsersTable = ({ users }) => {
  if (!users?.length) {
    return (
      <div className="table-card">
        <div className="table-header">
          <h2>Team members</h2>
          <span className="muted">0</span>
        </div>
        <p className="muted">No other users yet.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>Team members</h2>
        <span className="muted">{users.length}</span>
      </div>

      <div className="table-scroll">
        <table className="nice-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th className="numeric">Reactions</th>
              <th className="numeric">Comments</th>
              <th className="numeric">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const reactions = u.reactions ?? 0;
              const comments = u.comments ?? 0;
              const total = reactions + comments;

              return (
                <tr key={u.sub}>
                  <td>
                    <div className="user-pill">
                      <img
                        src={u.picture || "/catLogoBlue.png"}
                        alt={u.name || u.email || "User"}
                        onError={(e) => (e.currentTarget.src = "/catLogoBlue.png")}
                      />
                      <span>{u.name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="mono">{u.email || "—"}</td>
                  <td className="numeric">{reactions}</td>
                  <td className="numeric">{comments}</td>
                  <td className="numeric total-cell">{total}</td>
                  <td>
                    <span className={`badge ${u.emailVerified ? "ok" : "no"}`}>
                      {u.emailVerified ? "verified" : "unverified"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------------------------- Home ---------------------------------- */
const Home = () => (
  <div className="page-center">
    <div className="card login-card">
      <img src="/catLogo.png" alt="Catalyst logo" className="brand-logo" />
      <h1 className="title">Catalyst Engagement HQ</h1>
      <p className="subtitle">Sign in to continue</p>

      <a
        className="login-graphic"
        href={`${API_BASE}/login`}
        aria-label="Sign in with LinkedIn"
      >
        <img
          src="/signin-button.png"
          alt="Sign in with LinkedIn"
          width="280"
          height="44"
          loading="eager"
          decoding="sync"
        />
      </a>
    </div>
  </div>
);

/* ------------------------------ Dashboard ------------------------------ */
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(null);

  // ✅ Capture ?token=... from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("jwt", token);
      setAuthHeader();
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/user")
      .then((res) => !cancelled && setUser(res.data))
      .catch(() => !cancelled && setUser(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch all users
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get("/api/users?limit=50")
      .then((res) => !cancelled && setUsers(res.data))
      .catch(() => !cancelled && setUsers([]));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user === null)
    return (
      <div className="page-center">
        <p>Loading...</p>
      </div>
    );
  if (user === false) return <Navigate to="/" replace />;

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setAuthHeader();
    window.location.href = `${API_BASE}/logout`;
  };

  return (
    <div className="dashboard-container">
      <div className="card">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || "User"}
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}
        <h1>{user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim()}</h1>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Users table */}
      <UsersTable users={users ?? []} />
    </div>
  );
};

/* ---------------------------------- Router ---------------------------------- */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
// Ver 0.3.0
