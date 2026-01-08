"""
Тесты для маршрутов аутентификации пользователей
"""
import pytest
import httpx
from datetime import datetime
from ..auth.jwt_handler import create_access_token

@pytest.mark.asyncio
async def test_register_new_user(client: httpx.AsyncClient) -> None:
    """Тест регистрации нового пользователя"""
    payload = {
        "name": "Иван",
        "surname": "Иванов",
        "email": "testuser@server.com",
        "password": "testpassword123",
        "budgetLimit": 10000.0,
        "avatar": "https://example.com/avatar.jpg"
    }
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.post("/user/register", json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User successfully registered!"
    assert "access_token" in data
    assert data["token_type"] == "Bearer"
    assert "user_id" in data

@pytest.mark.asyncio
async def test_login_user(client: httpx.AsyncClient) -> None:
    """Тест входа пользователя"""
    # Сначала регистрируем пользователя
    register_payload = {
        "name": "Петр",
        "surname": "Петров",
        "email": "testuser2@server.com",
        "password": "testpassword123",
        "budgetLimit": 5000.0
    }
    
    await client.post("/user/register", json=register_payload)
    
    # Теперь тестируем вход
    login_payload = {
        "email": "testuser2@server.com",
        "password": "testpassword123"
    }
    
    response = await client.post("/user/login", json=login_payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User signed in successfully"
    assert "access_token" in data
    assert data["token_type"] == "Bearer"

@pytest.mark.asyncio
async def test_login_user_wrong_password(client: httpx.AsyncClient) -> None:
    """Тест входа с неправильным паролем"""
    # Сначала регистрируем пользователя
    register_payload = {
        "name": "Сергей",
        "surname": "Сергеев",
        "email": "testuser3@server.com",
        "password": "correctpassword",
        "budgetLimit": 3000.0
    }
    
    await client.post("/user/register", json=register_payload)
    
    # Пытаемся войти с неправильным паролем
    login_payload = {
        "email": "testuser3@server.com",
        "password": "wrongpassword"
    }
    
    response = await client.post("/user/login", json=login_payload)
    
    assert response.status_code == 403
    assert response.json()["detail"] == "Неправильный пароль!"

@pytest.mark.asyncio
async def test_register_duplicate_email(client: httpx.AsyncClient) -> None:
    """Тест регистрации с уже существующим email"""
    payload = {
        "name": "Дмитрий",
        "surname": "Дмитриев",
        "email": "duplicate@server.com",
        "password": "testpassword123",
        "budgetLimit": 2000.0
    }
    
    # Первая регистрация
    await client.post("/user/register", json=payload)
    
    # Вторая попытка с тем же email
    response = await client.post("/user/register", json=payload)
    
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]