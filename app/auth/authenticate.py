"""
Файл authenticate содержит функцию authenticate, которая используется для аутентификации пользователей по JWT токену.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .jwt_handler import verify_access_token

# Создание схемы OAuth2 для получения токена из запроса (токен извлекается из заголовка Authorization)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

# Функция-зависимость для аутентификации пользователей по JWT токену
async def authenticate(token: str = Depends(oauth2_scheme)) -> str:
    # Проверка наличия токена
    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Sign in for access")
    
    # Верификация токена и получение данных из него
    decoded_token = verify_access_token(token)
    
    # Возвращаем идентификатор пользователя из декодированного токена
    return decoded_token["user"]
