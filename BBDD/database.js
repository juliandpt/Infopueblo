const pool = mariadb.createPool({
    host: '2.139.176.212', 
    user:'pr_grupob', 
    password: 'PC2-2021',
    connectionLimit: 5
});

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection
    } catch (error) {
        console.log(error)
    }
}