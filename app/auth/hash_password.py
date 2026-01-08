"""
Файл hash_password.py содержит класс HashPassword, который предоставляет методы для работы с хешированием паролей.
"""
from passlib.context import CryptContext

# Создание контекста для хеширования паролей с использованием алгоритма bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Класс для работы с хешированием паролей
class HashPassword:
    # Метод для создания хеша из пароля
    def create_hash(self, password: str) -> str:
        return pwd_context.hash(password)
    
    # Метод для проверки соответствия пароля и его хеша
    def verify_hash(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)