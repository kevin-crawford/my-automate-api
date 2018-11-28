'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Vehicle } = require('./vehicles-model');
const router = express.router();

const jsonParser = bodyParser.json();

// response for API call to get vehicles for user
router.get('/garage', (req, res) => {
	console.log('getting vehicles');

	console.log(req.params.username);
	Vehicle
			.find({ loggedInUserName: req.params.username })
})