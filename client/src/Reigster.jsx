import { useState } from "react";
import api from "./services/api";
import { useNavigate } from "react-router";
import './styles/Auth.css'; // Import the same CSS

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await api.post("/auth/register", { username, email, password });
      localStorage.setItem("besafe_user", JSON.stringify(response.data.user));
      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">🛡️</div>
        <h2 className="auth-title">BeSafe</h2>
        <p className="auth-subtitle">Create your account to get started</p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <div className="input-group">
          <label className="input-label">Username</label>
          <input className="auth-input" value={username} placeholder="e.g. QueenB" onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input className="auth-input" value={email} placeholder="name@example.com" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="auth-input" type="password" value={password} placeholder="........" onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="auth-button" onClick={handleRegister}>Create Account</button>

        <div className="auth-footer">
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Already have an account?</p>
          <button className="auth-link" onClick={() => navigate("/")}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}

export default Register;