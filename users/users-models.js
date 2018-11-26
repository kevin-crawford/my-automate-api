'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    name: {type: String, default: ''},
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.methods.serialize = function(password) {
    return {
        email: this.email || '',
        name: this.name || '',
        id: this.id || ''
    };
};

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statistics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User };