import os
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

test_db = Path("/tmp/learning_platform_test.db")
if test_db.exists():
    test_db.unlink()
os.environ["DATABASE_URL"] = "sqlite+pysqlite:////tmp/learning_platform_test.db"
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.app.main import app  # noqa: E402


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_courses(client: TestClient):
    response = client.get("/courses")
    assert response.status_code == 200
    assert len(response.json()) >= 4


def test_enroll_complete_and_certificate_flow(client: TestClient):
    courses = client.get("/courses").json()
    course_id = courses[0]["id"]
    lessons = client.get(f"/courses/{course_id}/lessons").json()

    enroll = client.post("/enrollments", json={"student_id": "student-1", "course_id": course_id})
    assert enroll.status_code == 201

    student_enrollments = client.get("/students/student-1/enrollments")
    assert student_enrollments.status_code == 200
    assert len(student_enrollments.json()) == 1

    duplicate = client.post("/enrollments", json={"student_id": "student-1", "course_id": course_id})
    assert duplicate.status_code == 400

    for lesson in lessons:
        complete = client.post(
            "/progress/lessons/complete",
            json={"student_id": "student-1", "course_id": course_id, "lesson_id": lesson["id"]},
        )
        assert complete.status_code == 200

    progress = client.get(f"/students/student-1/courses/{course_id}/progress")
    assert progress.status_code == 200
    body = progress.json()
    assert body["completed_lessons"] == len(lessons)
    assert body["status"] == "COMPLETED"

    all_progress = client.get("/students/student-1/progress")
    assert all_progress.status_code == 200
    assert len(all_progress.json()) == 1

    certificates = client.get("/students/student-1/certificates")
    assert certificates.status_code == 200
    assert len(certificates.json()) == 1
