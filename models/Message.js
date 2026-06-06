const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderEmail: String,
  receiverEmail: String,
  text: String,
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);