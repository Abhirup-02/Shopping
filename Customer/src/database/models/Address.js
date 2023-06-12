const mongoose = require('mongoose')


const AddressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: [true, 'Street is required']
    },
    postalCode: {
        type: String,
        required: [true, 'PostalCode is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required']
    }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v
                delete ret.createdAt
                delete ret.updatedAt
            }
        },
        timestamps: true
    })

module.exports = mongoose.model('address', AddressSchema)