'use strict';
const {router} = require('./auth-router');
const { localStrategy, jwtStrategy } = require('./auth-strategy');

module.exports = { router, localStrategy, jwtStrategy };