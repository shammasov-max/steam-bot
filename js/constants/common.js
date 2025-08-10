const isProduction = process.env.NODE_ENV !== 'development'
const domain = isProduction ? 'https://inosoft.market' : 'https://localhost'

const msInSecond = 1000
const msInMinute = 60 * msInSecond
const msInHour = msInMinute * 60
const msInDay = msInHour * 24

const webApiTokenRegex = /webapi_token&quot;:&quot;(.*)&quot;/

const serverErrors = {
  userNotFound: 'userNotFound',
  licenseExpired: 'licenseExpired',
  invalidPC: 'invalidPC',
  somethingWentWrong: 'somethingWentWrong',
  serverError: 'serverError',
  invalidResponse: 'invalidResponse',
  invalidRequest: 'invalidRequest'
}

module.exports = {
  isProduction,
  domain,

  msInSecond,
  msInMinute,
  msInHour,
  msInDay,

  serverErrors,
  webApiTokenRegex
}