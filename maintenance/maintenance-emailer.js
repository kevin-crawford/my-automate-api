const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
let nodemailer = require('nodemailer');

const Maintenance = require('./maintenance-model');
const router = express.Router();
const jsonParser = bodyParser.json();

router.put('/activate/:id', (req, res) => {
	// user body used to retrieve email of user
	// console.log(req.user.body)
	console.log(req.params)

	//set reminder from false to true on maintenance item
	const turnOnReminders = { reminder: true }

	Maintenance
			.findByIdAndUpdate(req.params.id, { $set: turnOnReminders }, { $new: true })
			.then( maintenanceItem => {
				res.status(201).json({
					reminder: maintenanceItem.reminder
				})
			})
			.catch( err => res.status(500).json({ message: err }));

	// create mail transporter
	// let transporter = nodemailer.createTransport({
	// 	service: 'gmail',
	// 	auth: {
	// 		user: "automateReminder@gmail.com",
	// 		pass: "automatepassword123"
	// 	}
	// });

	// send email at periodic intervals
	// intervals are determined by type of maintenance item. Oil = every 3 months whipers = 6 to 12 months air filter = ~3 years? Brakes = ~ 12 months Replace Tires = ??? ~ 3-6 years
	// OR give users the ability to change interval and create uniform range for all maintenance items eg: 1mon/3mon/6mon/ 1yr/3yr/5yr

	//EXAMPLE SCHEDULE
	// cron.schedule("* * * * Wed", function(){
	// 	console.log("----------");
	// 	console.log(" Running CRON job");
	// 	let mailOptions = {
	// 		from: "automateReminder@gmail.com",
	// 		to: "sampleuser@gmail.com",
	// 		subject: `Reminder to check your ${req.body.kind}`,
	// 		text: `Hello, this is a friendly reminder that your last ${req.body.kind} maintenance was INSERT TIME SINCE LAST MAINT. This email was sent automatically, please do not respond to this email.`
	// 	}
	// 	// EXAMPLE MAIL SENT
	// 	transporter.sendMail(mailOptions, function(error, infto) {
	// 		if(error) {
	// 			throw error;
	// 		} else {
	// 			console.log("email successfully sent!")
	// 		}
	// 	});

	// })
});

router.put('/deactivate/:id', (req, res) => {
	const turnOffReminders = { reminder: false }

	Maintenance
			.findByIdAndUpdate(req.params.id, { $set: turnOffReminders }, { $new: true })
			.then( maintenanceItem => {
				res.status(201).json({
					reminder: maintenanceItem.reminder
				})
			})
			.catch( err => res.status(500).json({ message: err }));
});

module.exports = router;