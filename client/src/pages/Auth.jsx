import { useState } from "react";
import { Navigate } from "react-router-dom";

const API = "http://localhost:5000/api/auth";

function Auth({ token, onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelect, setRoleSelect] = useState("resident");
  const [message, setMessage] = useState("");

  if (token) {
    return <Navigate to="/proposals" replace />;
  }

  const handleRegister = async (event) => {
    event.preventDefault();
    const response = await fetch(API + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, role: roleSelect }),
    });

    const data = await response.json();
    setMessage(JSON.stringify(data, null, 2));
    if (data.token) {
      localStorage.setItem("token", data.token);
      if (data.role) localStorage.setItem("role", data.role);
      onLogin(data.token, data.role);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const response = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setMessage(JSON.stringify(data, null, 2));

    if (data.token) {
      localStorage.setItem("token", data.token);
      if (data.role) localStorage.setItem("role", data.role);
      onLogin(data.token, data.role);
    }
  };

  return (
    <div className="auth-page">
      <h1>Neer Login</h1>
      <div className="auth-toggle">
        <button type="button" onClick={() => setMode("login")}>Login</button>
        <button type="button" onClick={() => setMode("register")}>Register</button>
      </div>
      {mode === "register" ? (
        <form onSubmit={handleRegister} className="auth-form">
          <h2>Register</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
            <select value={roleSelect} onChange={(e) => setRoleSelect(e.target.value)}>
              <option value="resident">Resident</option>
              <option value="committee">Committee Member</option>
              <option value="staff">Staff</option>
            </select>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Register</button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="auth-form">
          <h2>Login</h2>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>
      )}
      <pre>{message}</pre>
    </div>
  );
}

export default Auth;
