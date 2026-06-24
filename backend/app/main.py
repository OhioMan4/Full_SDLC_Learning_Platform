from contextlib import asynccontextmanager
import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select

from .config import get_settings
from .database import Base, SessionLocal, engine, get_db
from .logging_config import configure_logging
from .models import User
from .routes.audit import router as audit_router
from .routes.certificates import router as certificates_router
from .routes.courses import router as courses_router
from .routes.enrollments import router as enrollments_router
from .routes.health import router as health_router
from .routes.notifications import router as notifications_router
from .routes.progress import router as progress_router
from .schemas import AuthUser, LoginRequest, LoginResponse
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


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64url_decode(raw: str) -> bytes:
    padded = raw + "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(padded.encode())


def create_access_token(*, user_id: str, name: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "name": name,
        "role": role,
        "exp": int((datetime.now(timezone.utc) + timedelta(minutes=settings.auth_token_exp_minutes)).timestamp()),
    }
    payload_part = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signature = hmac.new(settings.auth_secret.encode(), payload_part.encode(), hashlib.sha256).digest()
    return f"{payload_part}.{_b64url_encode(signature)}"


def verify_access_token(token: str) -> dict:
    try:
        payload_part, signature_part = token.split(".")
        expected = hmac.new(settings.auth_secret.encode(), payload_part.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64url_decode(signature_part)):
            raise ValueError("Invalid signature")
        payload = json.loads(_b64url_decode(payload_part))
        if int(payload.get("exp", 0)) < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("Expired token")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


PUBLIC_PATHS = {"/health", "/auth/login"}
PUBLIC_PREFIXES = ("/docs", "/redoc", "/openapi.json")


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    if path in PUBLIC_PATHS or path.startswith(PUBLIC_PREFIXES):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": "Missing bearer token"})

    token = auth_header.replace("Bearer ", "", 1).strip()
    try:
        request.state.user = verify_access_token(token)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    return await call_next(request)


@app.post("/auth/login", response_model=LoginResponse, tags=["auth"])
def login(payload: LoginRequest, db=Depends(get_db)) -> LoginResponse:
    user = db.execute(select(User).where(User.id == payload.username)).scalar_one_or_none()
    if not user or payload.password != settings.demo_user_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user_id=user.id, name=user.name, role=user.role)
    return LoginResponse(access_token=token, user=AuthUser(id=user.id, name=user.name, role=user.role))


@app.get("/auth/me", response_model=AuthUser, tags=["auth"])
def me(request: Request) -> AuthUser:
    payload = request.state.user
    return AuthUser(id=payload["sub"], name=payload["name"], role=payload["role"])

