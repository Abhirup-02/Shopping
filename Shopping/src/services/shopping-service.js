const { ShoppingRepository } = require('../database')
const { RPC_Request } = require('../utils')
const { APIError } = require('../utils/app-errors')



class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository()
  }


  async AddCartItem(customerId, product_id, qty) {
    /* Grab product info from Product-Service through RPC */
    const productResponse = await RPC_Request('PRODUCT_RPC', {
      type: 'VIEW_PRODUCT',
      data: product_id
    })
    // console.log(productResponse)

    if (productResponse && productResponse._id) {
      const data = await this.repository.ManageCart(customerId, productResponse, qty, false)

      return data
    }

    throw new Error('Product not Found')
  }

  async RemoveCartItem(customerId, product_id) {
    return await this.repository.ManageCart(customerId, { _id: product_id }, 0, true)
  }

  async GetCart(_id) {
    try {
      return this.repository.Cart(_id)
    }
    catch (err) {
      throw err
    }
  }

  async AddToWishlist(customerId, product_id) {
    return await this.repository.ManageWishlist(customerId, product_id)
  }

  async RemoveFromWishlist(customerId, product_id) {
    return await this.repository.ManageWishlist(customerId, product_id, true)
  }

  async GetWishlist(customerId) {
    // Perform RPC call
    const { products } = await this.repository.Wishlist(customerId)
    if (Array.isArray(products)) {
      const ids = products.map((_id) => _id)
      const productResponse = await RPC_Request('PRODUCT_RPC', {
        type: 'VIEW_PRODUCTS',
        data: ids
      })

      if (productResponse) {
        return productResponse
      }
    }

    return {}
  }

  async CreateOrder(customerId, txnNumber) {
    // Verify the txnNumber with payment logs
    return await this.repository.CreateNewOrder(customerId, txnNumber)
  }

  async GetOrder(orderId) {
    try {
      return await this.repository.Orders('', orderId)
    }
    catch (err) {
      throw new APIError('Data Not found')
    }
  }

  async GetOrders(customerId) {
    try {
      return await this.repository.Orders(customerId)
    }
    catch (err) {
      throw new APIError('Data Not found')
    }
  }


  async SubscribeEvents(payload) {
    payload = JSON.parse(payload)
    const { event, data } = payload

    switch (event) {
      case 'DELETE_PROFILE':
        await this.repository.DeleteProfileData(data.userId)
        break
      default:
        break
    }
  }

}

module.exports = ShoppingService