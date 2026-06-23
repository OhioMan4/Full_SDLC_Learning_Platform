from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Notification
from ..schemas import NotificationOut

router = APIRouter(tags=["notifications"])


@router.get("/students/{student_id}/notifications", response_model=list[NotificationOut])
def list_notifications(student_id: str, db: Session = Depends(get_db)) -> list[NotificationOut]:
    notifications = db.query(Notification).filter(Notification.student_id == student_id).order_by(Notification.created_at.desc()).all()
    return [
        NotificationOut(
            id=notification.id,
            student_id=notification.student_id,
            type=notification.type,
            message=notification.message,
            status=notification.status,
            created_at=notification.created_at,
        )
        for notification in notifications
    ]

