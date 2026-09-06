import { useState } from "react";
import { Navigate } from "react-router-dom";
import API_URL from "../config/api";

// const API = "http://localhost:5000/api/auth";

function Auth({ token, onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelect, setRoleSelect] = useState("resident");
  const [flatNumber, setFlatNumber] = useState("");
  const [message, setMessage] = useState("");

  if (token) {
    // return <Navigate to="/proposals" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (event) => {
    event.preventDefault();
    // const response = await fetch(API + "/register", {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, role: roleSelect, flatNumber }),
    });

    const data = await response.json();
    setMessage(JSON.stringify(data, null, 2));
    if (data.token) {
      localStorage.setItem("token", data.token);
      if (data.role) localStorage.setItem("role", data.role);
      if (data._id) localStorage.setItem("userId", data._id);
      onLogin(data.token, data.role);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    // const response = await fetch(API + "/login", {
    const response = await fetch(`${API_URL}/api/auth/login`, {
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
      if (data._id) localStorage.setItem("userId", data._id);
      onLogin(data.token, data.role);
    }
  };

  return (
    <div className="auth-page nx auth-page-shell">
      <div className="auth-layout">
        <aside className="auth-intro">
          <div className="auth-brand">
            <span className="auth-brand-mark">N</span>
            <div>
              <p className="auth-brand-name">NEER</p>
              <p className="auth-brand-tagline">Life together, made simpler.</p>
            </div>
          </div>
          <div className="auth-intro-copy">
            <p className="auth-eyebrow">Your community, connected</p>
            <h1>{mode === "register" ? "Make your building feel closer." : "Welcome back to your community."}</h1>
            <p>{mode === "register" ? "Create your NEER account to stay connected with the people and services around you." : "Sign in to keep up with your building, your neighbours, and the things that matter at home."}</p>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-toggle">
            <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>Login</button>
            <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>Register</button>
          </div>
          {mode === "register" ? (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="auth-form-heading">
                <p className="auth-eyebrow">New to NEER</p>
                <h2>Create your account</h2>
                <p>Set up your profile in a few simple steps.</p>
              </div>
              <label htmlFor="register-username">Username</label>
              <input id="register-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" />
              <label htmlFor="register-role">Account type</label>
              <select id="register-role" value={roleSelect} onChange={(e) => { setRoleSelect(e.target.value); if (e.target.value === "staff") setFlatNumber(""); }}>
                <option value="resident">Resident</option>
                <option value="committee">Committee Member</option>
                <option value="staff">Staff</option>
              </select>
              {roleSelect !== "staff" && (
                <>
                  <label htmlFor="register-flat">Flat number</label>
                  <input
                    id="register-flat"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 10-A"
                    pattern="[0-9]+-[A-Z]"
                    title="Use the format 10-A"
                    required
                  />
                </>
              )}
              <label htmlFor="register-email">Email address</label>
              <input id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <label htmlFor="register-password">Password</label>
              <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
              <p className="auth-role-note">{roleSelect === "resident" ? "Stay connected with your building." : roleSelect === "committee" ? "Help shape your community." : "Keep building operations moving."}</p>
              <button type="submit">Register</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-form-heading">
                <p className="auth-eyebrow">Good to see you</p>
                <h2>Sign in to NEER</h2>
                <p>Your building is waiting for you.</p>
              </div>
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
              <button type="submit">Login</button>
            </form>
          )}
          <p className="auth-secure-note"><span aria-hidden="true">●</span> Your account details stay protected.</p>
        </section>
      </div>
      <pre>{message}</pre>
    </div>
  );
}

export default Auth;
