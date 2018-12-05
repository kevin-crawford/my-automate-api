'use strict'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const vehicleSchema = mongoose.Schema({
	brand: { type: String, required: true },
	model: { type: String, required: true },
	year: { type: String, required: true },
	miles: { type: String, required: true },
	created: { type: Date, default: Date.now(), required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	maintenance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' }]
});

vehicleSchema.methods.serialize = function() {
	return {
		id: this.id,
		brand: this.brand,
		model: this.model,
		year: this.year,
		miles: this.miles,
		created: this.created,
		maintenance: this.maintenance,
		user: this.user
	}
}

vehicleSchema.pre('find', function(next) {
	this.populate('maintenance');
	next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = {Vehicle};