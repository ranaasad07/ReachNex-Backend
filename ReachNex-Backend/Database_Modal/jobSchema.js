// jobSchema.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const jobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  company: String,
  location: String,
  employmentType: String,
  logoUrl: String,
  description: String,
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

module.exports = Job; // ✅ CommonJS style
