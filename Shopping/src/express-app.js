const express = require('express')
const cors  = require('cors')
const { shopping } = require('./api')


module.exports = async (app, channel) => {

    app.use(express.json({ limit: '1mb'}))
    app.use(express.urlencoded({ extended: true, limit: '1mb'}))
    app.use(cors())


    // API
    shopping(app, channel)
}