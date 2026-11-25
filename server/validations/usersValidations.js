const Ajv = require('ajv')
const ajv = new Ajv()

const EMAIL_PATTERN = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'

module.exports.signUpValidation = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string', pattern: EMAIL_PATTERN },
    password: { type: 'string', minLength: 6 },
    passwordVerify: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false
})

module.exports.signInValidation = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false
})

module.exports.updateValidation = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string', pattern: EMAIL_PATTERN },
    password: { type: 'string', minLength: 6 },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' },
    avatar: { type: 'string' },
    settings: {
      type: 'object',
      properties: { darkMode: { type: 'boolean' } },
      additionalProperties: false
    }
  },
  required: [],
  additionalProperties: false
})
