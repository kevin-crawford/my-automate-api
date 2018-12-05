'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {Maintenance} = require('./maintenance-model');
const {Vehicle} = require('../vehicles/vehicles-model');
const router = express.Router();

const jsonParser = bodyParser.json();


// API Call to add maintenance item
router.post('/add', jsonParser, (req, res) => {
	console.log('maintenance object', req.body)


	const requiredFields = ['kind', 'currentMiles', 'vehicleId'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
				const message = `Missing \`${field}\` in request body`;
				console.error(message);
				return res.status(400).send(message);
		}
	}

	Maintenance
			.create({
				kind: req.body.kind,
				currentMiles: req.body.currentMiles,
				note: req.body.note,
			})
			.then( (item) => {
				Vehicle
					.findById(req.body.vehicleId)
					.then((vehicle) => {
						vehicle.maintenance.push(item);
						vehicle.save()
						.then(() => res.status(201).json(item._id))
						console.log(item._id)
					})
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({ error: 'Could not add maintenance to vehicle'});
			});
});

// API CALL TO EDIT MAINTENANCE ITEM

router.put('/edit/:id', (req, res) => {
	// create new array object of only updated fields
	const updated = {};
	const updatableFields = ['kind', 'currentMiles', 'note'];
	updatableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Maintenance
			.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
			.then( updatedItem => {
				res.status(201).json({
					kind: updatedItem.kind,
					currentMiles: updatedItem.currentMiles,
					note: updatedItem.note
				})
			})
			.catch( err => res.status(500).json({ message: err }));
});

// API CALL TO DELETE MAINTENANCE ITEM
router.delete('/delete/:id', (req,res) => {
	Maintenance
			.findByIdAndRemove(req.params.id)
			.then(() =>
	Vehicle
		// IN PROGRESS, find vehicleId in maintenance request body
		.findById(req.body.vehicleId)
		.then(function(vehicle){
			let itemIndex = -1
			for(let i = 0; i < vehicle.maintenance.length; i++){
				if(vehicle.maintenance[i]._id == req.body.vehicleId){
					itemIndex = i;
				}
			}
			if( itemIndex !== -1) {
				vehicle.maintenance.splice(itemIndex, 1)
			}
			return vehicle.save()
		})
		.then((err) => {
			console.log(err);
			res.status(500).json({ error: 'Could not remove maintenanceId from vehicle'})
		}))
		.catch( err => {
			console.log(err);
			res.status(500).json({ error: 'Could not remove maintenance item'});
		});
});

module.exports = {router};