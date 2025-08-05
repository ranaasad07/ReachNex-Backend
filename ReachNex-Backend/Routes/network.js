const express = require("express");
const router = express.Router();
const auth = require("../Control_Room/auth");
const {User} = require("../Database_Modal/modals")
const { getSuggestions, sendConnectionRequest, getIncomingRequests, acceptRequest, rejectRequest, getConnectionCount, getPendingRequests, userConnections, showConnection ,getPendingRequestCount} = require("../Control_Room/connectionController");

router.get("/suggestions", auth, getSuggestions);
router.post("/send", auth, sendConnectionRequest);
router.get("/requests", auth, getIncomingRequests);
router.post("/accept", auth, acceptRequest);
router.post("/reject", auth, rejectRequest);
router.get("/user/connections", auth, getConnectionCount);
router.get("/pending", auth, getPendingRequests);
router.get("/connections/:userId", auth , userConnections)  
router.get("/user/connections/:userId",auth ,  showConnection)  
router.get("/connection-requests/count", auth, getPendingRequestCount);



router.get("/experience/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
 
    const sortedExperiences = user.experience.sort(
      (a, b) =>
        new Date(b.createdAt || b._id.getTimestamp()) -
        new Date(a.createdAt || a._id.getTimestamp())
    );

    res.json(sortedExperiences);
  } catch (error) {
    console.error("Error fetching visitor experiences:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching experiences",
    });
  }
});




module.exports = router;
