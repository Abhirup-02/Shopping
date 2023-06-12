const amqplib = require('amqplib')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME } = require("../config")


module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt()
}

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt)
}

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword
}

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" })
  } catch (error) {
    console.log(error)
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

let amqplibConnection = null

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(MESSAGE_BROKER_URL)
  }
  return await amqplibConnection.createChannel()
}


module.exports.CreateChannel = async () => {
  try {
    const channel = await getChannel()
    // await channel.assertExchange(EXCHANGE_NAME, 'direct', false)
    await channel.assertQueue(EXCHANGE_NAME, 'direct', { durable: true })
    return channel
  }
  catch (err) {
    throw err
  }
}


module.exports.RPC_Observer = async (RPC_QUEUE_NAME, service) => {
  const channel = await getChannel()
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false
  })
  channel.prefetch(1)
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (msg.content) {
        const payload = JSON.parse(msg.content.toString())
        const response = await service.serveRPC_Request(payload)

        if (response !== undefined) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId
            }
          )
        }
        else {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify('undefined')),
            {
              correlationId: msg.properties.correlationId
            }
          )
        }
        channel.ack(msg)
      }
    },
    {
      noAck: false
    }
  )
}