'use strict'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;



const maintenanceSchema = mongoose.Schema({
	kind: { type: String, required: true },
	currentMiles: { type: String, required: true},
	note: { type: String, required: true },
	created: { type: Date, default: Date.now, required: true },
	reminder: { type: Boolean, default: false},
	vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
});

maintenanceSchema.methods.serialize = function() {
	return {
		id: this._id,
		kind: this.kind,
		currentMiles: this.currentMiles,
		note: this.note,
		created: this.created,
		reminder: this.reminder,
		vehicle: this.vehicle
	}
}

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = {Maintenance};