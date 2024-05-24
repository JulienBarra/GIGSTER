var express = require("express");
var router = express.Router();
const { checkBody } = require('../modules/checkBody');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRETKEY;
const { User } = require('../models/users');
const moment = require('moment')

router.post("/signup", (req, res) => {
    if (req.body.password !== req.body.verifiedPassword) {
        return res.json({ result: false, error: "Confirm your password" })
    }
    if (!checkBody(req.body, ['username', 'password', 'verifiedPassword', 'email', 'firstName', 'lastName', 'birthDate', 'phoneNumber'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    User.findOne({ username: req.body.username, email: req.body.email }).then(user => {
        if (user === null) {

            const payload = {
                username: req.body.username
            };

            const options = {
                expiresIn: '30m',
                algorithm: 'HS256'
            };

            const hash = bcrypt.hashSync(req.body.password, 10);
            const token = jwt.sign(payload, secretKey, options);
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hash,
                firstName: req.body.firstName,
                lastName: req.body.lastname,
                birthDate: moment(req.body.birthDate, 'DD/MM/YYYY').toDate(),
                phoneNumber: req.body.phoneNumber,
                isArtist: req.body.isArtist,
                isHost: req.body.isHost,
                token
            });

            const newAddress = {
                street: req.body.street,
                city: req.body.city,
                zipCode: req.body.zipCode
            };

            const newArtist = {
                genre: req.body.genre,
                member: req.body.member,
                artistName: req.body.artistName,
                placeOrigin: req.body.placeOrigin,
                artistRanking: 5
            }

            const newHost = {
                description: req.body.description,
                favoriteGenre: req.body.favoriteGenre,
                hostRanking: 5
            }

            newUser.address.push(newAddress);
            newUser.artist.push(newArtist)
            newUser.host.push(newHost)

            newUser.save().then(newDoc => {
                res.json({ result: true, token: newDoc.token });
            });
        } else {
            res.json({ result: false, error: 'User already exists' });
        }
    });
});

router.post("/signin", (req, res) => {
    if (!checkBody(req.body, ["email", "password"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
    }

    User.findOne({ email: req.body.email }).then((data) => {
        if (data && bcrypt.compareSync(req.body.password, data.password)) {
            const payload = {
                username: data.username
            };
            const options = {
                expiresIn: '30m',
                algorithm: 'HS256'
            };
            const newToken = jwt.sign(payload, secretKey, options);

            data.token = newToken;
            data.save().then(() => {
                res.json({ result: true, data });
            });
        } else {
            res.json({ result: false, error: "User not found or wrong password" });
        }
    });
});

router.post("/refresh", (req, res) => {
    const token = req.body.token;
    if (!token) {
        res.json({ result: false, error: "Token is required" });
        return;
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.json({ result: false, error: "Invalid token" });
            return;
        }

        const payload = { username: decoded.username };
        const options = { expiresIn: '30m', algorithm: 'HS256' };
        const newToken = jwt.sign(payload, secretKey, options);

        User.findOne({ username: decoded.username }).then((user) => {
            if (user) {
                user.token = newToken;
                user.save().then(() => {
                    res.json({ result: true, token: newToken });
                });
            } else {
                res.json({ result: false, error: "User not found" });
            }
        });
    });
});

module.exports = router;