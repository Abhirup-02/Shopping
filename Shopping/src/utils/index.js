const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const amqplib = require('amqplib')
const { v4: uuid4 } = require('uuid')


const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME, QUEUE_NAME, SHOPPING_BINDING_KEY } = require("../config")


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
    const signature = req.get("Authorization")
    // console.log(signature)
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET)
    req.user = payload
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

module.exports.FormateData = (data) => {
  if (data) {
    return { data }
  } else {
    throw new Error("Data Not found!")
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


module.exports.SubscribeMessage = async (channel, service) => {
  const appQueue = await channel.assertQueue(QUEUE_NAME)

  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY)

  channel.consume(appQueue.queue, (data) => {
    service.SubscribeEvents(data.content.toString())
    channel.ack(data)
  })
}


const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {

  const channel = await getChannel()

  const Q = await channel.assertQueue("", { exclusive: true })

  channel.sendToQueue(
    RPC_QUEUE_NAME,
    Buffer.from(JSON.stringify(requestPayload)),
    {
      replyTo: Q.queue,
      correlationId: uuid
    }
  )

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      channel.close()
      resolve('API Timeout')
    }, 8000)


    channel.consume(
      Q.queue,
      (msg) => {
        if (msg.properties.correlationId == uuid) {
          resolve(JSON.parse(msg.content.toString()))
          clearTimeout(timeout)
        }
        else {
          reject('Data not found')
        }
      },
      {
        noAck: true
      }
    )
  })
}


module.exports.RPC_Request = async (RPC_QUEUE_NAME, requestPayload) => {

  const uuid = uuid4() // correlationId

  return await requestData(RPC_QUEUE_NAME, requestPayload, uuid)
}