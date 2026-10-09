# 🛠️ ServiceFinder - Local Service Marketplace Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%20%7C%20Node.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)

A modern full-stack marketplace platform connecting local homeowners and customers with verified service professionals (electricians, plumbers, carpenters, cleaners, mechanics, etc.). Built with **React 18 + Vite**, **Express.js (ESM)**, **MongoDB**, **WebSockets**, and integrated with **Google Gemini AI** for smart recommendations and scheduling.

---

## 📑 Table of Contents

- [Features](#-features)
  - [Customer Experience](#customer-experience)
  - [Professional Portal](#professional-portal)
  - [Admin Dashboard](#admin-dashboard)
  - [AI & Real-Time Services](#ai--real-time-services)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Seeding & Test Accounts](#-database-seeding--test-accounts)
- [API Reference](#-api-reference)
- [Pushing to a Fresh GitHub Repository](#-pushing-to-a-fresh-github-repository)
- [License](#-license)

---

## ✨ Features

### Customer Experience
- **Service Discovery**: Browse, search, and filter local service professionals by category, price, rating, and location.
- **AI Matching**: Smart matching powered by Google Gemini to analyze service requirements and suggest the best-suited professionals.
- **Easy Booking**: Seamless appointment scheduling with preferred dates, service descriptions, and location selection.
- **Direct Messaging**: In-app real-time messaging with assigned service providers.
- **Ratings & Reviews**: Post reviews and star ratings on completed service appointments.

### Professional Portal
- **Service & Profile Management**: Create listings, specify hourly rates, manage skills, and customize public profiles.
- **Verification Workflow**: Secure document upload system for identity and professional license verification.
- **Booking Management**: Accept, track, and update appointment statuses in real time.
- **Analytics & Earnings**: Track monthly revenue, completed appointments, and client ratings.
- **Subscription Plans**: Tiered plans unlocking advanced features and priority directory placement.

### Admin Dashboard
- **Platform Analytics**: High-level metrics for revenue, active users, completed bookings, and platform growth.
- **Professional Verification**: Review submitted identity documents and approve/reject provider accounts.
- **User Moderation**: Manage customer and professional records with role enforcement.

### AI & Real-Time Services
- **Google Gemini 1.5 Flash**: Context-aware AI recommendations, cost estimation based on complexity, and dynamic booking summaries.
- **WebSocket Gateway**: Real-time two-way messaging and live status notifications.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router DOM 6, Lucide Icons, Radix UI primitives |
| **Styling** | Tailwind CSS v4, PostCSS |
| **Backend** | Node.js, Express 4 (ES Modules), WebSocket (`ws`) |
| **Database** | MongoDB Native Driver (`mongodb` 6.x) |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` password hashing |
| **AI Integration** | Google Gemini (`ai` SDK / Gemini 1.5 Flash) |
| **Development** | `concurrently` (monorepo runner), `dotenv` |

---

## 📁 Project Architecture

```
Local-Service-Finder/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI & feature components (Radix + Tailwind)
│   │   ├── hooks/              # Custom React hooks (useAuth, useLocation, etc.)
│   │   ├── lib/                # Client utility helpers (clsx, tw-merge)
│   │   ├── pages/              # Route pages (Admin, Customer, Professional, Auth)
│   │   ├── App.jsx             # Root router configuration
│   │   └── main.jsx            # Application mount point
│   ├── index.html              # HTML shell
│   ├── package.json            # Client dependencies and build scripts
│   └── vite.config.js          # Vite config with /api & /ws reverse proxy
│
├── server/                     # Backend API & WebSocket Server (Node + Express)
│   ├── api/                    # Modular REST API endpoints
│   │   ├── admin/              # Admin verification, stats & user endpoints
│   │   ├── auth/               # User registration, login & profile endpoints
│   │   ├── bookings/           # Booking creation & status updates
│   │   ├── chat/               # Conversation & message handling
│   │   ├── database/           # Database seeding endpoint
│   │   ├── professionals/      # Provider search, listing & profile endpoints
│   │   └── services/           # Service catalog endpoints
│   ├── config/                 # MongoDB client & WebSocket server setup
│   ├── data/                   # Initial fixtures (seed-professionals.json)
│   ├── lib/                    # Core libraries (ai-service, sms-service, auth-utils)
│   ├── scripts/                # Database seed automation scripts
│   ├── index.js                # Express app entry & route loader
│   └── package.json            # Server dependencies
│
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules for node_modules, build & secrets
├── package.json                # Root package for running both services concurrently
└── README.md                   # Project documentation
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have:

1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **MongoDB**: Local MongoDB instance running (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URL.
3. **Google Gemini API Key** *(Optional)*: Required for AI matching features. Get a free key at [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Getting Started

### 1. Clone or Open the Repository
```bash
git clone <your-repository-url>
cd Local-Service-Finder
```

### 2. Install Dependencies
Run the installation command from the project root to install dependencies for root, client, and server:
```bash
npm run install:all
```
*(Alternatively, you can run `npm install` in the root, `client`, and `server` folders individually).*

### 3. Set Up Environment Variables
Copy the template `.env.example` to create your `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and fill in your configurations:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/servicefinder
JWT_SECRET=your_jwt_secret_key_change_in_production
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Seed the Database
Populate your MongoDB database with pre-configured services, professionals, and test accounts:
```bash
npm run seed --prefix server
```
*(You can also trigger database seeding via API by sending a POST request to `http://localhost:5000/api/database/seed`).*

### 5. Launch the Application
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Environment Variables

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `PORT` | Port for the Express backend server | `5000` | No |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` | No |
| `MONGODB_URI` | MongoDB connection string (Local or Atlas) | `mongodb://localhost:27017/servicefinder` | Yes |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your-secret-key` | Recommended |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | *(Your API Key)* | For AI features |
| `FAST2SMS_API_KEY` | Fast2SMS API key for mobile OTP verification | *(Optional)* | No |

---

## 👥 Database Seeding & Test Accounts

After running `npm run seed --prefix server`, the following test accounts are ready for testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@servicefinder.com` | `admin123` | Full admin dashboard, document verification, system analytics |
| **Customer** | `john@example.com` | `password123` | Book services, AI matching, real-time chat, submit reviews |
| **Plumber** | `rajesh@example.com` | `password123` | Professional portal, manage appointments, chat |
| **Electrician** | `suresh@example.com` | `password123` | Professional portal, manage appointments, chat |
| **AC Technician** | `amit@example.com` | `password123` | Professional portal, manage appointments, chat |

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` - Create a new user account (Customer or Professional)
- `POST /api/auth/login` - Authenticate user and receive JWT token
- `GET /api/user/profile` - Fetch current user profile
- `PUT /api/user/profile` - Update profile information

### Services & Professionals
- `GET /api/services` - List available service categories
- `GET /api/professionals` - Search and filter professionals
- `GET /api/professionals/:id` - Get professional details and reviews

### Bookings
- `GET /api/bookings` - List user or professional bookings
- `POST /api/bookings` - Create a new appointment booking
- `PUT /api/bookings/:id/status` - Update booking status (`pending`, `confirmed`, `completed`, `cancelled`)

### Real-time Chat
- `GET /api/chat/conversations` - Retrieve active user conversations
- `GET /api/chat/messages?conversationId=:id` - Retrieve message history
- `POST /api/chat/messages` - Send a new message
- `ws://localhost:5000` - WebSocket endpoint for real-time messaging

### Admin & Verification
- `GET /api/admin/stats` - Platform metrics and dashboard overview
- `GET /api/admin/verification` - List professional verification submissions
- `POST /api/admin/verification` - Approve or reject provider verification

---

## 🐙 Pushing to a Fresh GitHub Repository

To push this project cleanly to your own GitHub account:

```bash
# 1. Initialize git in the project root
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Create your initial commit
git commit -m "feat: initial commit for ServiceFinder platform"

# 4. Rename default branch to main
git branch -M main

# 5. Connect your remote GitHub repository
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 6. Push code to your GitHub
git push -u origin main
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
