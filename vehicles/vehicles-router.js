'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {Vehicle} = require('./vehicles-model');
const router = express.Router();

const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const jsonParser = bodyParser.json();


// API call to retrieve entire vehicles array for one user
router.get('/:user', jsonParser, (req, res) => {
	console.log('getting all user vehicles..');
	console.log(req.params);
	console.log(ObjectId(req.params.user))
	
	Vehicle
		.find({ user: ObjectId(req.params.user) })
		.then( vehicles => {
			console.log(vehicles)
			res.json(vehicles)
		})
		.catch( err => {
			console.log(err);
			res.status(500).json({ error: 'Could not retrieve user vehicles'})
		});
});

// API call to get one entire vehicle object
router.get('/vehicle/:id', (req, res) => {
	console.log('getting vehicle by ID');
	console.log(req.params.id);
	Vehicle
			.findById(req.params.id).populate('maintenance').exec()
			.then(vehicle => {
				res.json(vehicle.serialize())
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({ error: "Could not retrieve vehicle"})
			});
});

// response for API call to get one vehicle maintenance object only
// probably should go in the maintenance router
router.get('/maintenance/:id', (req, res) => {
	console.log('getting vehicle by ID');
	console.log(req.params.id);
	Vehicle
			.findById(req.params.id).populate('maintenance').exec()
			.then(vehicle => {
				res.json(vehicle.maintenance.map(maintenance => maintenance.serialize()))
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({ error: "Could not retrieve vehicle"})
			});
});

// API call to add vehicle 
router.post('/add', jsonParser, (req, res) => {
		console.log("vehicle object", req.body)

		const requiredFields = ['brand', 'model', 'year', 'miles', 'user'];
		for (let i = 0; i < requiredFields.length; i++) {
			const field = requiredFields[i];
			if (!(field in req.body)) {
					const message = `Missing \`${field}\` in request body`;
					console.error(message);
					return res.status(400).send(message);
			}
		}

		Vehicle
				.create({
					brand: req.body.brand,
					model: req.body.model,
					year: req.body.year,
					miles: req.body.miles,
					user: req.body.user,
				})
				.then( vehicle => res.status(201).json(vehicle.serialize()))
				.catch(err => {
					console.log(err);
					res.status(500).json({ error: 'Vehicle failed to create'});
				});
});

// API call to edit vehicle
router.put('/edit/:id', jsonParser, (req, res) => {
	console.log('call edit vehicle');
	console.log(req.params.id);
	console.log(req.body);

	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
				`Request path id (${req.params.id}) and request body id ` +
				`(${req.body.id}) must match`);
		console.error(message);
		return res.status(400).json({ message: message });
	}

	const updated = {};
	const updatableFields = ['brand', 'model', 'year', 'miles'];

	console.log('items to edit', req.body);

	updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    } 
  });
	console.log(updated);
	
	Vehicle
			.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true})
			.then(() => res.status(204).json({ message: 'success'}))
			.catch(err => res.status(500).json({ message: 'couldn\'t update vehicle'}));
});

// API call to delete vehicle from database
router.delete('/delete/:id', (req, res) => {
		Vehicle
				.findByIdAndRemove(req.params.id)
				.then(() => {
					console.log(`Deleted vehicle with id \`${req.params.id}\``);
					res.status(204).end();
				})
				.catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = {router};