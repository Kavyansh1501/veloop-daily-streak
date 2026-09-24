# VELoop Rewards — Daily Streak System

Full-stack MERN implementation of the VELoop Rewards Daily Streak & Rewards feature.

> **Status:** Phase 1 complete — project scaffold, MongoDB connection, and JWT authentication (register/login/me). Streak logic, wallet, and the Daily Streak UI are built in later phases.

## Stack
- **Frontend:** React (Vite), React Router, Bootstrap, CSS Modules, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Deployment (planned):** Frontend → Vercel/Netlify · Backend → Render/Railway · DB → MongoDB Atlas

## Project structure
```
veloop-daily-streak/
├── backend/    Express API
└── frontend/   React app (added in Phase 3)
```

## Getting started

### Backend
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev             # http://localhost:5000
```

## What's working right now
- `POST /api/auth/register` — create account, returns JWT
- `POST /api/auth/login` — returns JWT
- `GET /api/auth/me` — returns current user (protected)

## Roadmap
- [x] Phase 1 — Project setup, MongoDB, JWT auth
- [ ] Phase 2 — Streak models, seed data, claim endpoint (atomic + idempotent)
- [ ] Phase 3 — Daily Streak desktop UI wired to backend
- [ ] Phase 4 — Claim flow, CPA demo, server-time countdown
- [ ] Phase 5 — Responsive (mobile/tablet), loaders, skeletons
- [ ] Phase 6 — Testing docs, Postman collection, API docs
- [ ] Phase 7 — Deployment
