// Dependencies and modules
require(`dotenv`).config();
const bcrypt = require(`bcrypt`);
const nodemailer = require(`nodemailer`);
const User = require(`../models/User.js`);
const auth = require(`../auth.js`);

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: process.env.notifierEmail, 
		// Your actual Gmail email address, ensure no quotation marks in .env file
		pass: process.env.notifierPW 
		// Your Gmail password
		/* 
			If you have enabled 2-factor authentication on your Google account, you can't use your regular password to access Gmail programmatically. You need to generate an app-specific password and use that in place of your actual password.

			Steps:

			1. Log in to your Google account 
			2. Go to myaccount.google.com/apppasswords 
			3. Sign in again to confirm it's you
			4. At the App name field, give the app password a name, e.g. "nodemailer", then click Create 
			5. Copy the generated 16 character password and paste it into  .env (file) > notifierPW (variable) without quotation marks instead of your actual Gmail password.
		*/
	}
});

// [SECTION] User Registration
module.exports.userRegistration = (req, res) => {

	let isDataValid = (
		req.body !== null && req.body !== undefined && req.body !== "" &&
		req.body.firstName !== null && req.body.firstName !== undefined && req.body.firstName !== "" &&
		req.body.lastName !== null && req.body.lastName !== undefined && req.body.lastName !== "" &&
		req.body.email !== null && req.body.email !== undefined && req.body.email !== "" &&
		req.body.password !== null && req.body.password !== undefined && req.body.password !== "" &&
		req.body.mobileNo !== null && req.body.mobileNo !== undefined && req.body.mobileNo !== ""
	);

	if(isDataValid){
		if(!req.body.email.includes("@")){
			return res.status(400).send({ error: `Invalid email`});
		} else if (req.body.mobileNo.length !== 11){
			return res.status(400).send({ error: `Invalid mobile number` });
		} else if (req.body.password.length < 8){
			return res.status(400).send({ error: `Password must be at least 8 characters`});
		} else {

			return User.findOne({ email: req.body.email })
			.then(foundUser => {
				if(!foundUser || foundUser.length <= 0){
					let newUser = new User({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						mobileNo: req.body.mobileNo,
						password: bcrypt.hashSync(req.body.password, 10)
					});

					return newUser.save()
					.then(result => {

						// Send notification email
						const mailOptions = {
							from: process.env.notifierEmail,
							to: req.body.email,
							subject: "Account Created for E-Commerce API",
							text: `Your account for E-Commerce API has been successfully created`
						};

						transporter.sendMail(mailOptions, (err, info) => {
							if(err){
								console.error(`Error sending notification email: `, err);
							} else {
								console.log(`Notification email sent: `, info.response);
							}
						});

						return res.status(201).send({ message: `User registered successfully!`});
					})
					.catch(saveErr => {
						console.error(`Error saving new user: `, saveErr);
						return res.status(500).send({ error: `Error registering user`});
					});
				} else {
					return res.status(409).send({ error: `Email already in use` });
				}
			})
			.catch(findErr => {
				console.error(`Error finding duplicate user: `, findErr);
				return res.status(500).send({ error: `Internal server error` });
			});
		}
	} else {
		return res.status(400).send({ error: `Invalid input` });
	}
}


// [SECTION] User Authentication
module.exports.userAuthentication = (req, res) => {

	let isDataValid = (
		req.body !== null && req.body !== undefined && req.body !== "" &&
		req.body.email !== null && req.body.email !== undefined && req.body.email !== "" &&
		req.body.password !== null && req.body.password !== undefined && req.body.password !== "" 
	);

	if(isDataValid){
		if(!req.body.email.includes("@")){
			res.status(400).send({ error: `Invalid email entered` });
		} else {
			return User.findOne({ email: req.body.email })
			.then(result => {
				if(result === null){
					res.status(403).send({ error: `User does not exist` });
				} else {
					const doesPasswordMatch = bcrypt.compareSync(req.body.password, result.password);

					if(doesPasswordMatch){
						return res.status(200).send({
							message: `Successfully logged in!`,
							access: auth.createAccessToken(result),
						});
					} else {
						return res.status(401).send({ error: `Email and password do not match.` });
					}
				}
			})
			.catch(err => {
				console.error(`Error finding user: `, err);
				return res.status(500).send({ error: `Error finding user` });
			});
		}
	} else {
		return res.status(400).send({ error: `Invalid input` });
	}
};

//[SECTION] RETRIEVE USER DETAILS
module.exports.retrieveUserDetails = (req, res) => {

    return User.findById(req.user.id)
    .then(user => {
        if(user){
        	user.password = undefined;
            return res.status(200).send({ user })
        } else {
            return res.status(404).send({ message: 'No user found.' });
        }
    })
    .catch(err => {
        console.error("Error in finding user:", err)
        return res.status(500).send({ error: 'Error finding user.'})
    });
};


// [SECTION] UPDATE USER AS ADMIN
module.exports.updateUserAsAdmin = (req, res) => {
    
	User.findById(req.params.userId)
	.then(foundUser => {
		if(!foundUser.isAdmin){
			let setUserAsAdmin = {
			    isAdmin: true
			};

			return User.findByIdAndUpdate(req.params.userId, setUserAsAdmin, { new: true })
			.then(updatedUser => {
			    if(updatedUser){
			    	updatedUser.password = undefined;
			        return res.status(200).send({ 
			            message: 'User set to Admin successfully', 
			            updatedUser: updatedUser
			        });
			    } else {
			        return res.status(404).send({ error : `Setting user as an Admin failed`});
			    }
			})
			.catch(updateErr => {
			    console.error("Error in updating the user: ", updateErr);
			    return res.status(500).send({ error: 'Error updating the user' });
			});
		} else {
			return res.status(409).send({ error: `User is already an admin` });
		}
	})
	.catch(findErr => {
		console.error(`Error finding user: `, findErr);
		return res.status(500).send({ error: `Error finding user` });
	})
};

// [SECTION] UPDATE PASSWORD
module.exports.updatePassword = (req, res) => {

	let isDataValid = (
		req.body !== null && req.body !== undefined && req.body !== "" &&
		req.body.password !== null && req.body.password !== undefined && req.body.password !== "" 
	);

	if(isDataValid){
	  	// Hash the new password
	  	bcrypt.hash(req.body.password, 10)
		.then(hashedPassword => {
	      	// Update user's password in the database
		  	return User.findByIdAndUpdate(
		  		req.user.id, 
		  		{ password: hashedPassword }, 
		  		{ new: true }
	  		);
		})
		.then(updatedUser => {
	      	if (!updatedUser) {
	        	return res.status(404).send({ error: 'User not found' });
	      	}

	      	// Send notification email
	      	const mailOptions = {
	      		from: process.env.notifierEmail,
	      		to: req.user.email,
	      		subject: "Password Changed for E-Commerce API",
	      		text: `Your password for E-Commerce API has been successfully changed`
	      	};

	      	transporter.sendMail(mailOptions, (err, info) => {
	      		if(err){
	      			console.error(`Error sending notification email: `, err);
	      		} else {
	      			console.log(`Notification email sent: `, info.response);
	      		}
	      	});

	      	return res.status(200).send({ message: 'Password reset successfully' });
		})
	    .catch(err => {
	      console.error(`Error in resetting password: `, err);
	      return res.status(500).send({ error: 'Internal server error' });
	    });
    } else {
    	return res.status(400).send({ error: `Invalid input` });
    }
};
