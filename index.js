// Enables .env variables
require(`dotenv`).config();

// Dependencies and Modules
const express = require(`express`);
const mongoose = require(`mongoose`);
const cors = require(`cors`);

// [SECTION] Routes Imports
const userRoutes = require(`./routes/user.js`);
const productRoutes = require(`./routes/product.js`);
const cartRoutes = require(`./routes/cart.js`);
const orderRoutes = require(`./routes/order.js`);

// [SECTION] Server Setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// [SECTION] Mongo DB Database Connection: ecommerce-API
mongoose.connect(process.env.mongoDB);

mongoose.connection.once(`open`, () => console.log(`Now connected to Mongo DB Atlas.`));

// [SECTION] Use the Routes
app.use(`/b2/users`, userRoutes);
app.use(`/b2/products`, productRoutes);
app.use(`/b2/cart`, cartRoutes);
app.use(`/b2/orders`, orderRoutes);

// [SECTION] Server Gateway Response
if(require.main === module){
	app.listen(process.env.PORT, () => console.log(`API is now online on port ${process.env.PORT}`));
}

module.exports = { app, mongoose };