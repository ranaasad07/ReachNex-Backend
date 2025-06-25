const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');


const logedInUserId = async (req, res) => {
  let { id } = req.body;
  console.log(id);
let _id = id
   
  try {
    const findUser = await User.findOne({ _id });

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }

      res.status(200).json({ message: "token verified successfully",findUser });
    
  } catch (err) {
    console.error('err find user', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  logedInUserId
}