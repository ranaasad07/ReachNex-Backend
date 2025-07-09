const express = require("express")
const router = express.Router()
const { User } = require("../Database_Modal/modals")
const requireAuth = require("../Control_Room/auth")
const mongoose = require("mongoose")

// Get all experiences for the authenticated user
router.get("/experience", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Sort experiences by creation date (newest first)
    const sortedExperiences = user.experience.sort(
      (a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()),
    )

    res.json(sortedExperiences)
  } catch (error) {
    console.error("Error fetching experiences:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching experiences",
    })
  }
})

// Add new experience
router.post("/experience", requireAuth, async (req, res) => {
  try {
    const { title, company, location, from, to, description } = req.body

    // Validation
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "Title and company are required",
      })
    }

    // Validate dates
    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const newExperience = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      company: company.trim(),
      location: location ? location.trim() : "",
      from: from || null,
      to: to || null,
      description: description ? description.trim() : "",
      createdAt: new Date(),
    }

    user.experience.unshift(newExperience)
    await user.save()

    res.status(201).json(newExperience)
  } catch (error) {
    console.error("Error adding experience:", error)
    res.status(500).json({
      success: false,
      message: "Server error while adding experience",
    })
  }
})

// Update experience by ID
router.put("/experience/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, company, location, from, to, description } = req.body

    // Validation
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "Title and company are required",
      })
    }

    // Validate dates
    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      })
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID",
      })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const experience = user.experience.id(id)
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      })
    }

    // Update experience fields
    experience.title = title.trim()
    experience.company = company.trim()
    experience.location = location ? location.trim() : ""
    experience.from = from || null
    experience.to = to || null
    experience.description = description ? description.trim() : ""
    experience.updatedAt = new Date()

    await user.save()

    res.json(experience)
  } catch (error) {
    console.error("Error updating experience:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating experience",
    })
  }
})

router.delete("/experience/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid experience ID" })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Filter out the experience
    const originalLength = user.experience.length
    user.experience = user.experience.filter((exp) => exp._id.toString() !== id)

    if (user.experience.length === originalLength) {
      return res.status(404).json({ success: false, message: "Experience not found" })
    }

    await user.save()

    res.json({
      success: true,
      message: "Experience deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting experience:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting experience",
    })
  }
})


module.exports = router
