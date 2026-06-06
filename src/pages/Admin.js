import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function adminLogin() {
    const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!email) { alert("Enter Email"); return; }
    if (!password) { alert("Enter Password"); return; }
    if (!passwordRule.test(password)) {
      alert("Password must contain minimum 8 characters, uppercase, lowercase, number and special character");
      return;
    }

    localStorage.setItem("adminEmail", email);
    localStorage.setItem("adminLoggedEmail", email);   // ← KEY FOR MESSAGING
    localStorage.setItem("adminLoggedIn", "true");
    alert("Admin Login Success");
    navigate("/admin-dashboard");
  }

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow" style={{ width: "450px" }}>
        <h2 className="text-center mb-4">Admin Login</h2>
        <input type="email" className="form-control mb-3" placeholder="Enter Email" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="position-relative mb-3">
          <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-light" style={{ position: "absolute", right: "10px", top: "3px" }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁"}</button>
        </div>
        <button className="btn btn-primary w-100" onClick={adminLogin}>Login</button>
      </div>
    </div>
  );
}

export default Admin;