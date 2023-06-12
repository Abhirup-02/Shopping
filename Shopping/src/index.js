const app = require('express')()
const { PORT } = require('./config')
const { databaseConnection } = require('./database')
const expressApp = require('./express-app')
const { CreateChannel } = require('./utils')
const errorHandler = require('./utils/errors')

const StartServer = async() => {
    
    await databaseConnection()

    const channel = await CreateChannel()
    
    await expressApp(app, channel)

    errorHandler(app)

    app.listen(PORT, () => {
        console.log(`Shopping-Service port : ${PORT}`)
    })
    .on('error', (err) => {
        console.log(err)
        process.exit()
    })
}

StartServer()