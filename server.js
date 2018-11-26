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
const { router: authRouter } = require('./auth/auth-router/');
const { PORT, DATABASE_URL } = require('./config');



mongoose.Promise = global.Promise;
const app = express();
app.use(morgan('common')); // logging

app.use(function(req,res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-type, Authorization");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	if(req.method == "OPTIONS"){
		return res.send(204);
	}
	next();
});


const PORT = process.env.PORT || 3000;

app.get('/api/*', (req, res) => {
	res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};