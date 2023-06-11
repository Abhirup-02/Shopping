const { SHOPPING_BINDING_KEY } = require("../config")
const CustomerService = require("../services/customer-service")
const { PublishMessage } = require("../utils")
const UserAuth = require("./middlewares/auth")


module.exports = (app, channel) => {

  const service = new CustomerService()


  app.post("/signup", async (req, res, next) => {
    try {
      const { email, password, phone } = req.body
      const { data } = await service.SignUp({ email, password, phone })
      return res.status(201).json(data)
    }
    catch (err) {
      next(err)
    }
  })

  app.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body
      const { data } = await service.SignIn({ email, password })
      return res.status(200).json(data)
    }
    catch (err) {
      next(err)
    }
  })

  app.post("/address", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user
      const { street, postalCode, city, country } = req.body
      const { data } = await service.AddNewAddress(_id, { street, postalCode, city, country })
      return res.status(201).json(data)
    }
    catch (err) {
      next(err)
    }
  })

  app.get("/profile", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user
      const { data } = await service.GetProfile({ _id })
      return res.status(200).json(data)
    }
    catch (err) {
      return res.status(500).json(err)
    }
  })

  app.delete("/profile", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user
      const { data, payload } = await service.DeleteProfile(_id)

      // Send message to Shopping-Service to delete Cart & Wishlist of that User
      PublishMessage(channel, SHOPPING_BINDING_KEY, JSON.stringify(payload))

      return res.status(202).json(data)
    }
    catch (err) {
      return res.status(500).json(err)
    }
  })
}