# Leave Management App (Vue + Node + MongoDB)

Basic web app where:
- **Employees** can register/login, apply for leave, and track status (**PENDING / APPROVED / REJECTED**).
- **Employers** can register/login, view all employee leave requests, and approve/reject.

## Tech stack
- **Frontend**: Vue 3 (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **DB**: MongoDB Atlas (Mongoose)
- **Auth**: JWT (role-based access: `EMPLOYEE`, `EMPLOYER`)

---

## Repo structure
- `backend/`: Express REST API
- `frontend/`: Vue app

---

## Local setup

### 1) MongoDB Atlas
Create a MongoDB Atlas cluster and get the connection string.

### 2) Backend

From `backend/`:

1. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

2. Set:
- `MONGODB_URI`: your Atlas connection string
- `JWT_SECRET`: long random string
- `CLIENT_URL`: frontend URL (e.g. `http://localhost:5173`)

3. Install & run:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3) Frontend

From `frontend/`:

1. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

2. Set:
- `VITE_API_URL=http://localhost:5000`

3. Install & run:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## API endpoints

### Auth
- `POST /api/auth/register`
  - body: `{ name, email, password, role }`
  - role: `EMPLOYEE` or `EMPLOYER`
  - returns: `{ token, user }`

- `POST /api/auth/login`
  - body: `{ email, password }`
  - returns: `{ token, user }`

### Leaves (Employee)
- `POST /api/leaves` (JWT required; role `EMPLOYEE`)
  - body: `{ leaveType, startDate, endDate, reason }`
- `GET /api/leaves/my` (JWT required; role `EMPLOYEE`)

### Leaves (Employer)
- `GET /api/leaves` (JWT required; role `EMPLOYER`)
- `PATCH /api/leaves/:id/approve` (JWT required; role `EMPLOYER`)
- `PATCH /api/leaves/:id/reject` (JWT required; role `EMPLOYER`)

---

## Deployment (free platforms)

You can deploy **backend** and **frontend** separately.

### Option A (recommended): Render (backend) + Netlify (frontend)

#### Backend on Render
- Create a new **Web Service**
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Env vars:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (optional, default `7d`)
  - `CLIENT_URL` = your Netlify app URL

#### Frontend on Netlify
- New site from Git
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Env vars:
  - `VITE_API_URL` = your Render backend base URL (example: `https://your-backend.onrender.com`)

### Option B: Render for both
- Backend: same as above
- Frontend: deploy as a **Static Site**
  - Base directory: `frontend`
  - Build: `npm run build`
  - Publish: `dist`
  - Env: `VITE_API_URL`

---

## Notes
- Keep secrets out of git (don’t commit `.env`).
- Create one **Employer** user to approve/reject, and one **Employee** user to request leave.

