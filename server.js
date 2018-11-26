const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const config = require('config');
const jwtAuth = passport.authenticate('jwt', {session: false});

const { router: usersRouter } = require('./users/users-router');
const { router: vehiclesRouter } = require('./vehicles/vehicles-router');
const { localStrategy, jwtStrategy } = require('./auth/auth-strategy');
const { router: authRouter } = require('./auth/auth-router');
const { PORT, DATABASE_URL } = require('./config');



mongoose.Promise = global.Promise;
const app = express();
app.use(morgan('common')); // logging

app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-type, Authorization");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	if(req.method == "OPTIONS"){
		return res.send(204);
	}
	next();
});

app.use(express.static("public"));


passport.use(localStrategy);
passport.use(jwtStrategy);


app.use("/api/users/", usersRouter);
app.use("/api/auth/", authRouter);
app.use("/api/vehicles/", vehiclesRouter);


app.use("*", (req, res) => {
	return res.status(404).json({ message: "Not Found" });
});

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

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };