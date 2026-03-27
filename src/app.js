const express = require("express")
const app = express()
app.use(express.json())

const authRoutes = require("./modules/auth/auth.routes");

app.use("/api/auth", authRoutes)

const counselorAuthRoutes = require("./modules/counselorAuth/counselorAuth.routes")

app.use("/api/counselor/auth", counselorAuthRoutes)

const userRoutes = require("./modules/users/user.routes")

app.use("/api/users", userRoutes)

const assessmentRoutes = require("./modules/assessment/assessment.routes")

app.use("/api/assessment", assessmentRoutes)

const chatRoutes = require("./modules/chatbot/chat.routes")

app.use("/api/chat",chatRoutes)

const riskRoutes = require("./modules/risk/risk.routes")

app.use("/api/risk",riskRoutes)

const resourceRoutes = require("./modules/resources/resource.routes")

app.use("/api/resources", resourceRoutes)

const recommendationRoutes =
require("./modules/recommendations/recommendation.routes")

app.use("/api/recommendations",recommendationRoutes)

const appointmentRoutes =
require("./modules/appointments/appointment.routes")

app.use("/api/appointments",appointmentRoutes)

const counselorRoutes =
require("./modules/counselor/counselor.routes")

app.use("/api/counselor",counselorRoutes)

const notificationRoutes =
require("./modules/notifications/notification.routes")

app.use("/api/notifications",notificationRoutes)

const adminRoutes =
require("./modules/admin/admin.routes")

app.use("/api/admin",adminRoutes)

const therapyRoutes = 
require("./modules/therapy/therapy.routes")

app.use("api/therapy", therapyRoutes)

module.exports = app