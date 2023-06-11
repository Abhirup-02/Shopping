const mongoose = require('mongoose')

const Schema = mongoose.Schema

const WishlistSchema = new Schema({
    customerId: { type: String },
    products: [
        {
            _id: { type: String, required: true }
        }
    ]
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('wihslist', WishlistSchema)