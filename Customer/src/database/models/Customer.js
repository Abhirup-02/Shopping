const mongoose = require('mongoose')


const CustomerSchema = new mongoose.Schema({
    email: String,
    password: String,
    salt: String,
    phone: String,
    address: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true }
    ]
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.salt;
                delete ret.__v;
            }
        },
        timestamps: true
    }
)

module.exports = mongoose.model('customer', CustomerSchema)