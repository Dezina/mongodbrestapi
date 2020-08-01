const express = require('express');
const covidRoute = express.Router();

const Covid = require('../model/covid.model');

const secretkey = require('../config/config')['secretkey'];

const appRoutes = {
    publicRoutes: ['/users/login', '/users/signup', '/users/verify-otp'],
    userRoutes: ['/users/complete-profile']
};

covidRoute.route('/patients').get(function (req, res) {
    Covid.find(function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    });
});

covidRoute.route('/addpatient').post(function (req, res) {
    let covid = new Covid(req.body);

    covid.save().then(obj => {
        res.status(200).json({ message: 'Patient registered successfully.. the ambulance will arrive within 2 hrs' });
    }).catch(
        err => {
            res.status(200).json({ message: 'Error: Cannot add patient' });
        }
    );
});

covidRoute.route('/updatepatient/:id').patch(function (req, res) {
    let id = req.body._id;

    Covid.findById({ _id: req.body._id }, function (err, data) {
        if (!data) {
            res.status(200).json({ message: 'Patient is not registered..' });
        }
        else {
            data.name = req.body.name;
            data.contact = req.body.contact;
            data.address = req.body.address;
            data.symptom = req.body.symptom;
            data.description = req.body.description;
            data.pincode = req.body.pincode;
            data.area = req.body.area;
            data.hospital = req.body.hospital;
            data.ambulance = req.body.ambulance;
            data.admitted = req.body.admitted;

            data.save().then(obj => {
                res.status(200).json({ message: 'Patient admitted..' });
            }).catch(err => {
                res.status(200).json({ message: 'Error: Cannot admit Patient..' });
            });
        }
    });
});


//auth function
// function 
covidRoute.use(function (req, res, next) {
    if (appRoutes.publicRoutes.indexOf(req.url) >= 0) {
        next();
    } else {
        var token = req.body.token || req.body.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secretkey, function (err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        error_code: 406,
                        message: 'Failed to authenticate token'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided',
                error_code: 406
            });
        }
    }
});

covidRoute.use('/users', require('../controller/user.controller'));
//module.exports = router;

module.exports = covidRoute;