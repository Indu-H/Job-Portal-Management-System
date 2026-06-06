const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  salary: String,
  qualification: String,
  experience: String,
  deadline: String,
  description: String,
  adminEmail: String,           // ← MUST HAVE THIS LINE
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);