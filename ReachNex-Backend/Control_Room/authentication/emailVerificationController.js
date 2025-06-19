const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');


const emailVerification = async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp);
  try {
    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (findUser.Otp == otp) {
      findUser.isEmailVerified = true;
      findUser.Otp = '';
      await findUser.save();
      res.status(200).json({ message: "Email verified successfully" });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('Error verifying email:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  emailVerification
}