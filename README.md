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
- Local run: Docker Compose

## Architecture
`React + Vite frontend -> FastAPI API -> PostgreSQL`

## Local setup
1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Open the frontend at `http://localhost:3000`.
4. The frontend uses `/api` in the browser and proxies it to the backend during development.

## Docker Compose
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
