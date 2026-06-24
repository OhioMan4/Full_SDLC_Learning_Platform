from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime


class CourseBase(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1)
    level: str = Field(min_length=1)
    instructor: str = Field(min_length=1)
    duration_minutes: int = Field(ge=1)


class CourseCreate(CourseBase):
    id: str | None = None


class LessonBase(BaseModel):
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    order_index: int = Field(ge=1)
    duration_minutes: int = Field(ge=1)


class LessonCreate(LessonBase):
    id: str | None = None


class LessonOut(LessonBase):
    id: str
    course_id: str
    created_at: datetime
    updated_at: datetime


class CourseOut(CourseBase):
    id: str
    created_at: datetime
    updated_at: datetime
    lessons: list[LessonOut] = Field(default_factory=list)


class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str


class EnrollmentCancelResponse(BaseModel):
    message: str


class EnrollmentOut(BaseModel):
    id: str
    student_id: str
    course_id: str
    status: Literal["ACTIVE", "COMPLETED", "CANCELLED"]
    created_at: datetime
    updated_at: datetime


class LessonCompleteRequest(BaseModel):
    student_id: str
    course_id: str
    lesson_id: str


class CourseProgressOut(BaseModel):
    id: str
    student_id: str
    course_id: str
    completed_lessons: int
    total_lessons: int
    progress_percentage: int
    status: Literal["IN_PROGRESS", "COMPLETED"]
    updated_at: datetime
    completed_lesson_ids: list[str] = Field(default_factory=list)


class CertificateOut(BaseModel):
    id: str
    student_id: str
    course_id: str
    certificate_number: str
    status: Literal["GENERATED"]
    generated_at: datetime
    created_at: datetime
    course_title: str | None = None


class NotificationOut(BaseModel):
    id: str
    student_id: str
    type: str
    message: str
    status: str
    created_at: datetime


class AuditEventOut(BaseModel):
    id: str
    event_type: str
    entity_type: str
    entity_id: str
    student_id: str | None
    payload_json: str
    created_at: datetime


class ApiMessage(BaseModel):
    message: str


class PlatformStats(BaseModel):
    total_courses: int
    total_enrollments: int
    completed_courses: int
    generated_certificates: int


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthUser(BaseModel):
    id: str
    name: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser

