const Sentry = require('@sentry/node')
const { SENTRY_KEY } = require('../../config')
const { NotFoundError, ValidationError, AuthorizationError } = require('./app-errors')


Sentry.init({
  dsn: SENTRY_KEY,
  tracesSampleRate: 1.0  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
})


module.exports = (app) => {
  // catch all errors
  app.use((error, req, res, next) => {
    let reportError = true

    // Skip common errors [user geneated errors]
    const typeOfErrors = [NotFoundError, ValidationError, AuthorizationError]
    for (const typeOfError of typeOfErrors) {
      if (error instanceof typeOfError) reportError = false
    }

    if (reportError) Sentry.captureException(error)

    
    const statusCode = error.statusCode || 500
    const data = error.data || error.message
    return res.status(statusCode).json(data)
  })
}