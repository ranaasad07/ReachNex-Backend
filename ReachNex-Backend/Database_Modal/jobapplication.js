const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  email: String,
  phone: String,
  coverLetter: String,
  resumeUrl: String, 
}, { timestamps: true });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
