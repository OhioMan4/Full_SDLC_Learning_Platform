from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Certificate, Course
from ..schemas import CertificateOut

router = APIRouter(tags=["certificates"])


def serialize(certificate: Certificate, course_title: str | None = None) -> CertificateOut:
    return CertificateOut(
        id=certificate.id,
        student_id=certificate.student_id,
        course_id=certificate.course_id,
        certificate_number=certificate.certificate_number,
        status=certificate.status,  # type: ignore[arg-type]
        generated_at=certificate.generated_at,
        created_at=certificate.created_at,
        course_title=course_title,
    )


@router.get("/students/{student_id}/certificates", response_model=list[CertificateOut])
def list_student_certificates(student_id: str, db: Session = Depends(get_db)) -> list[CertificateOut]:
    certificates = db.query(Certificate).filter(Certificate.student_id == student_id).order_by(Certificate.generated_at.desc()).all()
    result: list[CertificateOut] = []
    for certificate in certificates:
        course = db.get(Course, certificate.course_id)
        result.append(serialize(certificate, course.title if course else None))
    return result


@router.get("/certificates/{certificate_id}", response_model=CertificateOut)
def get_certificate(certificate_id: str, db: Session = Depends(get_db)) -> CertificateOut:
    certificate = db.get(Certificate, certificate_id)
    if not certificate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    course = db.get(Course, certificate.course_id)
    return serialize(certificate, course.title if course else None)

