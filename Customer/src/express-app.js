const express = require('express')
const cors  = require('cors')
const { customer } = require('./api')


module.exports = async (app, channel) => {

    app.use(express.json({ limit: '1mb' }))
    app.use(express.urlencoded({ extended: true, limit: '1mb' }))
    app.use(cors())
    

    // API
    customer(app, channel)
}