const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required']
    },
    desc: {
        type: String,
        required: [true, 'Product description is required']
    },
    banner: {
        type: String,
        required: [true, 'Product banner is required']
    },
    type: {
        type: String,
        required: [true, 'Product type is required']
    },
    unit: {
        type: Number,
        default: 1
    },
    price: {
        type: String,
        required: [true, 'Product price is required']
    },
    available: {
        type: Boolean,
        default: true
    },
    suplier: {
        type: String,
        required: [true, 'Product supplier is required']
    }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v
            }
        }
    }
)

module.exports = mongoose.model('product', ProductSchema)