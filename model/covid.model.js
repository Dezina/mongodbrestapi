const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Covid = new Schema(
    {
        name: { type: String },
        contact: { type: String },
        address: { type: String },
        symptom: { type: String },
        description: { type: String },
        pincode: { type: String },
        area: { type: String },
        hospital: { type: String },
        ambulance: { type: String },
        admitted: { type: String }
    },
    {
        collection: 'covid'
    }
);

module.exports = mongoose.model('Covid', Covid);