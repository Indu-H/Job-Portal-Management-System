import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddJob() {
  const navigate = useNavigate();

  // Get the current admin's email from localStorage
  const adminEmail = localStorage.getItem("adminEmail") || "";

  const editJob = JSON.parse(localStorage.getItem("editJob"));

  const [job, setJob] = useState(
    editJob || {
      title: "",
      company: "",
      location: "",
      salary: "",
      qualification: "",
      experience: "",
      deadline: "",
      description: "",
    }
  );

  function handleChange(e) {
    setJob({ ...job, [e.target.name]: e.target.value });
  }

  async function saveJob() {
    if (!job.title || !job.company || !job.salary || !job.deadline) {
      alert("Fill Required Fields");
      return;
    }

    const jobData = { ...job, adminEmail };

    const url = editJob
      ? `http://localhost:5000/api/jobs/${editJob._id}`
      : "http://localhost:5000/api/jobs";
    const method = editJob ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      if (res.ok) {
        alert(editJob ? "Job Updated Successfully" : "Job Added Successfully");
        localStorage.removeItem("editJob");
        // Force reload of admin dashboard so data is fresh
        window.location.href = "/admin-dashboard";
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "Could not save job"));
      }
    } catch (err) {
      alert("Could not connect to server.");
    }
  }

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow" style={{ borderRadius: "15px" }}>
        <div className="d-flex justify-content-between">
          <h2>{editJob ? "Edit Job" : "Add Job"}</h2>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin-dashboard")}
          >
            Dashboard
          </button>
        </div>
        <hr />
        <input name="title" value={job.title} placeholder="Job Title" className="form-control mb-3" onChange={handleChange} />
        <input name="company" value={job.company} placeholder="Company" className="form-control mb-3" onChange={handleChange} />
        <input name="location" value={job.location} placeholder="Location" className="form-control mb-3" onChange={handleChange} />
        <input name="salary" value={job.salary} placeholder="Salary" className="form-control mb-3" onChange={handleChange} />
        <select name="qualification" value={job.qualification} className="form-control mb-3" onChange={handleChange}>
          <option value="">Select Qualification</option>
          <option>BE</option><option>BTECH</option><option>MTECH</option><option>MCA</option><option>MBA</option><option>BCA</option><option>OTHER DEGREE</option>
        </select>
        <select name="experience" value={job.experience} className="form-control mb-3" onChange={handleChange}>
          <option value="">Select Experience</option>
          <option>Fresher</option><option>0-1 Years</option><option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
        </select>
        <label>Application Deadline</label>
        <input type="date" name="deadline" value={job.deadline} className="form-control mb-3" onChange={handleChange} />
        <textarea name="description" value={job.description} placeholder="Job Description" rows="4" className="form-control mb-3" onChange={handleChange} />
        <button className="btn btn-primary" onClick={saveJob}>
          {editJob ? "Save Changes" : "Add Job"}
        </button>
      </div>
    </div>
  );
}

export default AddJob;