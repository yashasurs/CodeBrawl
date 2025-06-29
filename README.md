# ⚔️ CodeBrawl

**CodeBrawl** is a real-time multiplayer coding duel platform built with **Next.js** and **Express.js**, designed to gamify coding practice and help students prepare for placement-level technical rounds. Compete head-to-head in timed coding battles, climb the leaderboard, and sharpen your problem-solving skills in a fun, competitive environment.

---

## 🚀 Features

- **Real-Time Code Duels** – Live 1v1 matches with synchronized problems and countdown timers.
- **Online Code Editor** – Monaco Editor with syntax highlighting, language selection, and I/O terminal.
- **Problem Bank & Practice Mode** – Curated problems with test cases, difficulty levels, and topic tags.
- **Auto-Evaluation via Judge0** – Submit code and get verdicts like Accepted, WA, TLE, etc.
- **Leaderboard & Player Profiles** – Track your ELO rating, match history, and badges.
- **JWT-Based Authentication** – Secure login and signup with protected routes.

---

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Realtime:** Socket.io
- **Code Execution:** Judge0 API
- **Authentication:** JWT / NextAuth.js (optional)

---

## 📁 Project Structure

CodeBrawl/
├── frontend/ # Next.js frontend app
│ ├── pages/ # Route-based views
│ ├── components/ # UI components
│ ├── lib/ # API utilities
│ └── public/ # Static assets
├── backend/ # Express.js backend server
│ ├── models/ # Mongoose models (User, Problem, Match)
│ ├── routes/ # REST API routes
│ ├── controllers/ # Business logic handlers
│ └── socket/ # WebSocket (duel logic)
├── README.md
└── .env


---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/codebrawl.git
cd codebrawl

