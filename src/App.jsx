// src/App.jsx
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Leaderboard from "./components/Leaderboard";
import SyncStatus from "./components/SyncStatus";
import PostFeed from "./components/PostFeed";
import PostComposer from "./components/PostComposer";
import AdvocacySuggestions from "./components/AdvocacySuggestions";

// ---- API base (prod SWA -> Azure App Service) ----
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  window.__API_BASE__ ||
  "http://localhost:3003";

/* ---------------------------------- API ---------------------------------- */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

function setAuthHeader() {
  const token = localStorage.getItem("jwt");
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}
setAuthHeader();

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
const TABS = [
  { key: "leaderboard", label: "Leaderboard" },
  { key: "posts", label: "Company Posts" },
  { key: "publish", label: "Publish" },
  { key: "advocacy", label: "Advocacy" },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Capture ?token=... from redirect
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

  // Fetch engagement stats
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get("/api/engagement/stats")
      .then((res) => !cancelled && setStats(res.data))
      .catch(() => !cancelled && setStats(null));
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
      {/* Profile Card */}
      <div className="card profile-card">
        <div className="profile-header">
          <img
            src={`${API_BASE}/api/avatar/${user.sub}`}
            alt={user.name || "User"}
            className="profile-avatar"
            onError={(e) => (e.currentTarget.src = "/catLogoBlue.png")}
          />
          <div className="profile-info">
            <h1>{user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim()}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{stats.totalEmployees}</span>
              <span className="stat-label">Employees</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.engagedEmployees}</span>
              <span className="stat-label">Engaged</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalPosts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalReactions}</span>
              <span className="stat-label">Reactions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalComments}</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "leaderboard" && (
        <>
          <Leaderboard api={api} apiBase={API_BASE} />
          <SyncStatus api={api} />
        </>
      )}
      {activeTab === "posts" && <PostFeed api={api} apiBase={API_BASE} />}
      {activeTab === "publish" && <PostComposer api={api} />}
      {activeTab === "advocacy" && <AdvocacySuggestions api={api} apiBase={API_BASE} />}
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
