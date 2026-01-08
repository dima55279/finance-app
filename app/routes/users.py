"""
Файл users предоставляет маршруты для работы с пользователями.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database.connection import get_session
from ..models.users import User
from ..schemas.users import UserLogin, UserRegister, UserUpdate, UserResponse, UserBudgetUpdate, UserAvatarUpdate
from ..auth.hash_password import HashPassword
from ..auth.jwt_handler import create_access_token
from .dependencies import get_current_user

user_router = APIRouter(
    prefix="/user",
    tags=["Users"]
)

hash_password = HashPassword()

# Регистрация нового пользователя. Функция создает нового пользователя с указанными данными, хеширует пароль, сохраняет пользователя в базе данных 
# и возвращает JWT токен для аутентификации.
@user_router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(
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

    hashed_password = hash_password.create_hash(data.password)
    
    new_user = User(
        name=data.name,
        surname=data.surname,
        email=data.email,
        password=hashed_password,
        budgetLimit=data.budgetLimit,
        avatar=data.avatar
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    token = create_access_token(new_user.email)
    
    return {
        "message": "User successfully registered!",
        "user_id": new_user.id,
        "access_token": token,
        "token_type": "Bearer"
    }

# Аутентификация пользователя. Функция проверяет учетные данные пользователя (email и пароль) и возвращает JWT токен для последующей аутентификации.
@user_router.post("/login", response_model=dict)
async def login_user(
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

    if not hash_password.verify_hash(user.password, found_user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Wrong credentials"
        )
    
    token = create_access_token(found_user.email)
    
    return {
        "message": "User signed in successfully",
        "user_id": found_user.id,
        "access_token": token,
        "token_type": "Bearer"
    }

# Получение данных текущего аутентифицированного пользователя. Функция возвращает информацию о пользователе, который в данный момент аутентифицирован.
@user_router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    return current_user

# Получение данных пользователя по ID. Функция позволяет получить информацию о пользователе по его ID.
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

# Обновление данных пользователя. Функция позволяет текущему пользователю обновить свои данные и проверяет уникальность email при его изменении.
@user_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
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
        hashed_password = hash_password.create_hash(data.password)
        user.password = hashed_password
    if data.budgetLimit is not None:
        user.budgetLimit = data.budgetLimit
    if data.avatar is not None:
        user.avatar = data.avatar
    
    await session.commit()
    await session.refresh(user)
    
    return user

# Обновление лимита бюджета пользователя. Функция позволяет текущему пользователю изменить свой бюджетный лимит.
@user_router.patch("/{user_id}/budget", response_model=UserResponse)
async def update_user_budget(
    user_id: int,
    budget_update: UserBudgetUpdate,
    current_user: User = Depends(get_current_user),
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

# Обновление аватара пользователя. Функция позволяет текущему пользователю изменить свой аватар.
@user_router.patch("/{user_id}/avatar", response_model=UserResponse)
async def update_user_avatar(
    user_id: int,
    avatar_update: UserAvatarUpdate,
    current_user: User = Depends(get_current_user),
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