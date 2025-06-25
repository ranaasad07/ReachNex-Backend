// const { SignUp, Login ,emailVerification ,userVerification ,updatePassword,getUsernames,changeProfilePic,userEditing} = require("../Control_Room/controller");
const {SignUp} = require("../Control_Room/authentication/signupController")
const {Login} = require("../Control_Room/authentication/loginController")
const {profileUser} = require("../Control_Room/authentication/profileUser")
const {emailVerification} = require("../Control_Room/authentication/emailVerificationController")
const {userVerification} = require("../Control_Room/authentication/forgetPasswordController")
const {updatePassword} = require("../Control_Room/authentication/updatePasswordController")

const {logedInUserId} = require("../Control_Room/authentication/homereloadverficationController")

const express = require("express");
// const { logedInUserId } = require("../Control_Room/authentication/homereloadverficationController")
const router = express.Router();



router.post("/SignUp", SignUp);
router.post("/login", Login);
router.get('/getuser/:id',profileUser)
router.post('/verifyemail',emailVerification)
router.post('/forgetpassword',userVerification)
router.post('/updatepassword',updatePassword)
router.post('/verifyloginuser',logedInUserId)

 
// router.get('/getusernames/:mail',getUsernames)
// router.post('/updateProfilePic',changeProfilePic)
// router.post('/userediting',userEditing);

module.exports = router;
