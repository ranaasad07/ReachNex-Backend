const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');

const SignUp = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let code = String.fromCharCode(97 + Math.floor(Math.random()*26)) + Array.from({length:7},()=>Math.floor(Math.random()*10)).join('') + String.fromCharCode(97 + Math.floor(Math.random()*26));
    let randomUsername = fullName + "-" + code; 

    const Otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", Otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: randomUsername,
      fullName,
      email,
      password: hashedPassword,
      Otp,
      isEmailVerified: false
    });

    await user.save();

    await sendEmail(email, 'Verify your email', `Your OTP is: ${Otp}`);

    res.status(201).json({ message: 'User created successfully. Please verify your email.' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  SignUp
}
