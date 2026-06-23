# Architecture

The application uses a simple monolithic backend with clear modules:

- React + Vite frontend
- FastAPI backend
- PostgreSQL database

Request flow:

`Browser -> Frontend -> FastAPI routes -> service layer -> PostgreSQL`

The backend keeps course, enrollment, progress, certificate, notification, and audit logic in separate service modules so the app can later be split into workers or services.

