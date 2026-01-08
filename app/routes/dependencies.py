"""
Файл dependencies предоставляет функцию-зависимость для получения текущего пользователя для маршрутов.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database.connection import get_session
from ..models.users import User
from ..auth.authenticate import authenticate

# Функция-зависимость для получения текущего пользователя из базы данных по email из JWT токена.
async def get_current_user(
    user_email: str = Depends(authenticate),
    session: AsyncSession = Depends(get_session)
) -> User:
    result = await session.execute(select(User).where(User.email == user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user