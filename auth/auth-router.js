'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

const ObjectId = require('mongodb').ObjectID;

const createAuthToken = function(user) {
	return jwt.sign({user}, config.JWT_SECRET, {
		subject: user.username,
		expiresIn: config.JWT_EXPIRY,
		algorithm: 'HS256'
	});
};

const localAuth = passport.authenticate('local', { session: false });
router.use(bodyParser.json());

// USERNAME and password needed to login
router.post('/login', localAuth, (req, res) => {
	const userId = ObjectId(req.user._id);
	const authToken = createAuthToken(req.user.serialize());
	res.json({authToken, userId});
});

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/refresh', jwtAuth, (req, res) => {
	console.log('refresh req.user', req.user);
	const userId = req.user.id;
	console.log('refresh userId', userId);
	const authToken = createAuthToken(req.user);
	res.json({authToken, userId});
});


module.exports = {router};