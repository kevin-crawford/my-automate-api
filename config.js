'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://admin:admin1234@ds111113.mlab.com:11113/travelers';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://admin:admin1234@ds111113.mlab.com:11113/travelers';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';