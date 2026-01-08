"""
Тесты для маршрутов работы с пользователями
"""
import pytest
import httpx
from ..auth.jwt_handler import create_access_token

@pytest.fixture
async def access_token(client: httpx.AsyncClient) -> str:
    """Фикстура для создания токена доступа"""
    # Сначала создаем пользователя
    register_payload = {
        "name": "Test",
        "surname": "User",
        "email": "testuser@server.com",
        "password": "testpassword123",
        "budgetLimit": 10000.0
    }
    
    response = await client.post("/user/register", json=register_payload)
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_get_current_user(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест получения данных текущего пользователя"""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    response = await client.get("/user/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "name" in data
    assert "surname" in data

@pytest.mark.asyncio
async def test_get_user_by_id(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест получения пользователя по ID"""
    # Сначала создаем пользователя
    register_payload = {
        "name": "Алексей",
        "surname": "Алексеев",
        "email": "alexey@server.com",
        "password": "testpassword123",
        "budgetLimit": 15000.0
    }
    
    register_response = await client.post("/user/register", json=register_payload)
    user_id = register_response.json()["user_id"]
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    response = await client.get(f"/user/{user_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "alexey@server.com"

@pytest.mark.asyncio
async def test_update_user(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест обновления данных пользователя"""
    # Сначала получаем текущего пользователя
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    me_response = await client.get("/user/me", headers=headers)
    user_id = me_response.json()["id"]
    
    # Обновляем данные текущего пользователя
    update_payload = {
        "name": "ОбновленноеИмя",
        "surname": "ОбновленнаяФамилия",
        "budgetLimit": 2000.0
    }
    
    headers["Content-Type"] = "application/json"
    
    response = await client.put(f"/user/{user_id}", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ОбновленноеИмя"
    assert data["surname"] == "ОбновленнаяФамилия"
    assert data["budgetLimit"] == 2000.0

@pytest.mark.asyncio
async def test_update_user_budget(client: httpx.AsyncClient) -> None:
    """Тест обновления лимита бюджета пользователя"""
    # Создаем пользователя и получаем его токен
    register_payload = {
        "name": "Бюджетный",
        "surname": "Пользователь",
        "email": "budget@server.com",
        "password": "testpassword123",
        "budgetLimit": 1000.0
    }
    
    register_response = await client.post("/user/register", json=register_payload)
    user_data = register_response.json()
    user_id = user_data["user_id"]
    user_token = user_data["access_token"]
    
    # Обновляем бюджет с его же токеном
    update_payload = {
        "budgetLimit": 5000.0
    }
    
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.patch(f"/user/{user_id}/budget", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["budgetLimit"] == 5000.0

@pytest.mark.asyncio
async def test_update_user_avatar(client: httpx.AsyncClient) -> None:
    """Тест обновления аватара пользователя"""
    # Создаем пользователя и получаем его токен
    register_payload = {
        "name": "Аватарный",
        "surname": "Пользователь",
        "email": "avatar@server.com",
        "password": "testpassword123",
        "budgetLimit": 1000.0,
        "avatar": "https://old-avatar.com/avatar.jpg"
    }
    
    register_response = await client.post("/user/register", json=register_payload)
    user_data = register_response.json()
    user_id = user_data["user_id"]
    user_token = user_data["access_token"]
    
    # Обновляем аватар с его же токеном
    update_payload = {
        "avatar": "https://new-avatar.com/avatar.png"
    }
    
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.patch(f"/user/{user_id}/avatar", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["avatar"] == "https://new-avatar.com/avatar.png"