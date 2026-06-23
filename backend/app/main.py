from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, SessionLocal, engine
from .logging_config import configure_logging
from .routes.audit import router as audit_router
from .routes.certificates import router as certificates_router
from .routes.courses import router as courses_router
from .routes.enrollments import router as enrollments_router
from .routes.health import router as health_router
from .routes.notifications import router as notifications_router
from .routes.progress import router as progress_router
from .seed import seed_data

settings = get_settings()
configure_logging(settings.log_level)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(courses_router)
app.include_router(enrollments_router)
app.include_router(progress_router)
app.include_router(certificates_router)
app.include_router(notifications_router)
app.include_router(audit_router)

