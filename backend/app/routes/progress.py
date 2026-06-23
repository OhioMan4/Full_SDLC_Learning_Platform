from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course, CourseProgress, Enrollment, Lesson, LessonProgress
from ..schemas import ApiMessage, CourseProgressOut, LessonCompleteRequest
from ..services.audit_service import record_event
from ..services.progress_service import recalculate_progress

router = APIRouter(tags=["progress"])


def serialize_progress(progress: CourseProgress, completed_lesson_ids: list[str]) -> CourseProgressOut:
    return CourseProgressOut(
        id=progress.id,
        student_id=progress.student_id,
        course_id=progress.course_id,
        completed_lessons=progress.completed_lessons,
        total_lessons=progress.total_lessons,
        progress_percentage=progress.progress_percentage,
        status=progress.status,  # type: ignore[arg-type]
        updated_at=progress.updated_at,
        completed_lesson_ids=completed_lesson_ids,
    )


@router.post("/progress/lessons/complete", response_model=ApiMessage)
def complete_lesson(payload: LessonCompleteRequest, db: Session = Depends(get_db)) -> ApiMessage:
    enrollment = db.execute(
        select(Enrollment).where(Enrollment.student_id == payload.student_id, Enrollment.course_id == payload.course_id)
    ).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student is not enrolled in this course")

    lesson = db.get(Lesson, payload.lesson_id)
    if not lesson or lesson.course_id != payload.course_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    existing = db.execute(
        select(LessonProgress).where(
            LessonProgress.student_id == payload.student_id,
            LessonProgress.course_id == payload.course_id,
            LessonProgress.lesson_id == payload.lesson_id,
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lesson already completed")

    db.add(
        LessonProgress(
            id=f"lp-{payload.student_id}-{payload.course_id}-{payload.lesson_id}",
            student_id=payload.student_id,
            course_id=payload.course_id,
            lesson_id=payload.lesson_id,
        )
    )
    record_event(
        db,
        event_type="lesson.completed",
        entity_type="lesson",
        entity_id=payload.lesson_id,
        student_id=payload.student_id,
        payload={"student_id": payload.student_id, "course_id": payload.course_id, "lesson_id": payload.lesson_id},
    )
    recalculate_progress(db, student_id=payload.student_id, course_id=payload.course_id)
    db.commit()
    return ApiMessage(message="Lesson marked as completed")


@router.get("/students/{student_id}/courses/{course_id}/progress", response_model=CourseProgressOut)
def get_course_progress(student_id: str, course_id: str, db: Session = Depends(get_db)) -> CourseProgressOut:
    if not db.get(Course, course_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    progress = db.execute(
        select(CourseProgress).where(CourseProgress.student_id == student_id, CourseProgress.course_id == course_id)
    ).scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course progress not found")
    completed_lesson_ids = db.execute(
        select(LessonProgress.lesson_id).where(
            LessonProgress.student_id == student_id, LessonProgress.course_id == course_id
        )
    ).scalars().all()
    return serialize_progress(progress, completed_lesson_ids)


@router.get("/students/{student_id}/progress", response_model=list[CourseProgressOut])
def get_student_progress(student_id: str, db: Session = Depends(get_db)) -> list[CourseProgressOut]:
    progress_rows = db.execute(select(CourseProgress).where(CourseProgress.student_id == student_id)).scalars().all()
    result: list[CourseProgressOut] = []
    for progress in progress_rows:
        completed_lesson_ids = db.execute(
            select(LessonProgress.lesson_id).where(
                LessonProgress.student_id == student_id, LessonProgress.course_id == progress.course_id
            )
        ).scalars().all()
        result.append(serialize_progress(progress, completed_lesson_ids))
    return result
