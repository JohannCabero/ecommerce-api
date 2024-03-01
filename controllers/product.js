// Dependencies and Modules
const Product = require(`../models/Product.js`);

// [SECTION] Data Validity Function
const isDataValid = (req) => {
	return (
		req.body !== null && req.body !== undefined && req.body !== "" &&
		req.body.name !== null && req.body.name !== undefined && req.body.name !== "" &&
		req.body.description !== null && req.body.description !== undefined && req.body.description !== "" &&
		req.body.price !== null && req.body.price !== undefined && req.body.price !== ""
	);
}

// [SECTION] Create a Product
module.exports.createProduct = (req, res) => {

	if(isDataValid(req)){
		Product.findOne({ name: req.body.name })
		.then(existingProduct => {
			if(existingProduct){
				return res.status(409).send({ error: `Product already exists` });
			} else {

				if(isNaN(req.body.price)){
					return res.status(400).send({ error: `Price must be a number` });
				}

				let newProduct = new Product({
					name: req.body.name,
					description: req.body.description,
					price: req.body.price
				});

				return newProduct.save()
				.then(savedProduct => {
					return res.status(201).send({
						message: `Product successfully created!`,
						savedProduct: savedProduct
					});
				})
				.catch(saveErr => {
					console.error(`Error saving new product: `, saveErr);
					return res.status(500).send({ error: `Internal server error saving product` });
				});
			}
		})
		.catch(findErr => {
			console.error(`Error finding the product: `, findErr);
			return res.status(500).send({ error: `Internal server error` });
		});
	} else {
		return res.status(400).send({ error: `Invalid input` });
	}

};

//[SECTION] RETRIEVE ALL PRODUCTS
module.exports.retrieveAllProducts = (req, res) => {
    
    return Product.find({})
    .then(products => {
        if(products.length > 0) {
            return res.status(200).send({ products });
        } else {
            return res.status(200).send({ message: `No products found`})
        }
    })
    .catch(err => {
        console.error("Error in finding all products: ", err)
        return res.status(500).send({ error: `Error finding products`})
    })
};

//[SECTION] RETRIVE ALL ACTIVE PRODUCTS
module.exports.retrieveActiveProducts = (req, res) => {
    //finds all data documents that matches the condition
    Product.find({ isActive: true})
    .then(products => {
        if(products.length > 0) {
            return res.status(200).send({ products })
        } else {
            return res.status(200).send({ message : `No active products found`})
        }
    })
    .catch(err => {
        console.error(`Error in finding active products: `, err)
        return res.send(500).send({ error: `Error in finding active products`})
    })
};

//[SECTION] SEARCH PRODUCT BY NAME
module.exports.getProduct = (req, res) => {

	const productId = req.params.productId;

	Product.findById(productId)
	.then(product => {
	    if(!product) {
	        return res.status(404).send({ error: `Product does not exist` })
	    } else {
	    	return res.status(200).send({ product });
	    }
	})
	.catch(err => {
		console.error(`Error finding the product: `, err);
		return res.status(500).send({ error: `Error finding product` });
	});
};

// [SECTION] Update a Product
module.exports.updateProduct = (req, res) => {

	if(isDataValid(req)){

		let updatedProduct = {
			name: req.body.name,
			description: req.body.description,
			price: req.body.price
		};

		return Product.findByIdAndUpdate(req.params.productId, updatedProduct, { new: true })
		.then(updatedProduct => {
			if(!updatedProduct){
				return res.status(404).send({ error: `Product not found` })
			} else {
				return res.status(200).send({
					message: `Product updated successfully!`,
					updatedProduct: updatedProduct
				});
			}
		})
		.catch(err => {
			console.error(`Error updating the product: `, err);
			return res.status(500).send({ error: `Error updating the product` });
		});
	} else {
		return res.status(400).send({ error: `Invalid input` });
	}
};

