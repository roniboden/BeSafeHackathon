import { useState } from 'react';
import api from './services/api'; 
import { useNavigate } from 'react-router';
import './styles/Auth.css'; // Import the new CSS

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('besafe_user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">🛡️</div>
        <h2 className="auth-title">BeSafe</h2>
        <p className="auth-subtitle">Enter your details to access your dashboard</p>

        {error && <p className="error-msg">{error}</p>}

        <div className="input-group">
          <label className="input-label">Username</label>
          <input className="auth-input" placeholder="e.g. QueenB" onChange={e => setUsername(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="auth-input" type="password" placeholder="........" onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-button" onClick={handleLogin}>Enter Dashboard</button>

        <div className="auth-footer">
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>New here?</p>
          <button className="auth-link" onClick={() => navigate("/register")}>Create an account</button>
        </div>
      </div>
    </div>
  );
}

export default Login;