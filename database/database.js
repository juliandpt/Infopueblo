const mariadb = require('mariadb')
require('dotenv').config()

const pool = mariadb.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 3
});

// const pool = mariadb.createPool({
//     host: 'localhost', 
//     user: 'root', 
//     password: '',
//     database: 'prgrupob',
//     connectionLimit: 100
// });

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('Database connection lost')
        } else if (err.code === 'ER_CON_COUNT_ERROR'){
            console.log('Database has too many connection')
        } else {
            console.log('Database connection was refused')
        }
    } else {
        console.log('Database connection was refused')
    }

    return;
})

module.exports = pool;