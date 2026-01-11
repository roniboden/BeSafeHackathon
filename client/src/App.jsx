import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './Dashboard'; 
import Login from './LoginPage.jsx';
import Register from './Reigster.jsx';   
import StorePage from './StorePage'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/store" element={<StorePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;