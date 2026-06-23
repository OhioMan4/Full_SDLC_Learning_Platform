from __future__ import annotations

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Course, Lesson


def create_course(db: Session, payload: dict) -> Course:
    course_id = payload.pop("id", None) or str(uuid4())
    course = Course(id=course_id, **payload)
    db.add(course)
    db.flush()
    return course


def create_lesson(db: Session, *, course_id: str, payload: dict) -> Lesson:
    lesson_id = payload.pop("id", None) or str(uuid4())
    lesson = Lesson(id=lesson_id, course_id=course_id, **payload)
    db.add(lesson)
    db.flush()
    return lesson


def get_course_lessons(db: Session, course_id: str) -> list[Lesson]:
    return list(db.execute(select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order_index)).scalars().all())

