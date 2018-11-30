'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

const createAuthToken = function(user) {
	return jwt.sign({ user }, config.JWT_SECRET, {
		subject: user.username,
		expiresIn: config.JWT_EXPIRY,
		algorithm: "HS256"
	});
};

const localAuth = passport.authenticate('local',{ session: false });

// email and password needed to login
router.post('/login', localAuth, (req, res) => {
	const authToken = createAuthToken(req.user.serialize());
	res.json({ authToken });
});

module.exports = router ;