var express = require('express');
var secretkey = require('../config/config')['secretkey'];
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var router = express.Router();

var User = require('../model/user.model');

router.post('/login', (req, res) => {
    if ((req.body.email || req.body.phone) && req.body.password) {
        var qry = {
            password: req.body.password,
            $or: [{
                email: req.body.email
            }, {
                phone: req.body.phone
            }]
        }
        User.findOne(qry, '-new -password').populate({
            path: 'language',
            select: 'name image bg_image'
        }).exec((err, user) => {
            if (err) res.status(500).json({ 'error_code': 500, 'message': err });
            if (user !== undefined && user !== null) {
                var token = jwt.sign({
                    email: user.email,
                    password: user.password
                }, secretkey);

                var authObject = {
                    data: user,
                    message: "login Succesfull",
                    error_code: 200,
                    token: token
                };

                res.status(200).send(authObject);
            } else {
                res.status(200).send({ "error_code": 704, "property": "user", "message": "User Not Found" });
            }
        });
    }
});

// signup path
router.post('/signup', (req, res) => {
    if (req.body.email && req.body.password) {
        var body = req.body;
        var userObj = new User(body);
        userObj.phone = userObj.phone ? userObj.phone : "";
        userObj.about = "";
        userObj.new = true;
        userObj.save((err, user) => {
            if (err) {
                console.log(err.name);
                let count = 0, err_c, prpty, msg;

                switch (err.name) {
                    case "ValidationError":
                        for (field in err.errors) {
                            if (count == 0) {
                                switch (err.erros[field].properties.type) {
                                    case "invalid":
                                        err_c = 401;
                                        count++;
                                        res.status(200).json({ error_code: err_c, property: field, message: 'Invalid Format' });
                                        break;
                                    case 'unique':
                                        err_c = 402;
                                        count++;
                                        res.status(200).json({ error_code: err_c, property: field, message: 'Already Exist' });
                                        break;
                                    case 'user defined':
                                        err_c = 401;
                                        count++;
                                        res.status(200).json({ error_code: err_c, property: field, message: 'Invalid  Format' });
                                        break;
                                    case 'regexp':
                                        err_c = 401;
                                        count++;
                                        res.status(200).json({ error_code: err_c, property: field, message: 'Invalid Format' });
                                        break;
                                    case 'required':
                                        err_c = 403;
                                        count++;
                                        res.status(200).json({ error_code: err_c, property: field, message: 'Required' });
                                        break;
                                    default:
                                        count++;
                                        res.status(500).json({ error_code: 500, message: err });
                                        break;
                                }
                            }
                        }
                        break;
                    default:
                        res.status(500).json({ error_code: 500, message: err });
                }
            } else {
                var finalRes = {
                    data: user,
                    message: 'Success',
                    statusCode: 200
                };
                res.status(200).send(finalRes);
            }
        });

    } else {
        req.status(200).json({ error_code: 707, message: "Incomplete Params." });
    }
});

// profile complete
router.post('/complete-profile', (req, res) => {
    if (req.body.user_id) {
        User.findById(req.body.user_id, '-new -password', function (err, user) {
            if (err) {
                res.status(500).json({ error_code: 500, message: err });
            } else {
                if (user) {
                    user.phone = req.body.phone ? req.body.phone : '';
                    user.about = req.body.about ? req.body.about : '';
                    user.save(function (err, updatedUser) {
                        if (err) {
                            res.status(500).json({ error_code: 500, message: err });
                        } else {
                            var finalRes = {
                                data: updatedUser,
                                message: 'success',
                                error_code: 200
                            };
                            res.status(200).json(finalRes);
                        }
                    });
                } else {
                    res.status(200).json({ error_code: 706, message: 'user_id not exist' });
                }
            }
        });
    } else {
        res.status(200).json({ error_code: 707, message: 'Incomplete Params' });
    }
});

function fetchErrorType(err, cb) {
    console.log(err);
    let count = 0, err_c, prpty, msg;

    switch (err.name) {
        case "ValidationError":
            for (field in err.errors) {
                if (count == 0) {
                    switch (err.errors[field].properties.type) {
                        case 'invalid':
                            err_c = 401;
                            count++;
                            cb(err_c, field, 'Invalid Format');
                            break;
                        case 'unique':
                            err_c = 402;
                            count++;
                            cb(err_c, field, 'Already Exist');
                            break;
                        case 'user defined':
                            err_c = 401;
                            count++;
                            cb(err_c, field, 'Invalid Format');
                            break;
                        case 'regexp':
                            err_c = 401;
                            count++;
                            cb(err_c, field, 'Invalid Format');
                            break;
                        case 'required':
                            err_c = 403;
                            count++;
                            cb(err_c, field, 'Required');
                            break;

                        default:
                            count++;
                            cb(500, null, err);
                            break;
                    }
                }
            }
            break;

        default:
            cb(500, null, err);
            break;
    }
}

module.exports = router;