'use strict'
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');


//------------ ROUTER IMPORTS --------------------///
const usersRouter  = require('./users/users-router');
const vehiclesRouter = require('./vehicles/vehicles-router');
const maintenanceRouter = require('./maintenance/maintenance-router');
const reminderRouter = require('./maintenance/maintenance-emailer');

//------- AUTH STRATEGIES -----------------------//
const { localStrategy, jwtStrategy } = require('./auth/auth-strategy');
const authRouter = require('./auth/auth-router');

//---------------- CONFIG IMPORT ------------------ ///
const { PORT, TEST_DATABASE_URL, CLIENT_ORIGIN } = require('./config');


mongoose.Promise = global.Promise;

//initialize app
const app = express();

 // logging
app.use(morgan('common'));

// CORS
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-type, Authorization");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	if(req.method == "OPTIONS"){
		return res.send(204);
	}
	next();
});

app.use(
	cors({
			origin: CLIENT_ORIGIN
	})
);

app.use(bodyParser.json());

// SERVE STATIC ASSETS
app.use(express.static("public"));


passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });


// ------- application routers for user/authentication/vehicles---------------------------- //

app.use("/users/", usersRouter);
app.use("/auth/", authRouter);
app.use("/vehicles/", vehiclesRouter);
app.use("/maintenance/", maintenanceRouter);
app.use("/reminders/", reminderRouter);

// catch-all endpoint if client makes request to non-existent endpoint
app.use("*", (req, res) => {
	res.status(404).json({
			message: "Not Found" 
		});
});


// ---------------- RUN / CLOSE SERVER -----------------------//
// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
			mongoose.connect(
					databaseUrl,
					err => {
							if (err) {
									return reject(err);
							}
							server = app
									.listen(port, () => {
									console.log(`Your app is listening on port ${port}`);
									resolve();
							})
									.on("error", err => {
									mongoose.disconnect();
									reject(err);
							});
					}
			);
	});
}

// close server, return a promise
function closeServer() {
	return mongoose.disconnect().then(() => {
			return new Promise((resolve, reject) => {
					console.log("Closing server");
					server.close(err => {
							if (err) {
									return reject(err);
							}
							resolve();
					});
			});
	});
}

// if server.js is called directly (aka, with `node server.js`)
if (require.main === module) {
	runServer(TEST_DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };