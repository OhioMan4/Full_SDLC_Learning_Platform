# Cloud-Native Learning Platform

Simple local-first learning platform built with FastAPI, React + Vite, and PostgreSQL.

## Features
- Browse courses and lessons
- Enroll a demo student
- Track lesson completion and course progress
- Generate certificates on completion
- View notifications and audit events
- See a lightweight admin/system status page

## Tech stack
- Backend: FastAPI, SQLAlchemy, Pydantic
- Frontend: React, Vite
- Database: PostgreSQL
- Local run: direct backend/frontend startup

## Architecture
`React + Vite frontend -> FastAPI API -> PostgreSQL`

## Authentication (local demo)
- The app now requires sign-in for all protected endpoints/pages.
- Demo login:
  - Username: `student-1`
  - Password: value from `DEMO_USER_PASSWORD` (default: `demo123`)
- Backend endpoints:
  - `POST /auth/login`
  - `GET /auth/me` (Bearer token required)

## Local setup
1. Copy `.env.example` to `.env`.
2. Set `AUTH_SECRET` and optionally `DEMO_USER_PASSWORD`.
3. Start PostgreSQL locally and make sure `DATABASE_URL` points to it.
4. Run the backend from the `backend` folder.
5. Run the frontend from the `frontend` folder.
6. Open the frontend at `http://localhost:3000`.

## Backend run locally
1. Open a terminal in `backend`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the API:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Frontend run locally
1. Open a terminal in `frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
4. Open `http://localhost:3000`.

## Docker Compose
- Optional alternative:
  - `docker compose up --build`
  - `docker compose down`

## API examples
- `GET /health`
- `GET /courses`
- `POST /enrollments`
- `POST /progress/lessons/complete`
- `GET /students/student-1/certificates`

## Frontend usage
- Home: intro and quick links
- Courses: browse all courses
- Course detail: enroll or open learning view
- My Courses: enrolled courses and progress
- Learning: complete lessons
- Certificates: view generated certificates
- Notifications: view simulated notifications
- Admin: platform counts and recent audit events

## Database schema summary
- users
- courses
- lessons
- enrollments
- lesson_progress
- course_progress
- certificates
- notifications
- audit_events

## Future roadmap
- RabbitMQ workers for event-driven notification and certificate processing
- Prometheus and Grafana monitoring
- OpenTelemetry tracing
- Kubernetes/K3s deployment
- GitHub Actions CI/CD
- ArgoCD GitOps
- Incident simulation and runbooks
