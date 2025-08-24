import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

const Home = () => (
  <div>
    <h1>LinkedIn OAuth2 Login</h1>
    <a href="/login">Login with LinkedIn</a>
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
    <div>
      <h1>Welcome, {user.given_name}</h1>
      <img src={user.picture} alt="Profile" />
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <a href="/logout">Logout</a>
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
