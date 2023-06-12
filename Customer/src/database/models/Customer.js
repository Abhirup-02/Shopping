const mongoose = require('mongoose')


const CustomerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    salt: String,
    phone: {
        type: String,
        required: [true, 'Phone no. is required']
    },
    address: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true }
    ]
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password
                delete ret.salt
                delete ret.__v
                delete ret.createdAt
                delete ret.updatedAt
            }
        },
        timestamps: true
    }
)

module.exports = mongoose.model('customer', CustomerSchema)