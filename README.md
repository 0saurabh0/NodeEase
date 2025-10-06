# NodeEase

**NodeEase** is an open-source platform that makes it effortless to deploy and manage your own **Solana RPC nodes** on AWS and Bare Metal(soon) — with full control, transparency, and zero vendor lock-in.

>  Build your own RPC — provision, monitor, and destroy Solana infrastructure from a web UI.


## Why NodeEase?

Running your own Solana RPC node is powerful but intimidating:
- It’s complicated to set up
- Cloud costs feel unpredictable
- Managed providers are convenient but opaque

**NodeEase changes that.**

Instead of relying on costly managed RPC services (that lock you into their platform), **NodeEase gives you your own fully controllable RPC node**, on infrastructure **you own and trust**.

> Ideal for **developers**, **validators**, and **infra teams** who want transparency, cost-efficiency, and decentralization.


##  Features

- ✅ **One-click deployment** of Solana RPC nodes on your cloud
- 🔍 **Transparent infrastructure**: You own every instance, disk, and key
- 📊 **Dashboard** to monitor node health, region, instance.
- 🔁 **Destroy/re-deploy** with a single click
- 🧪 **Devnet/Mainnet support**


##  Demo

![Demo](frontend/public/demo.gif)

If the image doesn't load, [view the demo GIF](frontend/public/demo.gif).


##  Prerequisites

- **Go**: 1.22+
- **Node.js**: 18+
- **npm**: 9+
- **PostgreSQL**: running locally or via a managed service

##  Quick start (local)

1. Backend
   - Install Go deps: `go mod download`
   - Start API: `go run main.go`
2. Frontend
   - `cd frontend`
   - `npm install`
   - `npm run dev`

##  Environment

- Backend `.env` (examples; adjust to your setup):
  - `DATABASE_URL=postgres://user:password@localhost:5432/nodeease?sslmode=disable`
  - `JWT_SECRET=change-me`
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
  - `PORT=8080`

- Frontend `.env` (create `frontend/.env` as needed):
  - `VITE_API_BASE=http://localhost:8080`

##  Run scripts

- Backend: `go run main.go` (listens on `$PORT` or 8080)
- Frontend: from `frontend/`
  - `npm run dev` (Vite dev server)
  - `npm run build` (production build)
  - `npm run preview` (preview built app)

