from fastapi import APIRouter, HTTPException, status, Depends, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime, timedelta

from ..database.connection import get_session
from ..models.users import User
from ..schemas.users import UserLogin, UserRegister, UserUpdate, UserResponse, UserBudgetUpdate, UserAvatarUpdate
from .dependencies import get_current_user, current_sessions

user_router = APIRouter(
    prefix="/user",
    tags=["Users"]
)

@user_router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(
    response: Response, 
    data: UserRegister,
    session: AsyncSession = Depends(get_session)
) -> dict:
    result = await session.execute(
        select(User).where(User.email == data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with supplied email already exists"
        )

    new_user = User(
        name=data.name,
        surname=data.surname,
        email=data.email,
        password=data.password,
        budgetLimit=data.budgetLimit,
        avatar=data.avatar
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    session_id = str(uuid.uuid4())
    current_sessions[session_id] = new_user.id

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=3600,
    )
    
    return {
        "message": "User successfully registered!",
        "user_id": new_user.id,
        "session_id": session_id
    }

@user_router.post("/login", response_model=dict)
async def login_user(
    response: Response,
    user: UserLogin,
    session: AsyncSession = Depends(get_session)
) -> dict:
    result = await session.execute(
        select(User).where(User.email == user.email)
    )
    found_user = result.scalar_one_or_none()
    
    if not found_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not exist"
        )

    if found_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Wrong credentials"
        )
    
    session_id = str(uuid.uuid4())
    current_sessions[session_id] = found_user.id

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=3600,
    )
    
    return {
        "message": "User signed in successfully",
        "user_id": found_user.id,
        "session_id": session_id
    }

@user_router.post("/logout", response_model=dict)
async def logout_user(
    response: Response,
    session_id: str = Cookie(None, alias="session_id")
):
    if session_id and session_id in current_sessions:
        del current_sessions[session_id]

    response.delete_cookie(key="session_id")
    
    return {"message": "Logged out successfully"}

@user_router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user = Depends(get_current_user)
) -> UserResponse:
    return current_user

@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    session: AsyncSession = Depends(get_session)
) -> UserResponse:
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@user_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's data"
        )
    
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if data.name is not None:
        user.name = data.name
    if data.surname is not None:
        user.surname = data.surname
    if data.email is not None:
        email_check = await session.execute(
            select(User).where(User.email == data.email, User.id != user_id)
        )
        existing_user = email_check.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use by another user"
            )
        user.email = data.email
    if data.password is not None:
        user.password = data.password
    if data.budgetLimit is not None:
        user.budgetLimit = data.budgetLimit
    if data.avatar is not None:
        user.avatar = data.avatar
    
    await session.commit()
    await session.refresh(user)
    
    return user

@user_router.patch("/{user_id}/budget", response_model=UserResponse)
async def update_user_budget(
    user_id: int,
    budget_update: UserBudgetUpdate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's budget"
        )
    
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.budgetLimit = budget_update.budgetLimit
    
    await session.commit()
    await session.refresh(user)
    
    return user

@user_router.patch("/{user_id}/avatar", response_model=UserResponse)
async def update_user_avatar(
    user_id: int,
    avatar_update: UserAvatarUpdate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> UserResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's avatar"
        )
    
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.avatar = avatar_update.avatar
    
    await session.commit()
    await session.refresh(user)
    
    return user