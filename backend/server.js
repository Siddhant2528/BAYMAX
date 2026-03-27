const dns = require("dns")
// Change DNS
dns.setServers(["1.1.1.1", "8.8.8.8"])

require("dotenv").config()

const http = require("http")
const { Server } = require("socket.io")

const mongoose = require("mongoose")

// Import Express app (routes already inside app.js)
const app = require("./src/app")

// PostgreSQL (FIXED IMPORT)
const { connectDB } = require("./src/config/db")

// Socket handler
const registerChatSocket = require("./src/socket/chat.socket")

// ---------------------------
// Create HTTP Server
// ---------------------------

const server = http.createServer(app)

// ---------------------------
// Initialize Socket.io
// ---------------------------

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

// Register socket events
registerChatSocket(io)


// ---------------------------
// Database Connections
// ---------------------------

// MongoDB (Chat + AI logs)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected")
})
.catch(err => {
    console.error("MongoDB connection error:", err)
})

// PostgreSQL (FIXED)
connectDB()


// ---------------------------
// Health Check
// ---------------------------

app.get("/", (req, res) => {
    res.json({
        message: "Baymax Mental Health API Running 🚀"
    })
})


// ---------------------------
// Global Error Handler
// ---------------------------

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        message: "Internal Server Error"
    })
})


// ---------------------------
// Start Server (IMPORTANT CHANGE)
// ---------------------------

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 