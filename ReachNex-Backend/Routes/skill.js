const express = require('express');
const router = express.Router();
const {User} = require('../Database_Modal/modals');
const requireAtuh = require("../Control_Room/auth")

// Get skills
router.get('/skills', requireAtuh, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ skills: user.skills });
});

// Add skill
router.post('/skills', requireAtuh, async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.userId;

    console.log('Incoming Skill:', skill);
    console.log('User ID:', userId);

    if (!skill || typeof skill !== 'string' || skill.trim() === '') {
      return res.status(400).json({ success: false, message: 'Skill is required and must be a non-empty string.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    console.log('User Skills Before:', user.skills);

    const skillAlreadyExists = user.skills.some(
      (s) => s.toLowerCase() === skill.trim().toLowerCase()
    );

    console.log('Skill Already Exists:', skillAlreadyExists);

    if (skillAlreadyExists) {
      return res.status(409).json({ success: false, message: 'Skill already exists.' });
    }

    user.skills.push(skill.trim());
await user.save();

return res.status(200).json({
  success: true,
  message: 'Skill added successfully.',
  skills: user.skills
});

  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({ success: false, message: 'Failed to add skill. Please try again.' });
  }
});



// Update skill by index
router.put('/skills/:index', requireAtuh, async (req, res) => {
  const { skill } = req.body;
  const { index } = req.params;
  const user = await User.findById(req.userId);
  user.skills[index] = skill;
  await user.save();
  res.json({ success: true, skills: user.skills }); // ✅ yeh bhejo
});

// Delete skill by index

router.delete('/skills', requireAtuh, async (req, res) => {
  const { skill } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.skills = user.skills.filter((s) => s !== skill);
    await user.save();

    res.json({ success: true, message: 'Skill deleted successfully', skills: user.skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
