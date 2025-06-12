const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../Email_sending_file/sendEmail');
const { User } = require('../Database_Modal/modals');

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

const userVerification = async (req, res) => {
  const { email } = req.body;
  console.log(email)
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      //   return res.status(400).json({ message: 'User already exists' });

      const Otp = Math.floor(100000 + Math.random() * 900000).toString();

      existingUser.Otp = Otp
      existingUser.isEmailVerified = false
      // const user = new User({
      //   Otp,
      //   isEmailVerified: false
      // });

      // await user.save();
      existingUser.save()

      await sendEmail(email, 'Verify your email', `Your OTP is: ${Otp}`);
    }


    res.status(201).json({ message: 'otp sent successfully' });
  } catch (err) {
    console.error('otp Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

const updatePassword = async (req, res) => {
  const { password, email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();

    setTimeout(() => {
      res.status(200).json({ message: 'Password updated successfully' });
    }, 2000);
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsernames = async (req, res) => {
  try {
    const { mail } = req.params;

    const findUser = await User.findOne({ email: mail }); // ✅ Correct query

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      username: findUser.username,
      fullName: findUser.fullName,
      profilePic: findUser.profilePicture,
      gender:findUser.gender,
      bio:findUser.bio,
      showSuggestions:findUser.showSuggestions
    });


  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changeProfilePic = async (req, res) => {
  try {
    const { email, profilePicture } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { profilePicture: profilePicture },
      { new: true }
    );

    if (updatedUser) {
      return res.status(200).json({ message: 'Profile picture changed', user: updatedUser });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

  } catch (err) {
    console.error('Error updating profile picture:', err);
    return res.status(500).json({ message: 'Could not change profile picture' });
  }
};

const userEditing = async (req, res) => {
  try {
    const { email, bio, gender, showSuggestions } = req.body;

    const updateBio = await User.findOneAndUpdate(
      { email }, // filter by email
      {
        bio,
        gender,
        showSuggestions,
      },
      { new: true }
    );

    if (updateBio) {
      res.status(200).json(updateBio);
    } else {
      res.status(404).json({ message: 'User not found or update failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating bio', error: err.message });
  }
};


module.exports = {
  SignUp,
  Login,
  emailVerification,
  userVerification,
  updatePassword,
  getUsernames,
  changeProfilePic,
  userEditing
};
