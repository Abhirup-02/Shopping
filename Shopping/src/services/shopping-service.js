const { ShoppingRepository } = require("../database")
const { CartModel } = require("../database/models")
const { FormateData, RPC_Request } = require("../utils")



class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository()
  }


  async AddCartItem(customerId, product_id, qty) {
    // Grab product info from Product-Service through RPC
    const productResponse = await RPC_Request('PRODUCT_RPC', {
      type: 'VIEW_PRODUCT',
      data: product_id
    })
    
    if (productResponse && productResponse._id) {
      const data = await this.repository.ManageCart(customerId, productResponse, qty)

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


  /* ORDERS */

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput

    // Verify the txnNumber with payment logs

    try {
      const orderResult = await this.repository.CreateNewOrder(_id, txnNumber)
      return FormateData(orderResult)
    }
    catch (err) {
      throw new APIError("Data Not found", err)
    }
  }

  async GetOrders(customerId) {
    try {
      const orders = await this.repository.Orders(customerId)
      return FormateData(orders)
    }
    catch (err) {
      throw new APIError("Data Not found", err)
    }
  }

  async ManageCart(customerId, item, qty, isRemove) {

    const cartResult = await this.repository.AddCartItem(customerId, item, qty, isRemove)

    return FormateData(cartResult)
  }

  async SubscribeEvents(payload) {

    payload = JSON.parse(payload)

    const { event, data } = payload

    const { userId, product, qty } = data

    switch (event) {
      case 'ADD_TO_CART':
        this.ManageCart(userId, product, qty, false)
        break
      case 'REMOVE_FROM_CART':
        this.ManageCart(userId, product, qty, true)
        break
      default:
        break
    }

  }


  async GetOrderPayload(userId, order, event) {

    if (order) {
      const payload = {
        event,
        data: { userId, order }
      }
      return payload
    }
    else {
      return FormateData({ error: 'No Order available' })
    }
  }
}

module.exports = ShoppingService