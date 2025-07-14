// const { SignUp, Login ,emailVerification ,userVerification ,updatePassword,getUsernames,changeProfilePic,userEditing} = require("../Control_Room/controller");


const  {
    connectButton,
    acceptConnection ,
    rejectConnection ,
    getPendingRequests,
    getConnectionsList,
    removeConnection ,
    getAllUsersExcludingMe
} = require("../Control_Room/connection/connectionControler")
const express = require("express");
// const { logedInUserId } = require("../Control_Room/authentication/homereloadverficationController")
const router = express.Router();
// Connection-related routes
router.post("/connect", connectButton);                    // Send or cancel a connection request
router.post("/accept", acceptConnection);                  // Accept a pending request
router.post("/reject", rejectConnection);                  // Reject a pending request
router.get("/pending-requests", getPendingRequests);       // Get all incoming requests
router.get("/connections", getConnectionsList);            // Get all confirmed connections
router.post("/remove-connection", removeConnection);       // Remove a connection
router.get("/all-users", getAllUsersExcludingMe);          // Get all users except self


// router.post("/SignUp", SignUp);
// router.post("/login", Login);

module.exports = router;
