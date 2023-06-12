const { ProductModel } = require('../models')
const { APIError } = require('../../utils/errors/app-errors')


class ProductRepository {

  async Products() {
    try {
      return await ProductModel.find()
    }
    catch (err) {
      throw new APIError('DB: Unable to Get Products')
    }
  }

  async CreateProduct({ name, desc, type, unit, price, available, suplier, banner }) {
    try {
      const product = new ProductModel({ name, desc, type: type.toLowerCase(), unit, price, available, suplier, banner })

      const productResult = await product.save()
      return productResult
    }
    catch (err) {
      throw new APIError('DB: Unable to Create Product')
    }
  }

  async FindById(id) {
    try {
      return await ProductModel.findById(id)
    }
    catch (err) {
      // throw new APIError('DB: Unable to Find Product')
    }
  }

  async FindByCategory(category) {
    try {
      const products = await ProductModel.find({ type: category })
      return products
    }
    catch (err) {
      throw new APIError('DB: Unable to Find Products')
    }
  }

  async FindSelectedProducts(selectedIds) {
    try {
      const products = await ProductModel.find()
        .where('_id')
        .in(selectedIds.map((_id) => _id))
        .exec()
      return products
    }
    catch (err) {
      throw new APIError('DB: Unable to Find Products')
    }
  }
}

module.exports = ProductRepository
