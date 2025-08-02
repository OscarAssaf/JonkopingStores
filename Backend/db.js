const { Client } = require('pg');


const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres', 
    password: '12345', // password in the docker file
    database: 'postgres' // database connection
});

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
    } catch (err) {
        console.error('Connection error:', err.stack);
    }
}

connectDB();

module.exports = client;
