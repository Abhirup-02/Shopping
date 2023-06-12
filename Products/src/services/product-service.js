const { ProductRepository } = require("../database")
const { NotFoundError } = require('../utils/errors/app-errors')


class ProductService {

    constructor() {
        this.repository = new ProductRepository()
    }

    async GetProducts() {
        const products = await this.repository.Products()
        if (!products) throw new NotFoundError('Products not found')

        let categories = {}

        products.map(({ type }) => {
            categories[type] = type
        })

        return { products, categories: Object.keys(categories) }
    }

    async CreateProduct(productInputs) {
        return this.repository.CreateProduct(productInputs)
    }

    async GetProductsByCategory(category) {
        const products = await this.repository.FindByCategory(category)
        if (!products.length) throw new NotFoundError(`Unable to find products under ${category} category`)

        return products
    }

    async GetProductDescription(productId) {
        const product = await this.repository.FindById(productId)
        if (!product) throw new NotFoundError('Unable to find product')
        return product
    }

    async GetSelectedProducts(selectedIds) {
        const products = await this.repository.FindSelectedProducts(selectedIds)
        return products
    }


    // RPC response
    async serveRPC_Request(payload) {
        const { type, data } = payload
        switch (type) {
            case 'VIEW_PRODUCT':
                return this.repository.FindById(data)
            case 'VIEW_PRODUCTS':
                return this.repository.FindSelectedProducts(data)
            default:
                break
        }
    }

}

module.exports = ProductService