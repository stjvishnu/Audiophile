export const HTTP_STATUS = Object.freeze({
  OK:200,
  CREATED:201,
  NO_CONTENT:204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
})

export const RESPONSE_MESSAGES = {
  SUCCESS: {
    status:'success',
    message:'Request processed successfully'
  },
  CREATED:{
    status:'success',
    message:'Resource created successfully'
  },
  NO_CONTENT:{
    status:'success',
    message: 'Request processed successfully, no content returned',
  },
  BAD_REQUEST: {
    status: 'error',
    message: 'Invalid request data',
  },
  UNAUTHORIZED: {
    status: 'error',
    message: 'Authentication required',
  },
  FORBIDDEN: {
    status: 'error',
    message: 'Access forbidden',
  },
  NOT_FOUND: {
    status: 'error',
    message: 'Resource not found',
  },
  CONFLICT: {
    status: 'error',
    message: 'Resource already exists',
  },
  INTERNAL_SERVER_ERROR: {
    status: 'error',
    message: 'Internal server error',
  },
}
