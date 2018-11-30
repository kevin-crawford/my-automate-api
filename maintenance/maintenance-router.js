'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Maintenance }  = require('./maintenance-model');
const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/addmaintenance', (req, res) => {
	
})