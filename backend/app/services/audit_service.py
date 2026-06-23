from __future__ import annotations

import json
from uuid import uuid4

from sqlalchemy.orm import Session

from ..models import AuditEvent


def record_event(
    db: Session,
    *,
    event_type: str,
    entity_type: str,
    entity_id: str,
    student_id: str | None,
    payload: dict,
) -> AuditEvent:
    event = AuditEvent(
        id=str(uuid4()),
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        student_id=student_id,
        payload_json=json.dumps(payload, default=str),
    )
    db.add(event)
    db.flush()
    return event

