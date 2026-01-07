import { useState } from 'react';
import api from './services/api'; 
import { useNavigate } from 'react-router';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // New state for error messages
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(''); // Clear previous errors before trying again
    
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('besafe_user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      // Check if the backend sent a specific message, otherwise use a default
      const message = err.response?.data?.message || "Something went wrong. Try again.";
      setError(message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h1>BeSafe Login</h1>
      
      {/* Conditionally show the error message in red */}
      {error && (
        <p style={{ color: '#FF4D4D', fontWeight: 'bold', marginBottom: '15px' }}>
          {error}
        </p>
      )}

      <input 
        placeholder="Username" 
        style={inputStyle}
        onChange={e => setUsername(e.target.value)} 
      /><br/>
      
      <input 
        type="password" 
        placeholder="Password" 
        style={inputStyle}
        onChange={e => setPassword(e.target.value)} 
      /><br/>
      
      <button 
        onClick={handleLogin}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#00C851', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Enter Dashboard
      </button>
    </div>
  );
}

// Simple styling to make the inputs look cleaner
const inputStyle = {
  padding: '10px',
  margin: '5px',
  width: '250px',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

export default Login;