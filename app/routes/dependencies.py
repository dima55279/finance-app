from fastapi import HTTPException, status, Cookie, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database.connection import get_session
from ..models.users import User

current_sessions = {}

async def get_current_user(
    session_id: str = Cookie(None, alias="session_id"),
    session: AsyncSession = Depends(get_session)
):
    if not session_id or session_id not in current_sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user_id = current_sessions[session_id]
    
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user