// [SECTION] Archive a Product
module.exports.archiveProduct = (req, res) => {

	const productId = req.params.productId;
	let archiveProduct = { isActive: false };

	return Product.findById(productId)
	.then(foundProduct => {
		if(!foundProduct){
			return res.status(404).send({ error: `Product does not exist` });
		} else {
			if(foundProduct.isActive){

				return Product.findByIdAndUpdate(productId, archiveProduct, { new: true })
				.then(archivedProduct => {
					return res.status(200).send({
						message: `Product (${foundProduct.name}) successfully archived`,
						archivedProduct: archivedProduct
					});
				})
				.catch(archiveErr => {
					console.error(`Error archiving the product: `, archiveErr);
					return res.status(500).send({ error: `Error archiving product` });
				})
			} else {
				return res.status(409).send({ error: `Product is already archived` });
			}
		}
	})
	.catch(findErr => {
		console.error(`Error finding the product: `, findErr);
		return res.status(500).send({ error: `Error finding product` })
	})
};

// [SECTION] Activate a Product
module.exports.activateProduct = (req, res) => {

	const productId = req.params.productId;
	let activateProduct = { isActive: true };

	return Product.findById(productId)
	.then(foundProduct => {
		if(!foundProduct){
			return res.status(404).send({ error: `Product does not exist` });
		} else {
			if(!foundProduct.isActive){

				return Product.findByIdAndUpdate(productId, activateProduct, { new: true })
				.then(activatedProduct => {
					return res.status(200).send({
						message: `Product (${foundProduct.name}) successfully activated`,
						activatedProduct: activatedProduct
					});
				})
				.catch(activeErr => {
					console.error(`Error activating the product: `, activeErr);
					return res.status(500).send({ error: `Error activating product` });
				})
			} else {
				return res.status(409).send({ error: `Product is already activated` });
			}
		}
	})
	.catch(findErr => {
		console.error(`Error finding the product: `, findErr);
		return res.status(500).send({ error: `Error finding product` })
	})
};

// [SECTION] Search for product by name
module.exports.searchByName = (req, res) => {

	if(req.body !== null && req.body !== undefined && req.body !== "" && req.body.name !== null && req.body.name !== undefined && req.body.name !== ""){
		return Product.find({ name: req.body.name })
		.then(products => {
			if(products.length > 0){
				return res.status(200).send({ products });
			} else {
				return res.status(404).send({ error: `Product does not exist` });
			}
		})
		.catch(err => {
			console.error(`Error finding the product: `, err);
			return res.status(500).send({ error: `Error finding the product` });
		});
	} else {
		return res.status(400).send({ error: `Invalid input` });
	}
};

//[SECTION] SEARCH ITEM BY PRICE
module.exports.searchByPrice = async (req, res) => {
    
	if(req.body !== null && req.body !== undefined && req.body !== "" && req.body.minPrice !== null && req.body.minPrice !== undefined && req.body.minPrice !== "" && req.body.maxPrice !== null && req.body.maxPrice !== undefined && req.body.maxPrice !== ""){
	    try {
	        const { minPrice, maxPrice } = req.body;
	        
	        // Validate the input
	        if (isNaN(minPrice) || isNaN(maxPrice)) {
	            return res.status(400).send({ error: 'Invalid input. Please provide valid numbers for minPrice and maxPrice.' });
	        } else if (minPrice > maxPrice) {
	        	return res.status(400).send({ error: `Minimum price must be less than or equal to the maximum price` });
	        }
	        
	        const products = await Product.find({
	            price: { $gte: minPrice, $lte: maxPrice },
	        });
	        
	        if(products.length <= 0){
	        	res.status(404).send({ error: `No products found matching the price range` });
	        } else {
	        	res.status(200).send({ products });
	        }
	    } catch (error) {
	        console.error(`Error finding the products: `, error);
	        res.status(500).send({ error: 'Internal Server Error' });
	    }
    } else {
    	return res.status(400).send({ error: `Invalid input` });
    }
};