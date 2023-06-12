const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
}



class AppError extends Error {
  constructor(name, statusCode, description) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = name
    this.statusCode = statusCode
    Error.captureStackTrace(this)
  }
}


// STATUS 500 Internal Server Error
class APIError extends AppError {
  constructor(description = 'API Error') {
    super('API INTERNAL SERVER ERROR', STATUS_CODES.INTERNAL_ERROR, description)
  }
}


// STATUS 400 Validation Error
class ValidationError extends AppError {
  constructor(description = 'Bad Request') {
    super('BAD REQUEST', STATUS_CODES.BAD_REQUEST, description)
  }
}


// STATUS 403 Authorization Error
class AuthorizationError extends AppError {
  constructor(description = 'Access Denied') {
    super('ACCESS DENIED', STATUS_CODES.UN_AUTHORISED, description)
  }
}


// STATUS 404 Not Found
class NotFoundError extends AppError {
  constructor(description = 'Not Found') {
    super('NOT FOUND', STATUS_CODES.NOT_FOUND, description)
  }
}



module.exports = { APIError, ValidationError, AuthorizationError, NotFoundError }