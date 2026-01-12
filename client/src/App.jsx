import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "./Dashboard";
import Login from "./LoginPage.jsx";
import Register from "./Reigster.jsx";
import StorePage from "./StorePage";
import Profile from "./ProfilePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shop" element={<StorePage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
