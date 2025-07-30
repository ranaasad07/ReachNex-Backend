const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');

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


module.exports = {
    userVerification
}