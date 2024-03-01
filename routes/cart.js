// Dependencies and Modules
const express = require(`express`);
const cartController = require(`../controllers/cart.js`);
const { verifyToken } = require(`../auth.js`);

// [SECTION] Router Initialization
const router = express.Router();

// [SECTION] Retrieve User's Cart
router.get(`/get-cart`, verifyToken, cartController.getCart);

// [SECTION] Add to Cart
router.post(`/add-to-cart`, verifyToken, cartController.addToCart);

// [SECTION] Change product quantity
router.patch(`/update-cart-quantity`, verifyToken, cartController.updateCartQuantity);

// [SECTION] Remove item from cart
router.patch(`/:productId/remove-from-cart`, verifyToken, cartController.removeFromCart);

// [SECTION] Clear cart
router.put('/clear-cart', verifyToken, cartController.clearCart);

module.exports = router;