import './Dashboard.css';
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

const Home = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0E2F25",
    color: "white",
  }}>
    <h1 style={{ color: "#0AEF84" }}>Welcome to Catalyst</h1>
    <a
      href="/login"
      style={{
        backgroundColor: "#0AEF84",
        padding: "1rem 2rem",
        borderRadius: "8px",
        textDecoration: "none",
        color: "#0D1A13",
        fontWeight: "bold",
        marginTop: "1rem",
      }}
    >
      Login with LinkedIn
    </a>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("/api/user", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(false));
  }, []);

  if (user === null) return <p>Loading...</p>;
  if (user === false) return <Navigate to="/" />;

  return (
    <div className="dashboard-container">
      <div className="card">
        <img src={user.picture} alt={user.name} />
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <button className="logout-btn" onClick={() => window.location.href = '/logout'}>
          Logout
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
