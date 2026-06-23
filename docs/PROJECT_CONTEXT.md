# Cloud-Native Learning Platform - Project Context

## Goal

Build a user-facing Cloud-Native Event-Driven Learning Platform for a DevOps portfolio project.

The application should demonstrate:

- Full SDLC
- Microservices
- Event-driven architecture
- RabbitMQ message broker
- PostgreSQL database
- Docker Compose local environment
- Kubernetes/K3s deployment
- CI/CD
- GitOps with ArgoCD
- Observability with metrics, logs, traces, dashboards, alerts
- Incident simulation and runbooks

Prefer a working minimal enterprise version over an incomplete complex version.

## Business Domain

This is an online learning platform.

Users should be able to:

- View courses
- View lessons
- Enroll in courses
- Track lesson progress
- Complete courses
- Receive simulated notifications
- Generate certificates after course completion

## Default Tech Stack

Backend:
- Python FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- Prometheus client
- Structured JSON logging

Frontend:
- React + Vite

Messaging:
- RabbitMQ
- Topic exchange
- Manual ACK consumers
- Retry and DLQ design

DevOps:
- Docker
- Docker Compose
- Kubernetes/K3s
- Helm or K8s manifests
- GitHub Actions
- ArgoCD

Observability:
- Prometheus
- Grafana
- OpenTelemetry Collector if possible
- JSON logs with correlation_id

## Services

Required services:

- api-gateway
- course-service
- enrollment-service
- progress-service
- payment-worker
- notification-worker
- certificate-worker
- audit-worker
- frontend

## Event Exchange

RabbitMQ topic exchange:

learning.events.exchange

Important routing keys:

- student.enrolled
- payment.succeeded
- payment.failed
- lesson.completed
- course.completed
- certificate.generated
- certificate.failed
- notification.sent
- notification.failed

## Important Rules

- Keep each phase runnable.
- Do not create placeholder-only code.
- Add verification commands for every phase.
- Update README after every phase.
- Use environment variables for config.
- Do not hardcode secrets.
- Use correlation_id in logs and events.
- Use manual ACK for RabbitMQ consumers.
- Add simple tests when possible.
