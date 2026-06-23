from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course
from ..schemas import CourseCreate, CourseOut, LessonCreate, LessonOut
from ..services.course_service import create_course, create_lesson, get_course_lessons

router = APIRouter(prefix="/courses", tags=["courses"])


def serialize_lesson(lesson) -> LessonOut:
    return LessonOut(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        order_index=lesson.order_index,
        duration_minutes=lesson.duration_minutes,
        created_at=lesson.created_at,
        updated_at=lesson.updated_at,
    )


def serialize_course(course: Course, lessons: list[LessonOut] | None = None) -> CourseOut:
    return CourseOut(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        instructor=course.instructor,
        duration_minutes=course.duration_minutes,
        created_at=course.created_at,
        updated_at=course.updated_at,
        lessons=lessons or [],
    )


@router.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)) -> list[CourseOut]:
    courses = db.query(Course).order_by(Course.title).all()
    result: list[CourseOut] = []
    for course in courses:
        result.append(serialize_course(course, [serialize_lesson(lesson) for lesson in get_course_lessons(db, course.id)]))
    return result


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: str, db: Session = Depends(get_db)) -> CourseOut:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return serialize_course(course, [serialize_lesson(lesson) for lesson in get_course_lessons(db, course_id)])


@router.get("/{course_id}/lessons", response_model=list[LessonOut])
def list_course_lessons(course_id: str, db: Session = Depends(get_db)) -> list[LessonOut]:
    return [serialize_lesson(lesson) for lesson in get_course_lessons(db, course_id)]


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course_route(payload: CourseCreate, db: Session = Depends(get_db)) -> CourseOut:
    course = create_course(db, payload.model_dump())
    db.commit()
    db.refresh(course)
    return serialize_course(course, [])


@router.post("/{course_id}/lessons", response_model=LessonOut, status_code=status.HTTP_201_CREATED)
def create_lesson_route(course_id: str, payload: LessonCreate, db: Session = Depends(get_db)) -> LessonOut:
    if not db.get(Course, course_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    lesson = create_lesson(db, course_id=course_id, payload=payload.model_dump())
    db.commit()
    db.refresh(lesson)
    return serialize_lesson(lesson)

