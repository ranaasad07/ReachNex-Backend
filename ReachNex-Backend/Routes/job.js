const express = require("express")
const router = express.Router()
const Job = require("../Database_Modal/jobSchema")

router.post("/jobs", async (req, res) => {
  try {
    const { userId, title, company, location, employmentType, logoUrl, description } = req.body;

    const newJob = new Job({
      user: userId,
      title,
      company,
      location,
      employmentType,
      logoUrl,
      description,
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error("❌ Job Post Error:", err); // 👈 Log error
    res.status(500).json({ error: "Failed to create job", details: err.message });
  }
});


module.exports = router