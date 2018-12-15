'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('./users-models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/signup', jsonParser, (req, res) => {
    console.log("got it");
    const requiredFields = ['username', 'password', 'email'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    // If the username and password aren't trimmed we give an error.  Users might
    // expect that these will work without trimming (i.e. they want the password
    // "foobar ", including the space at the end).  We need to reject such values
    // explicitly so the users know what's happening, rather than silently
    // trimming them and expecting the user to understand.
    // We'll silently trim the other fields, because they aren't credentials used
    // to log in, so it's less of a problem.
    const explicityTrimmedFields = ['username', 'password', 'email'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        email: {
            min: 1
        },
        password: {
            min: 10,
            // bcrypt truncates after 72 characters, so let's not give the illusion
            // of security by storing extra (unused) info
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField]
                    .min} characters long`
                : `Must be at most ${sizedFields[tooLargeField]
                    .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let { username, password, email, firstName = '', lastName = '' } = req.body;
    // email and password come in pre-trimmed, otherwise we throw an error
    // before this
    console.log(username);
    firstName.trim();
    lastName.trim();
    console.log(req.body)
    return User.find({ username })
        .count()
        .then(count => {
            if (count > 0) {
                // There is an existing user with the same username
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'username already taken',
                    location: 'username'
                });
            }
            // If there is no existing user, hash the password
            return User.hashPassword(password);
        })
        .then(hash => {
            console.log(hash);
            console.log('username', username);
            return User.create({
                username,
                email,
                password: hash,
                firstName,
                lastName
            })
        })
        .then(user => {
            console.log(user, 'user')
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            // Forward validation errors on to the client, otherwise give a 500
            // error because something unexpected has happened
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: 'Internal server error' });
        })
    });

    
    router.get('/', (req, res) => {
        return User.find()
            .then(users => res.status(200).json(users.map(user => user.serialize())))
            .catch(err => res.status(500).json({ message: 'Internal server error' }));
    });

    // POST to login a user

    router.post('/login', jsonParser, (req, res) => {
        const requiredFields = ['username', 'password'];
        const missingField = requiredFields.find(field => !(field in req.body));

        if (missingField) {
            return res.status(422).json({
                code: 422,
                reason: 'ValidationError',
                message: 'Missing field',
                location: missingField
            });
        };

        let { username, password } = req.body;
        // console.log(username, password);
        let user;
        User.findOne({ username })
            .then(_user => {
                user = _user;
                if (!user) {
                    // Return a rejected promise so we break out of the chain of .thens.
                    // Any errors like this will be handled in the catch block.
                    return Promise.reject({
                        reason: 'ValidationError',
                        message: 'Incorrect username or password'
                    });
                }
                return user.validatePassword(password);
            })
            .then(isValid => {
                if (!isValid) {
                    console.log('failed validation');
                    return Promise.reject({
                        reason: 'ValidationError',
                        message: 'Incorrect username or password'
                    });
                }
                console.log('validation successful');
                return res.status(201).json(user.serialize());
            })
            .catch(err => {
                // Forward validation errors on to the client, otherwise give a 500
                // error because something unexpected has happened
                console.log(err.message);
                if (err.reason === 'ValidationError') {
                    return res.status(400).json(err);
                }
                res.status(500).json({ code: 500, message: 'Internal server error' });
            });
    });



    module.exports = { router };