from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AuditEvent
from ..schemas import AuditEventOut

router = APIRouter(tags=["audit"])


@router.get("/audit-events", response_model=list[AuditEventOut])
def list_audit_events(db: Session = Depends(get_db)) -> list[AuditEventOut]:
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).all()
    return [
        AuditEventOut(
            id=event.id,
            event_type=event.event_type,
            entity_type=event.entity_type,
            entity_id=event.entity_id,
            student_id=event.student_id,
            payload_json=event.payload_json,
            created_at=event.created_at,
        )
        for event in events
    ]

