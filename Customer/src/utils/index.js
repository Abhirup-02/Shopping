const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const amqplib = require('amqplib')

const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME } = require("../config")


module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt()
}

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt)
}

module.exports.ValidatePassword = async (enteredPassword, savedPassword, salt) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword
}

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" })
  }
  catch (error) {
    return error
  }
}

module.exports.ValidateSignature = async (req) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const payload = jwt.verify(token, APP_SECRET)
    req.user = payload
    return true
  } catch (error) {
    return false
  }
}


/* --------------------------- Message Broker  ------------------------  */

module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL)
    const channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE_NAME, 'direct', false)
    return channel
  }
  catch (err) {
    throw err
  }
}

module.exports.PublishMessage = async (channel, routing_key, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, routing_key, Buffer.from(message))
  }
  catch (err) {
    throw err
  }
}