// Dependencies and modules
const express = require(`express`);
const orderController = require(`../controllers/order.js`);
const { verifyToken, verifyAdmin } = require(`../auth.js`);

// [SECTION] Router Initialization
const router = express.Router();

// [SECTION] CHECKOUT
router.post('/checkout', verifyToken, orderController.checkout);

// [SECTION] Retrieve logged in user's orders
router.get(`/my-orders`, verifyToken, orderController.getOrders);

// [SECTION] Retrieve all orders
router.get(`/all-orders`, verifyToken, verifyAdmin, orderController.getAllOrders);

module.exports = router;