const pool = require('../database')
const service = require('../services')
const moment = require('moment')
require('dotenv').config()

async function validateEmail(email) {
    var sql = await pool.query("SELECT email FROM users WHERE users.email = ?", [email])

    if(sql.length === 0) {
        return true
    } else {
        return false
    }
}

async function authenticateToken(token) {
    try {
        var decodedToken = service.decodeToken(token)
        var userid = decodedToken.userid

        const query = "SELECT token FROM users WHERE users.id_user = ?"
        var result = await pool.query(query, [userid])

        if(result.body.token != 'NULL') {
            return true
        } else {
            return false
        }
    } catch {
        return false
    }
}

module.exports = {
    validateEmail,
    authenticateToken
}