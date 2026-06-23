from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Enrollment
from ..schemas import EnrollmentCancelResponse, EnrollmentCreate, EnrollmentOut
from ..services.enrollment_service import cancel_enrollment, create_enrollment

router = APIRouter(tags=["enrollments"])


def serialize(enrollment: Enrollment) -> EnrollmentOut:
    return EnrollmentOut(
        id=enrollment.id,
        student_id=enrollment.student_id,
        course_id=enrollment.course_id,
        status=enrollment.status,  # type: ignore[arg-type]
        created_at=enrollment.created_at,
        updated_at=enrollment.updated_at,
    )


@router.post("/enrollments", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll(payload: EnrollmentCreate, db: Session = Depends(get_db)) -> EnrollmentOut:
    try:
        enrollment = create_enrollment(db, student_id=payload.student_id, course_id=payload.course_id)
        db.commit()
        db.refresh(enrollment)
        return serialize(enrollment)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except LookupError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/enrollments", response_model=list[EnrollmentOut])
def list_enrollments(db: Session = Depends(get_db)) -> list[EnrollmentOut]:
    enrollments = db.query(Enrollment).order_by(Enrollment.created_at.desc()).all()
    return [serialize(enrollment) for enrollment in enrollments]


@router.get("/enrollments/{enrollment_id}", response_model=EnrollmentOut)
def get_enrollment(enrollment_id: str, db: Session = Depends(get_db)) -> EnrollmentOut:
    enrollment = db.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return serialize(enrollment)


@router.get("/students/{student_id}/enrollments", response_model=list[EnrollmentOut])
def get_student_enrollments(student_id: str, db: Session = Depends(get_db)) -> list[EnrollmentOut]:
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).order_by(Enrollment.created_at.desc()).all()
    return [serialize(enrollment) for enrollment in enrollments]


@router.post("/enrollments/{enrollment_id}/cancel", response_model=EnrollmentCancelResponse)
def cancel(enrollment_id: str, db: Session = Depends(get_db)) -> EnrollmentCancelResponse:
    enrollment = db.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    try:
        cancel_enrollment(db, enrollment=enrollment)
        db.commit()
        return EnrollmentCancelResponse(message="Enrollment cancelled")
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
