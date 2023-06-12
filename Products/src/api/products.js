const ProductService = require('../services/product-service')
const { RPC_Observer } = require('../utils')
const UserAuth = require('./middlewares/auth')



module.exports = (app) => {

    const service = new ProductService()

    RPC_Observer('PRODUCT_RPC', service)

    // GET All products and category
    app.get('/', async (req, res, next) => {
        try {
            const data = await service.GetProducts()
            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })

    app.post('/product/create', UserAuth, async (req, res, next) => {
        try {
            const { name, desc, type, unit, price, available, suplier, banner } = req.body
            const data = await service.CreateProduct({ name, desc, type, unit, price, available, suplier, banner })

            return res.status(201).json(data)
        }
        catch (err) {
            next(err)
        }
    })

    app.get('/category/:type', async (req, res, next) => {
        const type = req.params.type

        try {
            const data = await service.GetProductsByCategory(type)
            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })

    app.get('/:id', async (req, res, next) => {
        const productId = req.params.id

        try {
            const data = await service.GetProductDescription(productId)
            return res.status(200).json(data)
        }
        catch (err) {
            next(err)
        }
    })

    app.post('/ids', async (req, res, next) => {
        const { IDs } = req.body

        try {
            const products = await service.GetSelectedProducts(IDs)
            return res.status(200).json(products)
        }
        catch (err) {
            next(err)
        }
    })
}