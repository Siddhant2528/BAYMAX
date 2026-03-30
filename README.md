# 🧠 BAYMAX – AI Mental Health Companion

BAYMAX is a full-stack AI-powered mental health companion platform designed to support students through intelligent chat, clinical screening, appointment management, and real-time crisis intervention.

---

## 🚀 Features

* 🤖 **AI Chatbot Companion** – Provides emotional support using AI models
* 📊 **Mental Health Screening** – PHQ-9 & GAD-7 based assessments
* 📅 **Appointment Booking** – Students can book sessions with counselors
* 📡 **Real-time Chat** – Powered by Socket.io for live interaction
* 📩 **Email Notifications** – Automated updates via Nodemailer
* 📱 **SMS Alerts** – Crisis alerts using Twilio
* 🔐 **Authentication System** – JWT-based secure login/signup
* 🌍 **Multilingual Support** – English, Hindi, Marathi

---

## 🧩 Tech Stack

### 🔹 Backend

* Node.js + Express.js
* PostgreSQL (pg)
* MongoDB (for AI/chat data)
* JWT + bcrypt (authentication)
* Socket.io (real-time communication)
* Nodemailer (email service)
* Twilio (SMS alerts)
* AI APIs (Gemini / Mistral / OpenAI)

### 🔹 Frontend

* React.js
* Redux Toolkit + Context API
* Tailwind CSS
* Framer Motion
* Axios
* Recharts
* jsPDF

---

## 📁 Project Structure

baymax/
│
├── backend/ # Node.js + Express backend
│ ├── src/
│ │ ├── config/ # Database config
│ │ ├── modules/ # Feature modules (auth, chatbot, etc.)
│ │ ├── socket/ # Real-time chat
│ │ └── app.js
│ ├── server.js # Entry point
│ └── package.json
│
├── frontend/ # React frontend
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── layouts/
│ │ ├── services/
│ │ └── App.js
│ └── package.json
│
├── docs/ # Documentation files
│ ├── Baymax_Documentation.md
│ └── Baymax_Documentation.pdf
│
├── .gitignore
└── README.md

## ⚙️ Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000

# PostgreSQL
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=baymax_db
DB_PORT=5432

# MongoDB
MONGO_URI=your_mongo_uri

# JWT
JWT_SECRET=your_secret

# AI APIs
GEMINI_API_KEY=your_key
MISTRAL_API_KEY=your_key

# Email
EMAIL_USER=your_email
EMAIL_PASS=your_password

# Twilio
TWILIO_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=your_number
```

---

## ▶️ Running the Project

### 🔹 Backend

```bash
cd backend
npm install
npm start
```

---

### 🔹 Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🌐 Application URLs

* Frontend → http://localhost:3000 (Not deploy yet)
* Backend → http://localhost:5000 (Not deploy yet)

---

## 🧠 Key Architecture Highlights

* 🔐 Role-Based Access Control (Student / Counselor / Admin)
* ⚡ Real-time chat using WebSockets
* 🚨 Crisis Detection System (auto alerts via SMS)
* 🌍 Multi-language support using React Context
* 📊 Analytics dashboard for admin

---

## 📌 Future Improvements

* AI memory for personalized conversations
* Voice-based interaction
* Mobile app version
* Deployment on cloud (AWS / Render / Vercel)

---

## 🤝 Contributors

* Siddhant2528
* harshcodes321

---

## 📄 Documentation

Detailed project documentation is available here:
👉 

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and support the work!
