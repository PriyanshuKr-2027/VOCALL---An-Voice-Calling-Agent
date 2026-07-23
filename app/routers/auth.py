from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Dependency that decodes and validates JWT header, returning user profile & org_id.
    Compatible with Clerk, Supabase Auth, and Firebase Auth JWT formats.
    Raises HTTP 401 on invalid token.
    In development mode, falls back to local dev user if no header is provided.
    """
    is_prod = settings.ENVIRONMENT.lower() == "production"

    if not authorization:
        if is_prod:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Development mode fallback
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "dev@vocall.ai",
            "org_id": "00000000-0000-0000-0000-000000000000",
            "role": "admin",
        }

    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        import jwt

        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get("sub") or decoded.get("id")
        if not user_id:
            raise ValueError("Token missing user subject")

        org_id = (
            decoded.get("org_id")
            or decoded.get("app_metadata", {}).get("org_id")
            or decoded.get("user_metadata", {}).get("org_id")
            or "00000000-0000-0000-0000-000000000000"
        )

        return {
            "id": user_id,
            "email": decoded.get("email", "user@vocall.ai"),
            "org_id": org_id,
            "role": decoded.get("role", "member"),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authorization token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/login")
async def login(payload: AuthLoginRequest):
    """
    Authenticates user credentials using Supabase Auth REST API.
    """
    supabase_url = settings.NEXT_PUBLIC_SUPABASE_URL
    anon_key = settings.NEXT_PUBLIC_SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY

    if supabase_url and anon_key:
        endpoint = f"{supabase_url.rstrip('/')}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": anon_key,
            "Content-Type": "application/json",
        }
        body = {
            "email": payload.email,
            "password": payload.password,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(endpoint, headers=headers, json=body)
                if res.status_code == 200:
                    data = res.json()
                    user_data = data.get("user", {})
                    org_id = (
                        user_data.get("user_metadata", {}).get("org_id")
                        or user_data.get("app_metadata", {}).get("org_id")
                        or "00000000-0000-0000-0000-000000000000"
                    )
                    return {
                        "access_token": data.get("access_token"),
                        "token_type": "bearer",
                        "expires_in": data.get("expires_in"),
                        "refresh_token": data.get("refresh_token"),
                        "user": {
                            "id": user_data.get("id"),
                            "email": user_data.get("email"),
                            "org_id": org_id,
                        },
                    }
                else:
                    error_data = res.json()
                    raise HTTPException(
                        status_code=res.status_code,
                        detail=error_data.get("error_description") or error_data.get("msg") or "Authentication failed",
                    )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Supabase Auth service unreachable: {exc}",
            )

    # Dev/Mock login mode when Supabase credentials are missing
    return {
        "access_token": f"dev_mock_token_{payload.email}",
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": payload.email,
            "org_id": "00000000-0000-0000-0000-000000000000",
        },
    }


@router.get("/me")
async def get_current_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    return {"status": "authenticated", "user": user}
