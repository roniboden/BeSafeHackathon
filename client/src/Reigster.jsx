import { useState } from "react";
import api from "./services/api";
import { useNavigate } from "react-router";

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
      console.log()

      // auto-login after registration by saving returned user
      localStorage.setItem("besafe_user", JSON.stringify(response.data.user));

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Try again.";
      setError(message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial" }}>
      <h1>BeSafe Registration</h1>

      {error && (
        <p style={{ color: "#FF4D4D", fontWeight: "bold", marginBottom: "15px" }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: "#00C851", fontWeight: "bold", marginBottom: "15px" }}>
          {success}
        </p>
      )}

      <input
        placeholder="Username"
        style={inputStyle}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />

      <input
        placeholder="Email"
        style={inputStyle}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Password"
        style={inputStyle}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button
        onClick={handleRegister}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginTop: "10px",
        }}
      >
        Create Account
      </button>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  margin: "5px",
  width: "250px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

export default Register;
