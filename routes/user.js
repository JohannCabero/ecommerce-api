// Dependencies and Modules
const express = require(`express`);
const userController = require(`../controllers/user.js`);
const { verifyToken, verifyAdmin } = require(`../auth.js`);

// [SECTION] Router Initialization
const router = express.Router();

// [SECTION] User Registration
router.post(`/`, userController.userRegistration);

// [SECTION] User Authentication
router.post(`/login`, userController.userAuthentication);

// [SECTION] RETRIEVE USER DETAILS
router.get("/details", verifyToken, userController.retrieveUserDetails);

// [SECTION] SET USER AS ADMIN
router.patch("/:userId/set-as-admin", verifyToken, verifyAdmin, userController.updateUserAsAdmin);

//[SECTION] UPDATE PASSWORD
router.patch('/update-password', verifyToken, userController.updatePassword);

module.exports = router;