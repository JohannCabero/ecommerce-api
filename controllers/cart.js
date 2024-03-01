// Dependencies and Modules
const Cart = require(`../models/Cart.js`);
const Product = require(`../models/Product.js`);

// [SECTION] Data Validity Function
const isDataValid = (req) => {
	let bodyValidity = (
		req.body !== null && req.body !== undefined && req.body !== "" &&
		req.body.cartItems !== null && req.body.cartItems !== undefined && req.body.cartItems !== ""
	);

	let cartItemsValidity;

	if(bodyValidity){

		for(let item of req.body.cartItems){
			cartItemsValidity = (
				item.productId !== null && item.productId !== undefined && item.productId !== "" &&
				item.quantity !== null && item.quantity !== undefined && item.quantity !== ""
			);

			if(!cartItemsValidity){
				break;
			}
		}
	} else {
		return bodyValidity;
	}
	
	return bodyValidity && cartItemsValidity;
}

// [SECTION] Retrieve User's Cart
module.exports.getCart = (req, res) => {

	if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
		return Cart.findOne({ userId: req.user.id })
		.then(cart => {
			if(!cart){
				return res.status(404).send({ error: `User does not have a cart` });
			} else {
				return res.status(200).send({ cart });
			}
		})
		.catch(err => {
			console.error(`Error finding user's cart: `, err);
			return res.status(500).send({ error: `Error finding user's cart` });
		});
	}
};

// [SECTION] Add to Cart
module.exports.addToCart = async (req, res) => {

	if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
		if(isDataValid(req)){
			try {
		        const cartUpdates = req.body.cartItems; // Assuming req.body.cartItems is an array of products
		        const userId = req.user.id;

		        // Find the user's cart or create a new one if it doesn't exist
		        let cart = await Cart.findOne({ userId });

		        if (!cart) {
		            cart = new Cart({ userId, cartItems: [], totalPrice: 0 });
		        }

		        // Process each product in the request
		        for (const cartUpdate of cartUpdates) {
		            const { productId, quantity } = cartUpdate;

		            // Fetch the product's details from the database
		            const product = await Product.findById(productId);

		            if (!product) {
		                return res.status(404).send({ error: `Product with ID ${productId} not found` });
		            }

		            // Calculate subtotal for the product
		            const subtotal = product.price * quantity;

		            // Check if the product is already in the cart
		            const existingProductIndex = cart.cartItems.findIndex(item => item.productId === productId);

		            if (existingProductIndex !== -1) {
		                // If the product is already in the cart, add to the existing quantity and subtotal
		                cart.cartItems[existingProductIndex].quantity += Number(quantity);
		                cart.cartItems[existingProductIndex].subtotal += Number(subtotal);
		            } else {
		                // If the product is not in the cart, add it
		                cart.cartItems.push({ productId, quantity, subtotal });
		            }

		            // Update the total price
		            cart.totalPrice += subtotal;
		        }

		        // Save the updated cart
		        return cart.save()
	    	    .then(updatedCart => {
	    	    	return res.status(200).send({
	    	    		message: 'Products added to the cart successfully',
	    	    		updatedCart: updatedCart
	    	    	});
	    	    })
	    	    .catch(saveErr => {
	    	    	console.error(`Error saving the cart: `, saveErr);
	    	    	return res.status(500).send({ error: `Error saving the cart`});
	    	    });
		    } catch (findErr) {
		        console.error(`Error finding the user's cart: `, findErr);
		        return res.status(500).send({ error: `Error finding the user's cart` });
		    }
		} else {
			return res.status(400).send({ error: `Invalid input` });
		}
	}
};

