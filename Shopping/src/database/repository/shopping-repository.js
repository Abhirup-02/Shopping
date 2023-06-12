const { OrderModel, CartModel, WishlistModel } = require('../models')
const { v4: uuidv4 } = require('uuid')
const { APIError } = require('../../utils/errors/app-errors')
const _ = require('lodash')


//Dealing with data base operations
class ShoppingRepository {

    async Cart(customerId) {
        return CartModel.findOne({ customerId })
    }

    async ManageCart(customerId, product, qty, isRemove = false) {
        try {
            const cart = await CartModel.findOne({ customerId })

            if (cart) {
                if (isRemove) {
                    const cartItems = _.filter(
                        cart.items,
                        (item) => item.product._id !== product._id
                    )
                    cart.items = cartItems
                }
                else {
                    const cartIndex = _.findIndex(cart.items, { product: { _id: product._id } })

                    if (cartIndex > -1) {
                        cart.items[cartIndex].unit = qty
                    }
                    else {
                        cart.items.push({ product: { ...product }, unit: qty })
                    }
                }
                return await cart.save()
            }
            else {
                // Create a new Cart
                return await CartModel.create({
                    customerId,
                    items: [{ product: { ...product }, unit: qty }]
                })
            }
        }
        catch (err) {
            throw new APIError('DB: Unable to Manage Cart')
        }
    }

    async Wishlist(customerId) {
        return WishlistModel.findOne({ customerId })
    }

    async ManageWishlist(customerId, product_id, isRemove = false) {
        const wishlist = await WishlistModel.findOne({ customerId })

        if (wishlist) {
            if (isRemove) {
                const products = _.filter(
                    wishlist.products,
                    (product) => product._id !== product_id
                )
                wishlist.products = products
            }
            else {
                const wishlistIndex = _.findIndex(wishlist.products, { _id: product_id })

                if (wishlistIndex < 0) {
                    wishlist.products.push({ _id: product_id })
                }
            }
            return await wishlist.save()
        }
        else {
            // Create a new Wishlist
            return await WishlistModel.create({
                customerId,
                products: [{ _id: product_id }]
            })
        }
    }

    async Orders(customerId, orderId) {
        console.log(customerId)
        console.log(orderId)
        if (orderId) {
            return OrderModel.findOne({ orderId })
        }
        else {
            return OrderModel.find({ customerId })
        }
    }

    async CreateNewOrder(customerId, txnId) {

        try {
            const cart = await CartModel.findOne({ customerId })

            if (cart) {
                let amount = 0
                let cartItems = cart.items

                if (cartItems.length > 0) {
                    // Process Order
                    cartItems.map((item) => {
                        amount += parseInt(item.product.price) * parseInt(item.unit)
                    })

                    const orderId = uuidv4()

                    const order = new OrderModel({ orderId, customerId, amount, txnId, status: 'received', items: cartItems })

                    cart.items = []

                    const orderResult = await order.save()
                    await cart.save()
                    return orderResult
                }
            }
            return {}
        }
        catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Category')
        }
    }

    async DeleteProfileData(customerId) {
        return Promise.all([
            CartModel.findOneAndDelete({ customerId }),
            WishlistModel.findOneAndDelete({ customerId })
        ])
    }
}

module.exports = ShoppingRepository