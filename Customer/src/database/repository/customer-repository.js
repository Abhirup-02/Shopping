const { CustomerModel, AddressModel } = require("../models")

const { APIError, STATUS_CODES } = require("../../utils/errors/app-errors")


class CustomerRepository {

  async CreateCustomer({ email, password, phone, salt }) {
    try {
      const customer = new CustomerModel({ email, password, salt, phone, address: [] })
      const customerResult = await customer.save()
      return customerResult
    }
    catch (err) {
      throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Create Customer")
    }
  }

  async CreateAddress({ _id, street, postalCode, city, country }) {
    try {
      const profile = await CustomerModel.findById(_id)

      if (profile) {
        const newAddress = new AddressModel({ street, postalCode, city, country })
        await newAddress.save()

        profile.address.push(newAddress)
      }
      return await profile.save()
    }
    catch (err) {
      throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Error on Create Address")
    }
  }

  async FindCustomer({ email }) {
    try {
      const existingCustomer = await CustomerModel.findOne({ email })
      return existingCustomer
    }
    catch (err) {
      throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Customer")
    }
  }

  async FindCustomerById({ id }) {
    try {
      const existingCustomer = await CustomerModel.findById(id)
        .populate("address")

      return existingCustomer
    }
    catch (err) {
      throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Customer")
    }
  }

  async DeleteCustomerById(id) {
    const customer = await this.FindCustomerById({ id })
    const ids = customer.address.map((place) => place._id)

    return Promise.all([
      CustomerModel.findByIdAndDelete(id),
      AddressModel.deleteMany({ _id: { $in: ids } })
    ])
  }
}

module.exports = CustomerRepository