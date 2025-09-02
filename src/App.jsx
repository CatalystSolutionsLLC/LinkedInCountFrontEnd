// src/App.jsx
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// ---- API base (prod SWA -> Azure App Service) ----
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  window.__API_BASE__ || // optional global override if ever needed
  "http://localhost:3003";

// One axios instance for the whole app
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send/receive session cookie
});

/* ------------------------- NEW: UsersTable component ------------------------- */
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
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
                <td>
                  <span className={`badge ${u.emailVerified ? "ok" : "no"}`}>
                    {u.emailVerified ? "verified" : "unverified"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
/* --------------------------------------------------------------------------- */

// ---------- Pages ----------
const Home = () => (
  <div className="page-center">
    <div className="card login-card">
      <img
        src="/catLogo.png"
        alt="Catalyst logo"
        className="brand-logo"
      />

      <h1 className="title">Catalyst Engagment HQ</h1>
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

/* --------------- UPDATED: Dashboard now fetches and shows users --------------- */
const Dashboard = () => {
  const [user, setUser] = useState(null);   // null = loading, false = not logged in
  const [users, setUsers] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/user")
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        if (!cancelled) setUser(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return; // wait until logged in
    let cancelled = false;
    api
      .get("/api/users?limit=50")
      .then((res) => !cancelled && setUsers(res.data))
      .catch(() => !cancelled && setUsers([]));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user === null) return <div className="page-center"><p>Loading...</p></div>;
  if (user === false) return <Navigate to="/" replace />;

  return (
    <div className="dashboard-container">
      <div className="card">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || "User"}
            style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <h1>{user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim()}</h1>

        <button
          className="logout-btn"
          onClick={() => (window.location.href = `${API_BASE}/logout`)}
        >
          Logout
        </button>
      </div>

      {/* Users table */}
      <UsersTable users={users ?? []} />
    </div>
  );
};
/* --------------------------------------------------------------------------- */

// ---------- App Router ----------
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
// Ver 0.1.2
