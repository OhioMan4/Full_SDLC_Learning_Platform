from __future__ import annotations

from uuid import uuid4

from sqlalchemy.orm import Session

from ..models import Notification


def create_notification(db: Session, *, student_id: str, type_: str, message: str) -> Notification:
    notification = Notification(id=str(uuid4()), student_id=student_id, type=type_, message=message, status="SENT")
    db.add(notification)
    db.flush()
    return notification

