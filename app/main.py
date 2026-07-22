from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import API Routers
from app.routers import (
    auth,
    agents,
    calls,
    contacts,
    connectors,
    phone_numbers,
    api_keys,
    webhooks,
    memory,
    emotion,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API V1 Routers
api_v1_prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(agents.router, prefix=api_v1_prefix)
app.include_router(calls.router, prefix=api_v1_prefix)
app.include_router(contacts.router, prefix=api_v1_prefix)
app.include_router(connectors.router)  # Handles /api/connectors
app.include_router(phone_numbers.router, prefix=api_v1_prefix)
app.include_router(api_keys.router, prefix=api_v1_prefix)
app.include_router(webhooks.router, prefix=api_v1_prefix)
app.include_router(memory.router, prefix=api_v1_prefix)
app.include_router(emotion.router, prefix=api_v1_prefix)


@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "version": settings.VERSION}
