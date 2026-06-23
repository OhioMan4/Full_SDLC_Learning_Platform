from __future__ import annotations

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Course, Enrollment
from .audit_service import record_event
from .notification_service import create_notification
from .progress_service import ensure_course_progress


def create_enrollment(db: Session, *, student_id: str, course_id: str) -> Enrollment:
    existing = db.execute(
        select(Enrollment).where(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
    ).scalar_one_or_none()
    if existing:
        raise ValueError("Student is already enrolled in this course.")

    course = db.get(Course, course_id)
    if not course:
        raise LookupError("Course not found.")

    enrollment = Enrollment(id=str(uuid4()), student_id=student_id, course_id=course_id, status="ACTIVE")
    db.add(enrollment)
    db.flush()

    ensure_course_progress(db, student_id=student_id, course_id=course_id)
    create_notification(
        db,
        student_id=student_id,
        type_="student.enrolled",
        message=f"You enrolled in {course.title}. Start learning now.",
    )
    record_event(
        db,
        event_type="student.enrolled",
        entity_type="enrollment",
        entity_id=enrollment.id,
        student_id=student_id,
        payload={"student_id": student_id, "course_id": course_id, "course_title": course.title},
    )
    return enrollment


def cancel_enrollment(db: Session, *, enrollment: Enrollment) -> Enrollment:
    if enrollment.status != "ACTIVE":
        raise ValueError("Only active enrollments can be cancelled.")
    enrollment.status = "CANCELLED"
    db.flush()
    return enrollment

