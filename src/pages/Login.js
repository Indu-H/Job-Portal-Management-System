import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setMessage("⚠️ Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user.role === "admin") {
          // Admin login
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("adminEmail", data.user.email);
          localStorage.setItem("adminName", data.user.name);
          localStorage.setItem("adminPhone", data.user.phone || "");
          localStorage.setItem("adminDepartment", data.user.department || "");
          localStorage.setItem("adminExperience", data.user.experience || "");
          setMessage("🎉 Admin Login Successful");
          setTimeout(() => navigate("/admin-dashboard"), 500);
        } else {
          // User login
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          setMessage("🎉 Login Successful");
          setTimeout(() => navigate("/dashboard"), 500);
        }
      } else {
        setMessage("❌ " + (data.error || "Login failed"));
      }
    } catch (err) {
      setMessage("❌ Cannot connect to server.");
    }
  }

  return (
    <div
      className="container-fluid vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div
        className="card p-5 shadow"
        style={{ width: "420px", borderRadius: "20px" }}
      >
        <h2 className="text-center text-primary">User Login</h2>

        {message && (
          <div className="alert alert-info text-center mt-3">{message}</div>
        )}

        <input
          type="email"
          className="form-control mt-3"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="input-group mt-3">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <button className="btn btn-primary w-100 mt-3" onClick={handleLogin}>
          Login
        </button>

        <p className="text-center mt-3">
          New User? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;