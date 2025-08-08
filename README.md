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

```
CodeBrawl/
├── client/                     # Next.js frontend app
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── globals.css    # Global styles
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home page
│   │   └── components/        # UI components
│   │       ├── BackgroundAnimation.tsx
│   │       ├── LoginForm.tsx
│   │       ├── Navbar.tsx
│   │       └── SignupForm.tsx
│   ├── public/                # Static assets
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── logo.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── server/                    # Express.js backend server
│   ├── src/
│   │   ├── controllers/       # Business logic handlers
│   │   ├── db/               # Database connection
│   │   │   └── dbConnect.js
│   │   ├── middlewares/      # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.model.js
│   │   │   ├── Problem.model.js
│   │   │   ├── Match.model.js
│   │   │   └── index.js
│   │   ├── routes/           # REST API routes
│   │   ├── utils/            # Utility functions
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── leetcodeUtils.js
│   │   │   └── testLeetCode.js
│   │   ├── app.js            # Express app configuration
│   │   ├── constants.js      # Application constants
│   │   └── index.js          # Server entry point
│   ├── public/
│   │   └── temp/             # Temporary files
│   ├── .env                  # Environment variables
│   └── package.json
└─── README.md

```


---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yashasurs/codebrawl.git
cd codebrawl

