const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  gender: String,
  qualification: String,
  experience: String,
  skills: String,
  password: { type: String, required: true },
  linkedin: String,
  resume: String,
  role: { type: String, default: "user" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);