'use strict';

const { Strategy: LocalStrategy } = require("passport-local");

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../users/users-models');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password'
		},
		(email, password, callback) => {
			let user;
			User.findOne({ email: email })
				.then(_user => {
					user = _user;
					if(!user){
						return Promise.reject({
							reason: "LoginError",
							message: 'Incorrect email or password'
						});
					}
					return callback(err, false);
				});
		}
	);

	const jwtStrategy = new JwtStrategy(
		{
			secretOrKey: JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
			algorithms: ['HS256'] 
		},
		(payload, done) => {
				done(null, payload.user);
		}
	);

	module.exports = { localStrategy, jwtStrategy };
