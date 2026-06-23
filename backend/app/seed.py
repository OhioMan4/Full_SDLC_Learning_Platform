from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import User
from .services.course_service import create_course, create_lesson


def seed_data(db: Session) -> None:
    if db.execute(select(User.id)).first():
        return

    db.add_all(
        [
            User(id="student-1", name="Demo Student", email="student-1@example.com", role="student"),
            User(id="admin-1", name="Demo Admin", email="admin-1@example.com", role="admin"),
        ]
    )
    db.flush()

    courses = [
        {
            "id": "course-devops-fundamentals",
            "title": "DevOps Fundamentals",
            "description": "Learn the core DevOps practices behind modern delivery pipelines.",
            "category": "DevOps",
            "level": "Beginner",
            "instructor": "Demo Instructor",
            "duration_minutes": 180,
            "lessons": [
                {"id": "lesson-devops-1", "title": "What is DevOps?", "content": "An introduction to culture and practices.", "order_index": 1, "duration_minutes": 30},
                {"id": "lesson-devops-2", "title": "CI/CD Basics", "content": "Learn continuous integration and delivery.", "order_index": 2, "duration_minutes": 45},
                {"id": "lesson-devops-3", "title": "Infrastructure as Code", "content": "Manage infrastructure with code.", "order_index": 3, "duration_minutes": 45},
            ],
        },
        {
            "id": "course-kubernetes-beginners",
            "title": "Kubernetes for Beginners",
            "description": "A practical introduction to Kubernetes concepts and objects.",
            "category": "Platform Engineering",
            "level": "Beginner",
            "instructor": "Cloud Team",
            "duration_minutes": 240,
            "lessons": [
                {"id": "lesson-k8s-1", "title": "Kubernetes Overview", "content": "Cluster, nodes, and control plane.", "order_index": 1, "duration_minutes": 40},
                {"id": "lesson-k8s-2", "title": "Pods and Deployments", "content": "Deploy and scale workloads.", "order_index": 2, "duration_minutes": 50},
                {"id": "lesson-k8s-3", "title": "Services and Ingress", "content": "Expose applications safely.", "order_index": 3, "duration_minutes": 45},
                {"id": "lesson-k8s-4", "title": "Config and Secrets", "content": "Manage configuration and sensitive data.", "order_index": 4, "duration_minutes": 35},
            ],
        },
        {
            "id": "course-observability-prometheus-grafana",
            "title": "Observability with Prometheus and Grafana",
            "description": "Collect metrics, visualize systems, and understand service health.",
            "category": "Observability",
            "level": "Intermediate",
            "instructor": "SRE Team",
            "duration_minutes": 210,
            "lessons": [
                {"id": "lesson-obsv-1", "title": "Metrics Fundamentals", "content": "Key concepts behind monitoring.", "order_index": 1, "duration_minutes": 35},
                {"id": "lesson-obsv-2", "title": "Prometheus Scraping", "content": "Collect application and system metrics.", "order_index": 2, "duration_minutes": 55},
                {"id": "lesson-obsv-3", "title": "Grafana Dashboards", "content": "Build useful dashboards.", "order_index": 3, "duration_minutes": 50},
            ],
        },
        {
            "id": "course-event-driven-architecture-basics",
            "title": "Event-Driven Architecture Basics",
            "description": "Build systems that communicate through asynchronous events.",
            "category": "Architecture",
            "level": "Intermediate",
            "instructor": "Platform Architect",
            "duration_minutes": 195,
            "lessons": [
                {"id": "lesson-eda-1", "title": "Why Events Matter", "content": "Decouple services with events.", "order_index": 1, "duration_minutes": 30},
                {"id": "lesson-eda-2", "title": "Topic Exchanges", "content": "Route events with RabbitMQ patterns.", "order_index": 2, "duration_minutes": 45},
                {"id": "lesson-eda-3", "title": "Retries and DLQs", "content": "Handle failure safely.", "order_index": 3, "duration_minutes": 45},
                {"id": "lesson-eda-4", "title": "Designing Consumers", "content": "Build reliable workers.", "order_index": 4, "duration_minutes": 35},
            ],
        },
    ]

    for course_payload in courses:
        lessons = course_payload.pop("lessons")
        course = create_course(db, course_payload)
        for lesson_payload in lessons:
            create_lesson(db, course_id=course.id, payload=lesson_payload)

    db.commit()