// [SECTION] CHANGE PRODUCTS QUANTITY
module.exports.updateCartQuantity = async (req, res) => {
    
    if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
		if(isDataValid(req)){
	    	try {
	    	    const cartUpdates = req.body.cartItems; // Assuming req.body.cartItems is an array of product updates
	    	    const userId = req.user.id;

	    	    // Find the user's cart
	    	    const cart = await Cart.findOne({ userId });

	    	    if (!cart) {
	    	        return res.status(404).json({ error: 'Cart not found for the user' });
	    	    }
	    	    
	    	    // Process each product update in the request
	    	    for (const cartUpdate of cartUpdates) {
	    	        const { productId, quantity } = cartUpdate;

	    	        // Fetch the product's details from the database
	    	        const product = await Product.findById(productId);

	    	        if (!product) {
	    	            return res.status(404).json({ error: `Product with ID ${productId} not found` });
	    	        }

	    	        // Calculate subtotal for the product
	    	        const subtotal = product.price * quantity;

	    	        // Find the product in the cart
	    	        const existingProductIndex = cart.cartItems.findIndex(item => item.productId === productId);

	    	        if (existingProductIndex === -1) {
	    	        	if(quantity > 0){
	    	        		// If the product is not in the cart and quantity is not 0, add it
	    	        		cart.cartItems.push({ productId, quantity, subtotal });
	    	        	}
	    	        } else if (quantity <= 0) {
	    	        	// If the product's quantity is set to less than or equal to 0, remove the product from the cart
	    	        	cart.totalPrice -= cart.cartItems[existingProductIndex].subtotal;
	    	        	cart.cartItems.splice(existingProductIndex, 1);
	    	    	} else {
	    	    		// If the product exists in the cart, replace the product's quantity and subtotal
	    	    		// Subtract previous subtotal to totalPrice to ensure that totalPrice reflects the changes in product subtotal
	    	        	cart.totalPrice -= cart.cartItems[existingProductIndex].subtotal;
	    	        	// Update quantity and subtotal for the product in the cart
	    	        	cart.cartItems[existingProductIndex].quantity = quantity;
	    	        	cart.cartItems[existingProductIndex].subtotal = subtotal;
	    	        }

	    	        // Update the total price
	    	        cart.totalPrice += subtotal;
	    	    }

	    	    // Save the updated cart
	    	    return cart.save()
	    	    .then(updatedCart => {
	    	    	return res.status(200).send({
	    	    		message: 'Cart quantity updated successfully',
	    	    		updatedCart: updatedCart
	    	    	});
	    	    })
	    	    .catch(saveErr => {
	    	    	console.error(`Error saving the cart: `, saveErr);
	    	    	return res.status(500).send({ error: `Error saving the cart`});
	    	    });
		    } catch (findErr) {
		        console.error(`Error finding the user's cart: `, findErr);
		        return res.status(500).send({ error: `Error finding the user's cart` });
		    }
		} else {
			return res.status(400).send({ error: `Invalid input` });
		}
    }
};

// [SECTION] Remove item from cart
module.exports.removeFromCart = (req, res) => {

	if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
		return Cart.findOne({ userId: req.user.id })
		.then(cart => {

			if(!cart){
				return res.status(404).send({ error: `Cart not found for the user` });
			}

			let removedItem = 0;

			for(let item of cart.cartItems){
				if(item.productId === req.params.productId){
					// Subtract removed item's subtotal from total price
					cart.totalPrice -= item.subtotal;

					// Only include in cartItems array the items which do not have the same productId as the item to be removed
					cart.cartItems = cart.cartItems.filter(item => 
						item.productId !== req.params.productId
					);
					removedItem++;
				} 
			}

			if(removedItem <= 0){
				return res.status(404).send({ error: `Product not found in cart` });
			}

			return cart.save()
			.then(updatedCart => {
				return res.status(200).send({
					message: `Product deleted successfully`,
					updatedCart: updatedCart
				});
			})
			.catch(saveErr => {
				console.error(`Error updating the cart: `, saveErr);
				return res.status(500).send({ error: `Error updating the cart`});
			});
		})
		.catch(findErr => {
			console.error(`Error finding the cart: `, findErr);
			return res.status(500).send({ error: `Error finding the cart`});
		});
	}
};

//[SECTION] CLEAR CART
module.exports.clearCart = async (req, res) => {
    
	if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
	    try {
	        const userId = req.user.id;

	        // Find the user's cart
	        const cart = await Cart.findOne({ userId });

	        if (!cart) {
	            return res.status(404).json({ error: 'Cart not found for the user' });
	        }

	        if(cart.cartItems.length > 0){
		        // Clear the items in the cart
		        cart.cartItems = [];
		        cart.totalPrice = 0;
	        } else {
	        	return res.status(404).send({ error: `Cart has no items to clear` });
	        }

	        // Save the updated cart
	        return cart.save()
	        .then(clearedCart => {
	        	return res.status(200).send({
	        		message: `Cart cleared successfully`,
	        		clearedCart: clearedCart
	        	});
	        })
	        .catch(saveErr => {
	        	console.error(`Error clearing the cart: `, saveErr);
	        	return res.status(500).send({ error: `Error clearing the cart`});
	        });
	    } catch (findErr) {
	        console.error(`Error finding the user's cart: `, findErr);
	        return res.status(500).send({ error: `Error finding the user's cart` });
	    }
	}
};
