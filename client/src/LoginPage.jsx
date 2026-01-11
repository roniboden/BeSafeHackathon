// import { useState } from 'react';
// import api from './services/api'; 
// import { useNavigate } from 'react-router';

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(''); // New state for error messages
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     setError(''); // Clear previous errors before trying again
    
//     try {
//       const response = await api.post('/auth/login', { username, password });
//       localStorage.setItem('besafe_user', JSON.stringify(response.data.user));
//       navigate('/dashboard');
//     } catch (err) {
//       // Check if the backend sent a specific message, otherwise use a default
//       const message = err.response?.data?.message || "Something went wrong. Try again.";
//       setError(message);
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
//       <h1>BeSafe Login</h1>
      
//       {/* Conditionally show the error message in red */}
//       {error && (
//         <p style={{ color: '#FF4D4D', fontWeight: 'bold', marginBottom: '15px' }}>
//           {error}
//         </p>
//       )}

//       <input 
//         placeholder="Username" 
//         style={inputStyle}
//         onChange={e => setUsername(e.target.value)} 
//       /><br/>
      
//       <input 
//         type="password" 
//         placeholder="Password" 
//         style={inputStyle}
//         onChange={e => setPassword(e.target.value)} 
//       /><br/>
      
//       <button 
//         onClick={handleLogin}
//         style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#00C851', color: 'white', border: 'none', borderRadius: '5px' }}
//       >
//         Enter Dashboard
//       </button>

//       <div style={{ marginTop: "18px" }}>
        
//       <button
//         onClick={() => navigate("/register")}
//         style={{
//           background: "none",
//           border: "none",
//           color: "#555",
//           textDecoration: "underline",
//           cursor: "pointer",
//         }}
//       >
//         New here? Create an account
//       </button>
// </div>

//     </div>
//   );
// }


// const inputStyle = {
//   padding: '10px',
//   margin: '5px',
//   width: '250px',
//   borderRadius: '5px',
//   border: '1px solid #ccc'
// };

// export default Login;


import { useState } from 'react';
import api from './services/api'; 
import { useNavigate } from 'react-router';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents page reload if wrapped in a form
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('besafe_user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.loginCard}>
        {/* Branding/Logo Area */}
        <div style={styles.headerArea}>
          <div style={styles.logoIcon}>🛡️</div>
          <h1 style={styles.h1}>BeSafe</h1>
          <p style={styles.subtitle}>Enter your details to access your dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorAlert}>
             {error}
          </div>
        )}

        {/* Form Fields */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input 
            type="text"
            placeholder="e.g. QueenB" 
            style={styles.input}
            onChange={e => setUsername(e.target.value)} 
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            style={styles.input}
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          style={{ 
            ...styles.button, 
            backgroundColor: isLoading ? '#9ca3af' : '#10b981',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
        </button>

        <div style={styles.footer}>
          <p style={styles.footerText}>New here?</p>
          <button
            onClick={() => navigate("/register")}
            style={styles.linkButton}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    padding: '20px',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #e2e8f0',
  },
  headerArea: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  h1: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fee2e2',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '10px',
    transition: 'opacity 0.2s',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  footerText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

export default Login;