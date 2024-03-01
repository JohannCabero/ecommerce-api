// Dependencies and modules
const Order = require(`../models/Order.js`);
const Cart = require(`../models/Cart.js`);

// [SECTION] CHECKOUT
module.exports.checkout = async (req, res) => {
    
	if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
	    try {
	        const userId = req.user.id;

	        // Find the user's cart
	        const cart = await Cart.findOne({ userId });

	        if (!cart) {
	            return res.status(404).send({ error: 'Cart is not found for the user' });
	        } else if (cart.cartItems.length === 0) {
	        	return res.status(404).send({ error: 'Cart is empty for the user' });
	        }

	        // Calculate the total price from the cart items
	        const totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

	        // Create an order based on the cart data
	        const order = new Order({
	            userId,
	            productsOrdered: cart.cartItems.map(item => ({
	                productId: item.productId,
	                quantity: item.quantity,
	                subtotal: item.subtotal
	            })),
	            totalPrice
	        });

	        // Deletes the user's cart
            await Cart.deleteOne({ userId: userId });

	        // Save the order to the database
	        order.save()
	        .then(savedOrder => {
	        	return res.status(201).send({ 
	        		message: 'Checkout successful', 
	        		savedOrder: savedOrder 
	        	});
	        })
	        .catch(saveErr => {
	        	console.error(`Error saving the order: `, saveErr);
	        	return res.status(500).send({ error: `Error saving the order` });
	        });
	    } catch (findErr) {
	        console.error(`Error finding the user's cart: `, findErr);
	        return res.status(500).send({ error: `Error finding the user's cart` });
	    }
	}
};

// [SECTION] Retrieve logged in user's orders
module.exports.getOrders = (req, res) => {

	if(req.user.isAdmin){
		return res.status(403).send({ error: `Access Forbidden` });
	} else {
		return Order.find({ userId: req.user.id })
		.then(orders => {
			if(orders.length <= 0){
				return res.status(200).send({ message: `User has no orders` });
			} else {
				return res.status(200).send({ orders });
			}
		})
		.catch(err => {
			console.error(`Error retrieving user's orders: `, err);
			return res.status(500).send({ error: `Error retrieving user's orders` });
		})
	}
};

// [SECTION] Retrieve all orders
module.exports.getAllOrders = (req, res) => {

	return Order.find({})
	.then(orders => {
		if(orders.length > 0){
			return res.status(200).send({ orders });
		} else {
			return res.status(200).send({ message: `No orders found` });
		}
	})
	.catch(err => {
		console.error(`Error retrieving the orders: `, err);
		return res.status(500).send({ error: `Error retrieving the orders: ` });
	})
};