from fastapi import APIRouter, HTTPException, status, Depends, Cookie, UploadFile, File
from ..models.users import UserLogin, UserRegister, UserData, UserBudgetUpdate, UserAvatarUpdate
from typing import Dict, Any, List
import base64

user_router = APIRouter(
    tags=["User"],
)

users_db: Dict[int, UserData] = {}
user_counter = 1
current_sessions: Dict[str, int] = {} 

def get_current_user(session_id: str = Cookie(None, alias="session_id")) -> UserData:
    if not session_id or session_id not in current_sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user_id = current_sessions[session_id]
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return users_db[user_id]

@user_router.post("/register")
async def register_user(data: UserRegister) -> dict:
    global user_counter

    for user in users_db.values():
        if user.email == data.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with supplied email already exists"
            )

    data.id = user_counter
    user_counter += 1

    users_db[data.id] = data

    import uuid
    session_id = str(uuid.uuid4())
    current_sessions[session_id] = data.id
    
    return {
        "message": "User successfully registered!",
        "user_id": data.id,
        "session_id": session_id
    }

@user_router.post("/login")
async def login_user(user: UserLogin) -> dict:
    found_user = None
    for u in users_db.values():
        if u.email == user.email:
            found_user = u
            break
    
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
    
    import uuid
    session_id = str(uuid.uuid4())
    current_sessions[session_id] = found_user.id
    
    return {
        "message": "User signed in successfully",
        "user_id": found_user.id,
        "session_id": session_id
    }

@user_router.post("/logout")
async def logout_user(session_id: str = Cookie(None, alias="session_id")):
    if session_id in current_sessions:
        del current_sessions[session_id]
    
    return {"message": "Logged out successfully"}

@user_router.get("/me")
async def get_current_user_endpoint(current_user: UserData = Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "id": current_user.id,
        "name": current_user.name,
        "surname": current_user.surname,
        "email": current_user.email,
        "budgetLimit": current_user.budgetLimit,
        "avatar": current_user.avatar
    }

@user_router.get("/{user_id}")
async def get_user_by_id(user_id: int) -> Dict[str, Any]:
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = users_db[user_id]
    return {
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "budgetLimit": user.budgetLimit,
        "avatar": user.avatar
    }

@user_router.patch("")
async def update_user_budget(
    user_id: int, 
    budget_update: UserBudgetUpdate,
    current_user: UserData = Depends(get_current_user)
) -> Dict[str, Any]:

    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's budget"
        )
    
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if budget_update.budgetLimit is not None:
        users_db[user_id].budgetLimit = budget_update.budgetLimit
    
    return {
        "id": users_db[user_id].id,
        "name": users_db[user_id].name,
        "surname": users_db[user_id].surname,
        "email": users_db[user_id].email,
        "budgetLimit": users_db[user_id].budgetLimit,
        "avatar": users_db[user_id].avatar,
        "message": "Budget updated successfully"
    }

@user_router.patch("/avatar")
async def update_user_avatar(
    user_id: int, 
    avatar_update: UserAvatarUpdate,
    current_user: UserData = Depends(get_current_user)
) -> Dict[str, Any]:

    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's avatar"
        )
    
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if avatar_update.avatar is not None:
        users_db[user_id].avatar = avatar_update.avatar
    
    return {
        "id": users_db[user_id].id,
        "name": users_db[user_id].name,
        "surname": users_db[user_id].surname,
        "email": users_db[user_id].email,
        "budgetLimit": users_db[user_id].budgetLimit,
        "avatar": users_db[user_id].avatar,
        "message": "Avatar updated successfully"
    }