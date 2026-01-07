import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './Dashboard'; 
import Login from './tempLogin.jsx';         

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Set the Login page as the "Home" (path="/") */}
        <Route path="/" element={<Login />} />
        
        {/* The Dashboard is protected at /dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
