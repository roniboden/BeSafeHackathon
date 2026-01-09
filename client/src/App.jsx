import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './Dashboard'; 
import Login from './LoginPage.jsx';
import Register from './Reigster.jsx';         

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login />} />
        
        {/* Registration page */}
        <Route path="/register" element={<Register />} />

        {/* The Dashboard is  at /dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
