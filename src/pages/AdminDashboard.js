import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function AdminDashboard() {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("adminEmail") || "";

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) navigate("/admin");
  }, [navigate]);

  const adminProfile = {
    name: localStorage.getItem("adminName") || "Admin",
    email: adminEmail,
    phone: localStorage.getItem("adminPhone") || "",
    department: localStorage.getItem("adminDepartment") || "",
    experience: localStorage.getItem("adminExperience") || "",
  };

  const [selectedOption, setSelectedOption] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [editAdminMode, setEditAdminMode] = useState(false);
  const [tempAdmin, setTempAdmin] = useState({ ...adminProfile });

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [showChatModal, setShowChatModal] = useState(false);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [adminNotifications, setAdminNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchNotifications();
  }, []);

  const fetchJobs = () => {
    fetch("http://localhost:5000/api/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(data.filter((j) => j.adminEmail === adminEmail)))
      .catch(console.error);
  };
  const fetchApplications = () => {
    fetch("http://localhost:5000/api/applications")
      .then((r) => r.json())
      .then((data) => setApplications(data))
      .catch(console.error);
  };
  const fetchNotifications = () =>
    setAdminNotifications(JSON.parse(localStorage.getItem("admin_notifications")) || []);

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
    window.location.href = "/";
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Delete?")) return;
    await fetch(`http://localhost:5000/api/jobs/${id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j._id !== id));
  };
  const editJob = (job) => {
    localStorage.setItem("editJob", JSON.stringify(job));
    navigate("/add-job");
  };
  const updateApplicationStatus = async (appId, newStatus) => {
    await fetch(`http://localhost:5000/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchApplications();
  };

  // ---------- LOCAL STORAGE CHAT ----------
  const openChatModal = (applicant) => {
    setCurrentApplicant(applicant);
    const email = applicant.email; // applicant is the user object
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const msgsWithIds = msgs.map((m) =>
      m.id ? m : { ...m, id: Date.now() + Math.random() }
    );
    setChatMessages(msgsWithIds);
    setMessageText("");
    setShowChatModal(true);
  };

  const sendMessage = () => {
    if (!messageText.trim()) {
      alert("Please write a message.");
      return;
    }
    const email = currentApplicant.email;
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const newMsg = {
      id: Date.now() + Math.random(),
      from: "Admin",
      text: messageText,
      time: new Date().toISOString(),
    };
    msgs.push(newMsg);
    localStorage.setItem("messages_" + email, JSON.stringify(msgs));
    setChatMessages([...msgs]);
    setMessageText("");

    // Notify user
    const userNotifKey = "user_notifications_" + email;
    const userNotifs = JSON.parse(localStorage.getItem(userNotifKey)) || [];
    userNotifs.push({ type: "message", from: "Admin", message: messageText, time: new Date().toISOString() });
    localStorage.setItem(userNotifKey, JSON.stringify(userNotifs));
  };

  // ---------- EDIT / DELETE MESSAGE (Admin) ----------
  const editMessage = (msgId) => {
    const email = currentApplicant.email;
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const msg = msgs.find((m) => m.id === msgId);
    if (msg && msg.from === "Admin") {
      const newText = prompt("Edit your message:", msg.text);
      if (newText && newText.trim()) {
        msg.text = newText.trim();
        msg.time = new Date().toISOString();
        localStorage.setItem("messages_" + email, JSON.stringify(msgs));
        setChatMessages([...msgs]);
      }
    }
  };

  const deleteMessage = (msgId) => {
    const email = currentApplicant.email;
    if (!window.confirm("Delete this message?")) return;
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const filtered = msgs.filter((m) => m.id !== msgId);
    localStorage.setItem("messages_" + email, JSON.stringify(filtered));
    setChatMessages([...filtered]);
  };

  const handleAdminEdit = (e) => setTempAdmin({ ...tempAdmin, [e.target.name]: e.target.value });
  const saveAdminProfile = () => {
    localStorage.setItem("adminName", tempAdmin.name);
    localStorage.setItem("adminEmail", tempAdmin.email);
    localStorage.setItem("adminPhone", tempAdmin.phone);
    localStorage.setItem("adminDepartment", tempAdmin.department);
    localStorage.setItem("adminExperience", tempAdmin.experience);
    window.location.reload();
  };

  const statusBadge = (s) => {
    const cls = s === "Applied" ? "bg-primary" : s === "Under Review" ? "bg-warning text-dark" : s === "Selected" ? "bg-success" : s === "Rejected" ? "bg-danger" : "bg-secondary";
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  return (
    <div className="container-fluid" style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-md-3 shadow p-4" style={{ background: "#EEF2F7", minHeight: "100vh" }}>
          <div className="text-center">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="120" alt="profile" style={{ cursor: "pointer", borderRadius: "50%" }} onClick={() => { setTempAdmin({ ...adminProfile }); setEditAdminMode(false); setShowProfile(true); }} />
            <h4 className="mt-3">{adminProfile.name}</h4>
            <p className="mb-0 text-muted">Administrator</p>
            {adminProfile.phone && <small className="d-block text-muted">{adminProfile.phone}</small>}
            {adminProfile.department && <small className="d-block text-muted">{adminProfile.department}</small>}
            {adminProfile.experience && <small className="d-block text-muted">{adminProfile.experience}</small>}
            <hr />
            <button className="btn btn-light w-100 mb-3" onClick={() => navigate("/add-job")}>Add Jobs</button>
            <button className="btn btn-light w-100 mb-3" onClick={() => setSelectedOption("available")}>Available Jobs</button>
            <button className="btn btn-light w-100" onClick={() => setSelectedOption("applicants")}>See Applicants</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-md-9 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Admin Dashboard</h2>
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <button className="btn btn-light position-relative" onClick={() => setShowNotifPanel(!showNotifPanel)}>
                  🔔 {adminNotifications.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{adminNotifications.length}</span>}
                </button>
                {showNotifPanel && (
                  <div className="position-absolute end-0 mt-2 p-3 bg-white shadow rounded" style={{ width: "300px", zIndex: 1000 }}>
                    <h6>Notifications</h6><hr />
                    {adminNotifications.map((n, i) => <div key={i} className="small mb-2"><strong>{n.userName}</strong> sent message</div>)}
                  </div>
                )}
              </div>
              <button className="btn btn-danger" onClick={logout}>Logout</button>
            </div>
          </div><hr />

          {/* DASHBOARD CARDS */}
          {selectedOption === "" && (
            <div className="row">
              <div className="col-md-4 mb-4"><div className="card p-4 shadow text-center"><h5>Jobs Posted</h5><h2>{jobs.length}</h2></div></div>
              <div className="col-md-4 mb-4"><div className="card p-4 shadow text-center"><h5>Total Applicants</h5><h2>{applications.length}</h2></div></div>
              <div className="col-md-4 mb-4"><div className="card p-4 shadow text-center"><h5>Active Jobs</h5><h2>{jobs.length}</h2></div></div>
            </div>
          )}

          {/* AVAILABLE JOBS */}
          {selectedOption === "available" && (
            <div>
              <div className="d-flex justify-content-between"><h3>Available Jobs</h3><button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOption("")}>Dashboard</button></div><hr />
              {jobs.length === 0 ? <p>No Jobs Added Yet</p> : jobs.map(job => (
                <div key={job._id} className="card shadow p-4 mb-3">
                  <h4>{job.title}</h4><p>Company : {job.company}</p><p>Location : {job.location}</p><p>Salary : {job.salary}</p><p>Qualification : {job.qualification}</p><p>Experience : {job.experience}</p><p>Deadline : {job.deadline}</p><p>Description : {job.description}</p>
                  <div className="mt-2">
                    <span style={{ cursor: "pointer", color: "#0d6efd", fontWeight: 500, marginRight: 25 }} onClick={() => editJob(job)}>Edit</span>
                    <span style={{ cursor: "pointer", color: "#dc3545", fontWeight: 500 }} onClick={() => deleteJob(job._id)}>Delete</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEE APPLICANTS */}
          {selectedOption === "applicants" && (
            <div>
              <div className="d-flex justify-content-between"><h3>Applicants List</h3><button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOption("")}>Dashboard</button></div><hr />
              {applications.length === 0 ? <div className="alert alert-info">No applicants yet.</div> : (
                <div className="row">
                  {applications.map(app => (
                    <div key={app._id} className="col-md-6 mb-3">
                      <div className="card p-3 shadow">
                        <h5>{app.userId?.name}</h5>
                        <p className="mb-1">Email: {app.userId?.email}</p>
                        <p className="mb-1">Job: {app.jobId?.title}</p>
                        <p className="mb-1">Company: {app.jobId?.company}</p>
                        <p className="mb-1">Status: {statusBadge(app.status)}</p>
                        <small className="text-muted">Applied on: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}</small>
                        <p className="mb-1">📄 Resume: {app.userId?.resume ? <span className="text-success">{app.userId.resume}</span> : <span className="text-muted">Not uploaded</span>}</p>
                        <div className="mt-2">
                          <select className="form-select form-select-sm" value={app.status} onChange={e => updateApplicationStatus(app._id, e.target.value)}>
                            <option>Applied</option><option>Under Review</option><option>Selected</option><option>Rejected</option>
                          </select>
                        </div>
                        <div className="mt-2">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => openChatModal(app.userId)}>💬 Chat</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white p-4" style={{ width: "480px", borderRadius: "20px" }}>
            <div className="d-flex justify-content-between"><h3>Admin Profile</h3><button className="btn btn-danger btn-sm" onClick={() => setShowProfile(false)}>X</button></div><hr />
            {!editAdminMode ? (
              <div>
                <p><strong>Name:</strong> {adminProfile.name}</p>
                <p><strong>Email:</strong> {adminProfile.email}</p>
                <p><strong>Phone:</strong> {adminProfile.phone || "Not added"}</p>
                <p><strong>Department:</strong> {adminProfile.department || "Not added"}</p>
                <p><strong>Experience:</strong> {adminProfile.experience || "Not added"}</p>
                <button className="btn btn-primary mt-2" onClick={() => setEditAdminMode(true)}>Edit Profile</button>
              </div>
            ) : (
              <div>
                <label>Name</label><input name="name" className="form-control mb-2" value={tempAdmin.name} onChange={handleAdminEdit} />
                <label>Email</label><input name="email" className="form-control mb-2" value={tempAdmin.email} onChange={handleAdminEdit} />
                <label>Phone</label><input name="phone" className="form-control mb-2" value={tempAdmin.phone} onChange={handleAdminEdit} />
                <label>Department</label><input name="department" className="form-control mb-2" value={tempAdmin.department} onChange={handleAdminEdit} />
                <label>Experience</label>
                <select name="experience" className="form-control mb-3" value={tempAdmin.experience} onChange={handleAdminEdit}>
                  <option value="">Select Experience</option>
                  <option>Fresher</option><option>0-1 Years</option><option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
                </select>
                <div className="d-flex gap-2"><button className="btn btn-success" onClick={saveAdminProfile}>Save</button><button className="btn btn-secondary" onClick={() => { setEditAdminMode(false); setTempAdmin({ ...adminProfile }); }}>Cancel</button></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT MODAL with edit/delete icons for Admin */}
      {showChatModal && currentApplicant && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="bg-white p-4" style={{ width: "500px", maxHeight: "80vh", borderRadius: "15px", display: "flex", flexDirection: "column" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Chat with {currentApplicant?.name}</h5>
              <button className="btn btn-danger btn-sm" onClick={() => setShowChatModal(false)}>X</button>
            </div>
            <p className="text-muted small">{currentApplicant?.email}</p><hr className="mt-0" />
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "40vh" }}>
              {chatMessages.length === 0 ? <p className="text-muted">No messages yet.</p> :
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`mb-2 p-2 rounded ${msg.from === "Admin" ? "bg-primary text-white text-end" : "bg-light text-start"}`}>
                    <small className="d-block text-muted">{msg.from} • {new Date(msg.time).toLocaleTimeString()}</small>
                    {msg.text}
                    {/* Edit / Delete icons (only for Admin's own messages) */}
                    {msg.from === "Admin" && (
                      <div className="mt-1">
                        <button className="btn btn-sm btn-link text-light p-0 me-2" onClick={() => editMessage(msg.id)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn btn-sm btn-link text-light p-0" onClick={() => deleteMessage(msg.id)} title="Delete">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
            <div className="mt-3">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Type a message..." value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={e => e.key === "Enter" && sendMessage()} />
                <button className="btn btn-primary" onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;