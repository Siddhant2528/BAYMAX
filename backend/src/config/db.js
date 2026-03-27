const { Pool } = require("pg")

// Create PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
})


// Connect DB (used in server.js)
const connectDB = async () => {
    try {
        const client = await pool.connect()
        console.log("PostgreSQL Connected Successfully")
        client.release()
    } catch (error) {
        console.error("PostgreSQL Connection Error:", error.message)
        process.exit(1)
    }
}


// Optional query helper
const query = (text, params) => {
    return pool.query(text, params)
}


// Handle unexpected errors
pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err)
    process.exit(-1)
})


// EXPORT EVERYTHING
module.exports = {
    pool,
    connectDB,
    query
}