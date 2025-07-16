const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // ✅ updated path
const Job = require("../Database_Modal/jobSchema");
const JobApplication = require("../Database_Modal/jobapplication");
const User = require("../Database_Modal/modals");
const nodemailer = require("nodemailer");
const path = require("path");

router.post("/jobs/:jobId/apply", upload.single("resume"), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone, coverLetter, userId } = req.body;

    const job = await Job.findById(jobId).populate("user");
    if (!job) return res.status(404).json({ error: "Job not found" });

    const resumePath = req.file ? req.file.path : null;

    // ✅ Save application
    const application = new JobApplication({
      job: jobId,
      applicant: userId,
      name,
      email,
      phone,
      coverLetter,
      resumeUrl: resumePath,
    });
    await application.save();

    // ✅ Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: job.user.email,
      subject: `New Job Application: ${job.title}`,
      text: `You have a new applicant for your job "${job.title}".\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nCover Letter:\n${coverLetter}`,
      attachments: [
        {
          filename: "Resume.pdf",
          path: resumePath, // ✅ Cloudinary URL
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("❌ Apply Error:", err);
    res.status(500).json({ error: "Failed to submit application", details: err.message });
  }
});



// Example: backend/routes/jobApplications.js
router.get("/applied/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const applications = await Application.find({ applicant: userId }).populate("jobId");
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err });
  }
});


module.exports = router;
