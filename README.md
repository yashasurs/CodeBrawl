# ⚔️ CodeBrawl

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-green?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-teal?logo=fastapi)](https://fastapi.tiangolo.com/)

**Real-time multiplayer coding platform for competitive programming**

[Features](#-features) • [Quick Start](#-quick-start) • [API Docs](./API_DOCUMENTATION.md) • [Contributing](#-contributing)

</div>

---

## 🎯 What is CodeBrawl?

Battle developers worldwide in **real-time 1v1 coding duels**. Practice with **3000+ LeetCode problems**, compete on global leaderboards, and level up your interview skills.

- 🎮 Live coding battles with WebSocket sync
- 💻 Monaco editor with 60+ languages (Judge0)
- 🏆 ELO rankings & competitive matchmaking
- 🤖 AI-powered problem generation
- 📊 Detailed stats & performance tracking

---

## 🏗️ Tech Stack

```
Next.js 15 (Frontend) ──► Express.js (Backend) ──► FastAPI (AI Service)
                              │                         │
                              ├─ MongoDB              ├─ Judge0 (Code Execution)
                              └─ Socket.io            └─ Google AI (Generation)
```

---

## 🚀 Quick Start

### Prerequisites
Node.js 20+ • Python 3.11+ • MongoDB • Judge0 API Key • Google AI Key

### Install

```bash
git clone https://github.com/yashasurs/CodeBrawl.git
cd CodeBrawl

# Install all dependencies
cd server && npm install
cd ../service && pip install -r requirements.txt
cd ../client && npm install
```

### Configure

Create `.env` files:

```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/codebrawl
PORT=8000
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-key
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# service/.env
GOOGLE_API_KEY=your-google-ai-key
JUDGE0_API_KEY=your-rapidapi-key
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com

# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8000
```

### Run

```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - AI Service
cd service && uvicorn app.main:app --reload --port 8000

# Terminal 3 - Frontend
cd client && npm run dev
```

**Access:** http://localhost:3000

---

## 📁 Structure

```
CodeBrawl/
├── client/          # Next.js frontend (React 19 + TypeScript + Tailwind)
├── server/          # Express backend (Node.js + MongoDB + Socket.io)
├── service/         # FastAPI microservice (Judge0 + AI generation)
└── API_DOCUMENTATION.md
```

---

## 📡 API Endpoints

Full docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Auth:** `/auth/register` • `/auth/login` • `/auth/current-user`  
**Problems:** `/problems` • `/problems/random` • `/problems/generate`  
**Duels:** `/duels` • `/duels/:id/join` • `/duels/:id/cancel`  
**Submissions:** `/submissions/practice` • `/submissions/duel`  
**Users:** `/users/leaderboard` • `/users/stats/:username`

---

## 🚀 Deployment

**Recommended:**
- Frontend: [Vercel](https://vercel.com)
- Backend: [Railway](https://railway.app) or [Render](https://render.com)
- Database: [MongoDB Atlas](https://www.mongodb.com/atlas)
- Microservice: [Render](https://render.com)

---

## 🤝 Contributing

```bash
git checkout -b feature/YourFeature
git commit -m 'Add YourFeature'
git push origin feature/YourFeature
```

Open a PR! Contributions welcome for: bugs, features, docs, UI/UX, tests.

---

## 📄 License

ISC License • [Yashas Urs](https://github.com/yashasurs) • 2024

---

<div align="center">

⭐ **Star this repo** if you found it helpful!

[Docs](./API_DOCUMENTATION.md) • [Issues](https://github.com/yashasurs/CodeBrawl/issues) • [Discussions](https://github.com/yashasurs/CodeBrawl/discussions)

</div>
