from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Certificate
from .audit_service import record_event


def generate_certificate(db: Session, *, student_id: str, course_id: str) -> Certificate:
    existing = db.execute(
        select(Certificate).where(Certificate.student_id == student_id, Certificate.course_id == course_id)
    ).scalar_one_or_none()
    if existing:
        return existing

    current_year = datetime.now(timezone.utc).year
    count = db.execute(
        select(func.count(Certificate.id)).where(Certificate.certificate_number.like(f"CERT-{current_year}-%"))
    ).scalar_one()
    certificate_number = f"CERT-{current_year}-{count + 1:04d}"

    certificate = Certificate(
        id=str(uuid4()),
        student_id=student_id,
        course_id=course_id,
        certificate_number=certificate_number,
        status="GENERATED",
    )
    db.add(certificate)
    db.flush()
    record_event(
        db,
        event_type="certificate.generated",
        entity_type="certificate",
        entity_id=certificate.id,
        student_id=student_id,
        payload={"student_id": student_id, "course_id": course_id, "certificate_number": certificate_number},
    )
    return certificate

