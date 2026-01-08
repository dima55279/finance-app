"""
Файл jwt_handler содержит функции для создания и верификации JWT токенов.
"""
import time
from datetime import datetime
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import HTTPException, status

# Секретный ключ для подписи JWT токенов
SECRET_KEY: str = "SECRET_KEY"

# Функция для создания JWT токена доступа
def create_access_token(user: str) -> str:
    # Формирование payload токена с идентификатором пользователя и временем истечения (1 час)
    payload = {"user": user, "expires": time.time() + 3600}
    
    # Кодирование токена с использованием секретного ключа и алгоритма HS256
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    return token

# Функция для верификации JWT токена доступа
def verify_access_token(token: str) -> dict:
    try:
        # Декодирование токена с проверкой подписи
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        # Получение времени истечения токена
        expire = data.get("expires")
        
        # Проверка наличия поля expires в токене
        if expire is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token supplied",
            )
        
        # Проверка срока действия токена
        if datetime.utcnow() > datetime.utcfromtimestamp(expire):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Token expired!"
            )
        
        # Возврат данных из токена при успешной верификации
        return data
    except InvalidTokenError:
        # Обработка невалидного токена
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token"
        )