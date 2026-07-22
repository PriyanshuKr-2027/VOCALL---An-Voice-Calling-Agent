from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class AuthLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(payload: AuthLoginRequest):
    return {"message": "Use Supabase Auth client for authentication", "email": payload.email}

@router.get("/me")
async def get_current_user_profile():
    return {"status": "authenticated", "message": "User session active"}
