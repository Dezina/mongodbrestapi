const mongoose = require('mongoose');
const uniquevalidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let User = new Schema(
    {
        name: { type: String },
        email: { type: String, lowercase: true, unique: true, index: true, sparse: true },
        phone: { type: String, unique: true, index: true, sparse: true },
        password: { type: String, select: false },
        about: { type: String },
        dob: { type: String },
        timestamp: { type: Date, required: true, default: Date.now }
    },
    {
        collection: 'users'
    }
);

User.plugin(uniquevalidator, { message: 'is already taken' });

module.exports = mongoose.model('User', User);