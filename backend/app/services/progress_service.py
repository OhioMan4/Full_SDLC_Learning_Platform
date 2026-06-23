from __future__ import annotations

from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Course, CourseProgress, Enrollment, Lesson, LessonProgress
from .audit_service import record_event
from .certificate_service import generate_certificate
from .notification_service import create_notification


def ensure_course_progress(db: Session, *, student_id: str, course_id: str) -> CourseProgress:
    progress = db.execute(
        select(CourseProgress).where(CourseProgress.student_id == student_id, CourseProgress.course_id == course_id)
    ).scalar_one_or_none()
    if progress:
        return progress

    total_lessons = db.scalar(select(func.count(Lesson.id)).where(Lesson.course_id == course_id)) or 0
    progress = CourseProgress(
        id=str(uuid4()),
        student_id=student_id,
        course_id=course_id,
        completed_lessons=0,
        total_lessons=total_lessons,
        progress_percentage=0,
        status="IN_PROGRESS",
    )
    db.add(progress)
    db.flush()
    return progress


def recalculate_progress(db: Session, *, student_id: str, course_id: str) -> CourseProgress:
    progress = ensure_course_progress(db, student_id=student_id, course_id=course_id)
    completed_count = db.scalar(
        select(func.count(LessonProgress.id)).where(
            LessonProgress.student_id == student_id,
            LessonProgress.course_id == course_id,
        )
    ) or 0
    total_lessons = db.scalar(select(func.count(Lesson.id)).where(Lesson.course_id == course_id)) or 0

    progress.completed_lessons = completed_count
    progress.total_lessons = total_lessons
    progress.progress_percentage = int((completed_count / total_lessons) * 100) if total_lessons else 0

    if total_lessons and completed_count >= total_lessons:
        progress.status = "COMPLETED"
        enrollment = db.execute(
            select(Enrollment).where(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        ).scalar_one_or_none()
        if enrollment:
            enrollment.status = "COMPLETED"
        course = db.get(Course, course_id)
        if course:
            create_notification(
                db,
                student_id=student_id,
                type_="course.completed",
                message=f"You completed {course.title}. Your certificate is ready.",
            )
            record_event(
                db,
                event_type="course.completed",
                entity_type="course",
                entity_id=course_id,
                student_id=student_id,
                payload={"student_id": student_id, "course_id": course_id, "course_title": course.title},
            )
            generate_certificate(db, student_id=student_id, course_id=course_id)

    db.flush()
    return progress

