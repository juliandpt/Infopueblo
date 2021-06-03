const moment = require('moment')
const sha = require('sha1')
const jwt = require('jsonwebtoken')
require('dotenv').config()

function createToken(value) {
    var payload = {
        sub: value,
        iat: moment().unix(),
        exp: moment().add(1, 'days').unix()
    }

    return jwt.sign(payload, process.env.SECRET_TOKEN)
}

function decodeToken(token, secret) {
    return jwt.verify(token, secret)
}

function encyptPassword(password) {
    return sha(password)
}

module.exports = {
    createToken,
    decodeToken,
    encyptPassword
}