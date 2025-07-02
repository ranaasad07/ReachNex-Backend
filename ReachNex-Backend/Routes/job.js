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
    console.error("❌ Job Post Error:", err);
    res.status(500).json({ error: "Failed to create job", details: err.message });
  }
});

// 👇 Fetch all jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});


module.exports = router