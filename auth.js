// Dependencies
const jwt = require(`jsonwebtoken`);

// Secret Key
const secret = "CaberoDawalEcommerce";

// [SECTION] Token Creation/Encryption
module.exports.createAccessToken = (user) => {
	
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};

	return jwt.sign(data, secret, {});
};

// [SECTION] Token Verification
module.exports.verifyToken = (req, res, next) => {

	let token = req.headers.authorization;

	if(typeof token === "undefined"){
		return res.status(401).send({ auth: `Failed. No token.`});
	} else {
		token = token.slice(7, token.length);

		jwt.verify(token, secret, (err, decodedToken) => {
			if(err){
				console.error(`Error verifying token `, err);
				return res.status(500).send({
					auth: "Failed",
					message: err.message
				});
			} else {
				req.user = decodedToken;
				next();
			}
		});
	}
};

// [SECTION] Admin Verification
module.exports.verifyAdmin = (req, res, next) => {

	if(req.user.isAdmin){
		next();
	} else {
		return res.status(403).send({
			auth: "Failed",
			message: "Access Forbidden"
		});
	}
};