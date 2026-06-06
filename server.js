require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const Message = require("./models/Message");

// ---------- ROUTES ----------
app.get("/", (req, res) => res.send("API running"));

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, gender, qualification, experience, skills, password, secretCode } = req.body;
    let role = "user";
    if (secretCode && secretCode === process.env.ADMIN_SECRET) role = "admin";
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({ name, email, gender, qualification, experience, skills, password, role });
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (user.password !== password) return res.status(400).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful", user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Jobs CRUD
app.post("/api/jobs", async (req, res) => {
  try { const job = await Job.create(req.body); res.status(201).json(job); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get("/api/jobs", async (req, res) => {
  try { const jobs = await Job.find(); res.json(jobs); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put("/api/jobs/:id", async (req, res) => {
  try { const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(job); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/jobs/:id", async (req, res) => {
  try { await Job.findByIdAndDelete(req.params.id); res.json({ message: "Job deleted" }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Applications
app.post("/api/apply", async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const already = await Application.findOne({ userId, jobId });
    if (already) return res.status(400).json({ error: "Already applied" });
    const app = await Application.create({ userId, jobId });
    res.status(201).json(app);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get("/api/applications/:userId", async (req, res) => {
  try { const apps = await Application.find({ userId: req.params.userId }).populate("jobId"); res.json(apps); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get("/api/applications", async (req, res) => {
  try { const apps = await Application.find().populate("jobId userId"); res.json(apps); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.patch("/api/applications/:id", async (req, res) => {
  try { const { status } = req.body; const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true }); res.json(app); } catch (err) { res.status(500).json({ error: err.message }); }
});

// User profile update
app.patch("/api/users/:id", async (req, res) => {
  try { const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(user); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------- MESSAGING (email-based) ----------
app.post("/api/messages", async (req, res) => {
  try {
    const { senderEmail, receiverEmail, text } = req.body;
    const msg = await Message.create({ senderEmail, receiverEmail, text });
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/messages/:email1/:email2", async (req, res) => {
  try {
    const { email1, email2 } = req.params;
    const msgs = await Message.find({
      $or: [
        { senderEmail: email1, receiverEmail: email2 },
        { senderEmail: email2, receiverEmail: email1 }
      ]
    }).sort("createdAt");
    res.json(msgs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// Get admin email (for users to know whom to chat with)
app.get("/api/admin/email", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) return res.status(404).json({ error: "No admin found" });
    res.json({ email: admin.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));