const { CustomerRepository } = require("../database")
const { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils')
const { NotFoundError, ValidationError } = require('../utils/errors/app-errors')



class CustomerService {

    constructor() {
        this.repository = new CustomerRepository()
    }

    async SignIn(userInputs) {
        const { email, password } = userInputs

        const existingCustomer = await this.repository.FindCustomer({ email })
        if (!existingCustomer) throw new NotFoundError('User not found')

        const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt)

        if (!validPassword) throw new ValidationError('Password does not match')

        const token = await GenerateSignature({
            email: existingCustomer.email,
            _id: existingCustomer._id
        })
        return { id: existingCustomer._id, token }
    }

    async SignUp(userInputs) {

        const { email, password, phone } = userInputs

        // create salt
        let salt = await GenerateSalt()

        let userPassword = await GeneratePassword(password, salt)

        const existingCustomer = await this.repository.CreateCustomer({
            email,
            password: userPassword,
            phone,
            salt
        })

        const token = await GenerateSignature({ email: email, _id: existingCustomer._id })

        return { id: existingCustomer._id, token }
    }

    async AddNewAddress(_id, userInputs) {
        const { street, postalCode, city, country } = userInputs

        return this.repository.CreateAddress({ _id, street, postalCode, city, country })
    }

    async GetProfile(id) {
        return this.repository.FindCustomerById(id)
    }

    async DeleteProfile(id) {
        const data = await this.repository.DeleteCustomerById(id)

        const payload = {
            event: 'DELETE_PROFILE',
            data: { userId: id }
        }
        
        return { data, payload }
    }
}

module.exports = CustomerService