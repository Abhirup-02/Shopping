const ShoppingService = require('../services/shopping-service')
const { SubscribeMessage } = require('../utils')
const UserAuth = require('./middlewares/auth')

module.exports = (app, channel) => {

    const service = new ShoppingService()

    SubscribeMessage(channel, service)

    /* CART */

    app.post('/cart', UserAuth, async (req, res, next) => {
        const { _id } = req.user
        const { productId, qty } = req.body
        try {
            const data = await service.AddCartItem(_id, productId, qty)

            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })

    app.delete('/cart/:id', UserAuth, async (req, res, next) => {
        const { _id } = req.user
        const productId = req.params.id
        try {
            const data = await service.RemoveCartItem(_id, productId)

            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })


    app.get('/cart', UserAuth, async (req, res, next) => {

        const { _id } = req.user
        try {
            const data = await service.GetCart(_id)

            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })



    /* WISHLIST */

    app.post('/wishlist', UserAuth, async (req, res, next) => {
        const { _id } = req.user
        const { productId } = req.body

        try {
            const data = await service.AddToWishlist(_id, productId)
            return res.status(200).json(data)
        }
        catch (err) {
            return res.status(500).json(err)
        }
    })

    app.get('/wishlist', UserAuth, async (req, res, next) => {
        const { _id } = req.user
        try {
            const data = await service.GetWishlist(_id)
            return res.status(200).json(data)
        }
        catch (err) {
            return res.status(500).json(err)
        }
    })

    app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
        const { _id } = req.user
        const productId = req.params.id

        try {
            const data = await service.RemoveFromWishlist(_id, productId)
            return res.status(200).json(data)
        }
        catch (err) {
            return res.status(500).json(err)
        }
    })



    /* ORDERS */

    app.post('/order', UserAuth, async (req, res, next) => {
        const { _id } = req.user
        const { txnNumber } = req.body

        try {
            const data = await service.CreateOrder(_id, txnNumber)
            if (Object.keys(data).length === 0) {
                return res.status(200).json('Cart is empty')
            }

            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })

    app.get('/order/:id', UserAuth, async (req, res, next) => {

        try {
            const data = await service.GetOrder(req.params.id)
            return res.status(200).json(data)
        }
        catch (err) {
            return res.status(500).json(err)
        }
    })

    app.get('/orders', UserAuth, async (req, res, next) => {
        const { _id } = req.user

        try {
            const data = await service.GetOrders(_id)
            return res.status(200).json(data)
        }
        catch (err) {
            return res.status(500).json(err)
        }
    })
}