const chatService = require("../modules/chatbot/chat.service")
const riskService = require("../modules/risk/risk.service")

const registerChatSocket = (io) => {

    io.on("connection", (socket) => {

        console.log("User connected:", socket.id)

        // ---------------------------
        // Student joins personal room
        // ---------------------------
        socket.on("join", (userId) => {
            socket.join(userId)
        })

        // ---------------------------
        // Counselor joins dashboard room
        // ---------------------------
        socket.on("join_counselor", () => {
            socket.join("counselors")
            console.log("Counselor connected to dashboard")
        })


        // ---------------------------
        // Handle chat message
        // ---------------------------
        socket.on("send_message", async (data) => {

            try {

                const { userId, message, sessionId } = data

                console.log("💬 Message received:", message, "| session:", sessionId?.slice(0,8))

                // 1️⃣ Generate AI reply (session-scoped)
                const reply = await chatService.sendMessage(userId, message, sessionId)

                // 2️⃣ Send reply to user
                io.to(userId).emit("receive_message", {
                    message,
                    reply,
                    sessionId
                })


                // ---------------------------
                // 🔥 3️⃣ Calculate risk
                // ---------------------------
                const risk = await riskService.calculateRiskScore(userId)

                console.log("📊 Risk Level:", risk.riskLevel)


                // ---------------------------
                // 🔥 4️⃣ Real-time alert to counselors
                // ---------------------------
                if (risk.riskLevel === "HIGH" || risk.riskLevel === "CRITICAL") {

                    console.log("🚨 REAL-TIME ALERT SENT TO COUNSELORS")

                    io.to("counselors").emit("emergency_alert", {
                        type: risk.riskLevel,
                        userId,
                        message,
                        riskLevel: risk.riskLevel,
                        totalRisk: risk.totalRisk,
                        timestamp: new Date()
                    })
                }

            } catch (error) {

                console.error("Socket error:", error.message)

                socket.emit("error", {
                    message: error.message
                })
            }

        })


        // ---------------------------
        // Disconnect
        // ---------------------------
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })

    })
}

module.exports = registerChatSocket