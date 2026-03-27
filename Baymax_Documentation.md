# Baymax - Mental Health Companion Project Documentation

## 1. Project Overview
Baymax is a comprehensive mental health companion platform designed to support students. It features three interconnected portals for Students, Counselors, and Administrators. The platform provides a full ecosystem for mental health screening, personalized AI chat support, appointment booking, resource distribution, and crisis management.

## 2. Tech Stack Summary

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (REST API, Routing, Middleware)
- **Database:** PostgreSQL (with `pg` module for direct query execution)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt (Password hashing)
- **Real-Time Communication:** Socket.io (for AI Chatbot streaming)
- **Email Service:** Nodemailer (for automated emails)
- **SMS Alerts:** Twilio (for crisis guardian notifications)
- **AI Integration:** OpenAI / Mistral AI (for Chatbot companion logic)

### Frontend
- **Framework:** React.js (Component-based architecture)
- **Routing:** React Router DOM
- **State Management:** Redux Toolkit & React Context API
- **Styling:** Tailwind CSS (Utility-first CSS)
- **Animations:** Framer Motion (Smooth page transitions and micro-interactions)
- **Data Fetching:** Axios
- **Visualization:** Recharts (Admin analytics pie charts and bar graphs)
- **PDF Generation:** jsPDF (Client-side Session Notes PDF generation)

---

## 3. Folder and File Structure Explanation

```text
baymax/
│
├── backend/
│   ├── package.json               # Backend dependencies and scripts
│   ├── server.js                  # Entry point, initializes Express app and sockets
│   └── src/
│       ├── config/
│       │   └── db.js              # PostgreSQL pool connection configuration
│       ├── middleware/
│       │   ├── jwt.middleware.js  # Verifies auth tokens for protected routes
│       │   └── role.middleware.js # Authorizes access based on user role
│       ├── modules/               # Feature-based modular architecture
│       │   ├── admin/             # Counselor management and analytics endpoints
│       │   ├── appointments/      # Booking logic (Student to Counselor)
│       │   ├── assessment/        # PHQ-9 & GAD-7 clinical screenings logic
│       │   ├── auth/              # Sign-up and login logic
│       │   ├── chatbot/           # Integration with AI API for conversational support
│       │   ├── counselor/         # Counselor-side dashboard and student history
│       │   ├── notifications/     # Email and Twilio SMS notification dispatchers
│       │   └── sessionNotes/      # Handles saving and retrieving clinical prescriptions
│       ├── socket/
│       │   └── chat.socket.js     # WebSocket event handlers for real-time chat streaming
│       └── utils/
│           └── generateToken.js   # Helper function for generating JWTs
│
└── frontend/
    ├── package.json               # Frontend dependencies and scripts
    ├── public/                    # Static assets (Favicons, HTML template, Images)
    ├── tailwind.config.js         # Custom Tailwind theme overrides and configurations
    └── src/
        ├── App.js                 # Primary Router setup and Layout wrapper
        ├── index.js               # React DOM entry point
        ├── index.css              # Global styles and Tailwind imports
        ├── components/
        │   ├── Navbar.jsx         # Global Top Navbar component
        │   └── ...                # Reusable UI fragments (Cards, Notification dropdowns)
        ├── context/
        │   └── LanguageContext.js # Multi-lingual support state (English, Hindi, Marathi)
        ├── layouts/
        │   ├── AdminLayout.jsx    # Sidebar and wrapper for Admin Portal
        │   ├── CounselorLayout.jsx# Sidebar and wrapper for Counselor Portal
        │   ├── DashboardLayout.jsx# Reusable responsive base layout for portals
        │   └── StudentLayout.jsx  # Sidebar and wrapper for Student Portal
        ├── pages/
        │   ├── AdminAnalytics.jsx # Recharts-rendered dashboard for Overall Analytics
        │   ├── Appointments.jsx   # Student appointment booking interface
        │   ├── Chat.jsx           # AI Chat interface with animated typing and sessions
        │   ├── Dashboard.jsx      # Primary Student Portal landing page
        │   ├── Login.jsx          # User authentication screen
        │   ├── Register.jsx       # Student creation screen
        │   ├── Screening.jsx      # Clinical PHQ-9/GAD-7 questionnaires
        │   └── SessionNotes.jsx   # Prescription creation and list view for counselors
        └── services/
            └── api.js             # Centralized Axios definitions for interacting with the backend
```

## 4. Key Architectural Features

- **Role-Based Access Control (RBAC):** Distinct roles (student, counselor, admin) dictate UI presentation and backend permission levels.
- **Multilingual Support:** The React Context handles localization (e.g., Hindi, English, Marathi) for inclusive student accessibility.
- **Crisis Intervention Pipeline:** Upon a severe GAD-7/PHQ-9 screening score, the backend proactively calculates risk, alerts the counselor visually on the dashboard, and automatically triggers an SMS to the guardian via Twilio.
- **Real-Time Extensibility:** Socket.io securely manages isolated sessions allowing asynchronous, streaming text responses seamlessly mimicking a counselor's natural response rhythm.
