const mongoose = require(`mongoose`);

const cartSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: [true, `User ID is required`]
	},
	cartItems: [
		{
			productId: {
				type: String,
				required: [true, `Product ID is required`]
			},
			quantity: {
				type: Number,
				required: [true, `Quantity of the product is required`]
			},
			subtotal: {
				type: Number,
				required: [true, `Subtotal of the product is required`]
			}
		}
	],
	totalPrice: {
		type: Number,
		required: [true, `Total Price is required`]
	},
	orderedOn: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model(`Cart`, cartSchema);