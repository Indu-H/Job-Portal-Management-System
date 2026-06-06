import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function registerUser() {
    if (!name || !email || !gender || !qualification || !experience || !skills || !password) {
      alert("Please fill all fields");
      return;
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, gender, qualification, experience, skills, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! You can now login.");
        navigate("/login");
      } else {
        alert("Error: " + (data.error || "Registration failed"));
      }
    } catch (err) {
      alert("Could not connect to server. Make sure backend is running.");
    }
  }

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2 className="mb-4 text-center">Register</h2>

        <input className="form-control mb-3" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="form-control mb-3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

        <select className="form-control mb-3" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <select className="form-control mb-3" value={qualification} onChange={e => setQualification(e.target.value)}>
          <option value="">Select Qualification</option>
          <option>BE</option>
          <option>BTECH</option>
          <option>MTECH</option>
          <option>MCA</option>
          <option>MBA</option>
          <option>BCA</option>
          <option>OTHER DEGREE</option>
        </select>

        <select className="form-control mb-3" value={experience} onChange={e => setExperience(e.target.value)}>
          <option value="">Select Experience</option>
          <option>Fresher</option>
          <option>0-1 Years</option>
          <option>1-3 Years</option>
          <option>3-5 Years</option>
          <option>5+ Years</option>
        </select>

        <input className="form-control mb-3" placeholder="Skills (e.g., Java, React)" value={skills} onChange={e => setSkills(e.target.value)} />

        {/* Password field with eye icon */}
        <div className="position-relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            className="btn btn-light"
            style={{ position: "absolute", right: "5px", top: "3px" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <button className="btn btn-primary w-100" onClick={registerUser}>Register</button>
        <p className="mt-3 text-center">
          Already have an account?{" "}
          <span style={{ color: "blue", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;