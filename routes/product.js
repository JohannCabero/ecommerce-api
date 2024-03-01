// Dependencies and Modules
const express = require(`express`);
const productController = require(`../controllers/product.js`);
const { verifyToken, verifyAdmin } = require(`../auth.js`);

// [SECTION] Router Initialization
const router = express.Router();

// [SECTION] Create a Product
router.post(`/`, verifyToken, verifyAdmin, productController.createProduct);

//[SECTION] RETRIEVE ALL PRODUCTS
router.get(`/all`, verifyToken, verifyAdmin, productController.retrieveAllProducts);

//[SECTION] RETRIEVE ALL ACTIVE PRODUCTS
router.get(`/`, productController.retrieveActiveProducts);

// [SECTION] RETRIEVE SPECIFIC PRODUCT
router.get(`/:productId`, productController.getProduct);

// [SECTION] Update Product Info
router.patch(`/:productId/update`, verifyToken, verifyAdmin, productController.updateProduct);

// [SECTION] Archive Product
router.patch(`/:productId/archive`, verifyToken, verifyAdmin, productController.archiveProduct);

// [SECTION] Activate Product
router.patch(`/:productId/activate`, verifyToken, verifyAdmin, productController.activateProduct);

// [SECTION] Search for products by name
router.post(`/searchByName`, productController.searchByName);

//[SECTION] SEARCH ITEM BY PRICE
router.post('/searchByPrice', productController.searchByPrice);

module.exports = router;