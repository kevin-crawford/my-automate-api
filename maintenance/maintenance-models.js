'use strict'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const vehicleSchema = mongoose.Schema({
	kind: { type: String, required: true },
	currentMiles: { type: String, required: true},
	note: { type: String, required: true },
	created: { type: Date, default: Date.now, required: true },
});

vehicleSchema.methods.serialize = function() {
	return {
		id: this._id,
		kind: this.kind,
		currentMiles: this.currentMiles,
		note: this.note,
		created: this.created,
	}
}

const Vehicle = mongoose.model('Vehicle',vehicleSchema);

module.exports = Vehicle;