import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || {}
  );

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selectedOption, setSelectedOption] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [resumeFileName, setResumeFileName] = useState(currentUser?.resume || "");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterQualification, setFilterQualification] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Chat states
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState("");

  // ---------- FETCH JOBS ----------
  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error(err));
  }, []);

  // ---------- FETCH APPLICATIONS ----------
  useEffect(() => {
    if (!currentUser?._id) return;
    fetch(`http://localhost:5000/api/applications/${currentUser._id}`)
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(err => console.error(err));
  }, [currentUser?._id]);

  // ---------- NOTIFICATIONS (deadline + message) ----------
  useEffect(() => {
    const allNotifs = [];
    const today = new Date();
    jobs.forEach(job => {
      if (job.deadline) {
        const deadlineDate = new Date(job.deadline);
        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 3) {
          allNotifs.push({
            id: Date.now() + Math.random(),
            message: `Deadline approaching: ${job.title} at ${job.company} (in ${diffDays} day${diffDays === 1 ? "" : "s"})`,
          });
        }
      }
    });

    if (currentUser?.email) {
      const msgNotifs = JSON.parse(localStorage.getItem("user_notifications_" + currentUser.email)) || [];
      msgNotifs.forEach(n => {
        allNotifs.push({
          id: Date.now() + Math.random(),
          message: `New message from Admin: "${n.message.substring(0, 30)}..."`,
        });
      });
    }

    if (allNotifs.length === 0) {
      allNotifs.push({ id: Date.now(), message: "You're all caught up! No new notifications." });
    }
    setNotifications(allNotifs);
  }, [jobs, currentUser?.email]);

  // ---------- OPEN USER CHAT MODAL ----------
  const openUserChatModal = () => {
    if (!currentUser?.email) return;
    const msgs = JSON.parse(localStorage.getItem("messages_" + currentUser.email)) || [];
    const msgsWithIds = msgs.map(m => m.id ? m : { ...m, id: Date.now() + Math.random() });
    setChatMessages(msgsWithIds);
    // Clear notifications
    localStorage.removeItem("user_notifications_" + currentUser.email);
    setNotifications(prev => prev.filter(n => !n.message.startsWith("New message from Admin")));
    setShowChatModal(true);
  };

  // ---------- SEND REPLY ----------
  const sendUserReply = () => {
    if (!replyText.trim() || !currentUser.email) return;
    const email = currentUser.email;
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const newMsg = {
      id: Date.now() + Math.random(),
      from: "User",
      text: replyText,
      time: new Date().toISOString(),
    };
    msgs.push(newMsg);
    localStorage.setItem("messages_" + email, JSON.stringify(msgs));
    setChatMessages([...msgs]);
    setReplyText("");

    // Notify admin
    const adminNotifs = JSON.parse(localStorage.getItem("admin_notifications")) || [];
    adminNotifs.push({
      userEmail: email,
      userName: currentUser.name,
      jobTitle: "General",
      message: replyText,
      time: new Date().toISOString(),
    });
    localStorage.setItem("admin_notifications", JSON.stringify(adminNotifs));
  };

  // ---------- EDIT / DELETE (user) ----------
  const editMessage = (msgId) => {
    const email = currentUser.email;
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const msg = msgs.find(m => m.id === msgId);
    if (msg && msg.from === "User") {
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
    const email = currentUser.email;
    if (!window.confirm("Delete this message?")) return;
    const msgs = JSON.parse(localStorage.getItem("messages_" + email)) || [];
    const filtered = msgs.filter(m => m.id !== msgId);
    localStorage.setItem("messages_" + email, JSON.stringify(filtered));
    setChatMessages([...filtered]);
  };

  // ---------- PROFILE STRENGTH ----------
  const calculateStrength = () => {
    let strength = 20;
    if (currentUser?.qualification?.trim()) strength += 20;
    if (currentUser?.skills?.trim()) strength += 20;
    if (currentUser?.experience?.trim()) strength += 20;
    if (currentUser?.linkedin?.trim()) strength += 20;
    if (currentUser?.resume?.trim()) strength += 20;
    return Math.min(strength, 100);
  };
  const profileStrength = calculateStrength();

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  // ---------- APPLY LOGIC ----------
  const openApplyModal = (job) => {
    const alreadyApplied = applications.some(app => app.jobId?._id === job._id);
    if (alreadyApplied) { alert("Already applied"); return; }
    if (!currentUser?.resume) { alert("Please upload your resume before applying."); return; }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!selectedJob || !currentUser) return;
    const res = await fetch("http://localhost:5000/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser._id, jobId: selectedJob._id }),
    });
    if (res.ok) {
      alert("Application submitted successfully!");
      setShowApplyModal(false);
      setSelectedJob(null);
      const updated = await fetch(`http://localhost:5000/api/applications/${currentUser._id}`).then(r => r.json());
      setApplications(updated);
    } else { alert("Error applying"); }
  };

  const cancelApply = () => { setShowApplyModal(false); setSelectedJob(null); };

  // ---------- PROFILE HANDLING ----------
  const handleProfile = (e) => setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) { setResumeFileName(file.name); setCurrentUser(prev => ({ ...prev, resume: file.name })); }
  };
  const removeResume = () => { setResumeFileName(""); setCurrentUser(prev => ({ ...prev, resume: "" })); };

  const saveProfile = async () => {
    const updatedUser = { ...currentUser, resume: resumeFileName };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    if (updatedUser._id) {
      await fetch(`http://localhost:5000/api/users/${updatedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedUser.name,
          qualification: updatedUser.qualification,
          skills: updatedUser.skills,
          experience: updatedUser.experience,
          linkedin: updatedUser.linkedin,
          resume: updatedUser.resume,
        }),
      }).catch(console.error);
    }
    setEditMode(false);
    alert("Profile Updated");
  };

  // ---------- FILTERED JOBS ----------
  const filteredJobs = jobs.filter(job => {
    const matchSearch = (job.title + job.company + job.location).toLowerCase().includes(searchTerm.toLowerCase());
    const matchQual = filterQualification === "" || job.qualification === filterQualification;
    const matchLoc = filterLocation === "" || job.location === filterLocation;
    return matchSearch && matchQual && matchLoc;
  });

  const qualifications = [...new Set(jobs.map(j => j.qualification).filter(Boolean))];
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

  const userApplications = applications;

  return (
    <div className="container-fluid" style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-md-3 shadow p-4" style={{ background: "#EEF2F7", minHeight: "100vh" }}>
          <div className="text-center">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="120" alt="profile" style={{ cursor: "pointer", borderRadius: "50%" }} onClick={() => setShowProfile(true)} />
            <h4 className="mt-3">{currentUser?.name || "User"}</h4>
            <p className="text-muted small mb-1">📄 Resume: {currentUser?.resume ? <span className="text-success">{currentUser.resume}</span> : <span className="text-danger">Not uploaded</span>}</p>
            <hr />
            <button className="btn btn-light w-100 mb-3" onClick={() => setSelectedOption("jobs")}>💼 Available Jobs</button>
            <button className="btn btn-light w-100 mb-3" onClick={() => setSelectedOption("applications")}>📌 My Applications</button>
            <button className="btn btn-light w-100 mb-3" onClick={openUserChatModal}>
              💬 Messages {chatMessages.length > 0 && <span className="badge bg-danger ms-2">{chatMessages.length}</span>}
            </button>
            <button className="btn btn-light w-100" onClick={() => setSelectedOption("strength")}>⭐ Profile Strength</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-md-9 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Welcome, {currentUser?.name} 🚀</h2>
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <button className="btn btn-light position-relative" onClick={() => setShowNotifications(!showNotifications)}>
                  🔔 {notifications.filter(n => !n.message.startsWith("You're all caught up")).length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {notifications.filter(n => !n.message.startsWith("You're all caught up")).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="position-absolute end-0 mt-2 p-3 bg-white shadow rounded" style={{ width: "300px", zIndex: 1000 }}>
                    <h6>Notifications</h6><hr />
                    {notifications.map((n, i) => <div key={i} className="small mb-2">{n.message}</div>)}
                  </div>
                )}
              </div>
              <button className="btn btn-danger" onClick={logout}>Logout</button>
            </div>
          </div><hr />

          {/* DEFAULT CARDS */}
          {selectedOption === "" && (
            <div className="row">
              <div className="col-md-4 mb-4"><div className="card p-4 shadow text-center"><h5>💼 Available Jobs</h5><h2>{jobs.length}</h2></div></div>
              <div className="col-md-4 mb-4"><div className="card p-4 shadow text-center"><h5>📌 Applied Jobs</h5><h2>{userApplications.length}</h2></div></div>
              <div className="col-md-4 mb-4"><div className="card p-4 shadow text-center"><h5>⭐ Profile Strength</h5><h2>{profileStrength}%</h2></div></div>
            </div>
          )}

          {/* AVAILABLE JOBS */}
          {selectedOption === "jobs" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3"><h3>💼 Available Jobs</h3><button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOption("")}>← Back</button></div>
              <div className="row mb-4">
                <div className="col-md-4"><input type="text" className="form-control" placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                <div className="col-md-3">
                  <select className="form-control" value={filterQualification} onChange={e => setFilterQualification(e.target.value)}>
                    <option value="">All Qualifications</option>
                    {qualifications.map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-control" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
                    <option value="">All Locations</option>
                    {locations.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-2"><button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(""); setFilterQualification(""); setFilterLocation(""); }}>Clear</button></div>
              </div>
              {filteredJobs.map(job => {
                const hasApplied = applications.some(app => app.jobId?._id === job._id);
                return (
                  <div key={job._id} className="card p-4 shadow mb-3">
                    <h4>{job.title}</h4><p>Company : {job.company}</p><p>Location : {job.location}</p><p>Salary : {job.salary}</p><p>Qualification : {job.qualification}</p><p>Experience : {job.experience}</p><p>Deadline : {job.deadline}</p>
                    {hasApplied ? <button className="btn btn-outline-success" disabled>✓ Applied</button> : <button className="btn btn-primary" onClick={() => openApplyModal(job)}>Apply Now</button>}
                  </div>
                );
              })}
            </div>
          )}

          {/* MY APPLICATIONS */}
          {selectedOption === "applications" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3"><h3>📌 My Applications</h3><button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOption("")}>← Back</button></div>
              {userApplications.map((app, i) => (
                <div key={i} className="card p-3 shadow mb-3">
                  <h5>{app.jobId?.title}</h5><p>Company : {app.jobId?.company}</p>
                  <p>Status : <span className={`badge ${app.status==="Applied"?"bg-primary":app.status==="Under Review"?"bg-warning text-dark":app.status==="Selected"?"bg-success":"bg-danger"}`}>{app.status}</span></p>
                  <small>Applied on: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}</small>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE STRENGTH */}
          {selectedOption === "strength" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3"><h3>⭐ Profile Strength</h3><button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOption("")}>← Back</button></div>
              <div className="card p-5 shadow text-center">
                <h2>{profileStrength}%</h2>
                <div className="progress mt-3"><div className="progress-bar bg-success" style={{ width: `${profileStrength}%` }}>{profileStrength}%</div></div>
                <p className="mt-3 text-muted">Complete your profile to reach 100%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* APPLY MODAL */}
      {showApplyModal && selectedJob && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded shadow" style={{ width: "400px" }}>
            <h5>Confirm Application</h5>
            <p>Apply for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>?</p>
            <div className="d-flex justify-content-end gap-2"><button className="btn btn-secondary" onClick={cancelApply}>Cancel</button><button className="btn btn-primary" onClick={confirmApply}>Confirm</button></div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white p-4" style={{ width: "500px", borderRadius: "20px" }}>
            <div className="d-flex justify-content-between"><h3>My Profile</h3><button className="btn btn-danger" onClick={() => { setShowProfile(false); setEditMode(false); }}>X</button></div><hr />
            <input name="name" value={currentUser?.name||""} disabled={!editMode} className="form-control mb-3" onChange={handleProfile} />
            <input name="email" value={currentUser?.email||""} disabled={!editMode} className="form-control mb-3" onChange={handleProfile} />
            <input name="qualification" value={currentUser?.qualification||""} disabled={!editMode} className="form-control mb-3" onChange={handleProfile} />
            <input name="skills" value={currentUser?.skills||""} disabled={!editMode} placeholder="Skills" className="form-control mb-3" onChange={handleProfile} />
            {editMode ? (
              <select name="experience" value={currentUser?.experience||""} className="form-control mb-3" onChange={handleProfile}>
                <option value="">Select Experience</option>
                <option>Fresher</option><option>0-1 Years</option><option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
              </select>
            ) : <p className="mb-3">Experience : {currentUser?.experience || "Not added"}</p>}
            {!editMode ? <p className="mb-3">LinkedIn URL : {currentUser?.linkedin || "Not added"}</p> : (
              <div className="mb-3"><label className="form-label">LinkedIn URL</label><input name="linkedin" value={currentUser?.linkedin||""} className="form-control" placeholder="https://linkedin.com/in/..." onChange={handleProfile} /></div>
            )}
            {!editMode ? (
              <div className="mb-3 d-flex align-items-center justify-content-between"><span>Resume : {currentUser?.resume || "No resume uploaded"}</span><button className="btn btn-outline-secondary btn-sm" onClick={() => setEditMode(true)}>Change</button></div>
            ) : (
              <div className="mb-3">
                <label className="form-label">Resume</label><input type="file" className="form-control mb-2" onChange={handleResumeChange} />
                {currentUser?.resume && <button className="btn btn-outline-danger btn-sm" onClick={removeResume}>Remove Resume</button>}
              </div>
            )}
            {!editMode ? <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button> : <button className="btn btn-success" onClick={saveProfile}>Save Changes</button>}
          </div>
        </div>
      )}

      {/* USER CHAT MODAL with edit/delete icons */}
      {showChatModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="bg-white p-4" style={{ width: "500px", maxHeight: "80vh", borderRadius: "15px", display: "flex", flexDirection: "column" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Messages from Admin</h5>
              <button className="btn btn-danger btn-sm" onClick={() => setShowChatModal(false)}>X</button>
            </div>
            <hr className="mt-0" />
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "40vh" }}>
              {chatMessages.length === 0 ? <p className="text-muted">No messages yet.</p> :
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`mb-2 p-2 rounded ${msg.from === "User" ? "bg-primary text-white text-end" : "bg-light text-start"}`}>
                    <small className="d-block text-muted">{msg.from} • {new Date(msg.time).toLocaleTimeString()}</small>
                    {msg.text}
                    {msg.from === "User" && (
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
                <input type="text" className="form-control" placeholder="Type your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={e => e.key === "Enter" && sendUserReply()} />
                <button className="btn btn-primary" onClick={sendUserReply}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;