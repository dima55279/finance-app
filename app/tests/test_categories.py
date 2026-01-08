"""
Тесты для маршрутов работы с категориями
"""
import pytest
import httpx
from ..auth.jwt_handler import create_access_token

@pytest.fixture
async def access_token(client: httpx.AsyncClient) -> str:
    """Фикстура для создания токена доступа через регистрацию пользователя"""
    # Сначала регистрируем пользователя
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
async def test_create_category(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест создания категории"""
    payload = {
        "name": "Стипендия",
        "color": "#FF5733",
        "category_type": "Доход"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.post("/category", json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Стипендия"
    assert data["color"] == "#FF5733"
    assert data["category_type"] == "Доход"
    assert "id" in data
    assert "author" in data

@pytest.mark.asyncio
async def test_get_all_categories(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест получения всех категорий"""
    # Сначала создаем несколько категорий
    categories = [
        {"name": "Зарплата", "color": "#33FF57", "category_type": "Доход"},
        {"name": "Продукты", "color": "#3357FF", "category_type": "Расход"},
        {"name": "Развлечения", "color": "#F3FF33", "category_type": "Расход"}
    ]
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    for category in categories:
        await client.post("/category", json=category, headers=headers)
    
    # Получаем все категории
    response = await client.get("/category", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3

@pytest.mark.asyncio
async def test_get_category_by_id(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест получения категории по ID"""
    # Создаем категорию
    create_payload = {
        "name": "Тестовая категория",
        "color": "#FF33A8",
        "category_type": "Доход"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    create_response = await client.post("/category", json=create_payload, headers=headers)
    category_id = create_response.json()["id"]
    
    # Получаем категорию по ID
    response = await client.get(f"/category/{category_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == category_id
    assert data["name"] == "Тестовая категория"

@pytest.mark.asyncio
async def test_update_category(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест обновления категории"""
    # Создаем категорию
    create_payload = {
        "name": "Старая категория",
        "color": "#000000",
        "category_type": "Доход"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    create_response = await client.post("/category", json=create_payload, headers=headers)
    category_id = create_response.json()["id"]
    
    # Обновляем категорию
    update_payload = {
        "name": "Обновленная категория",
        "color": "#FFFFFF",
        "category_type": "Расход"
    }
    
    response = await client.put(f"/category/{category_id}", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Обновленная категория"
    assert data["color"] == "#FFFFFF"
    assert data["category_type"] == "Расход"

@pytest.mark.asyncio
async def test_delete_category(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест удаления категории"""
    # Создаем категорию
    create_payload = {
        "name": "Категория для удаления",
        "color": "#FF0000",
        "category_type": "Доход"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    create_response = await client.post("/category", json=create_payload, headers=headers)
    category_id = create_response.json()["id"]
    
    # Удаляем категорию
    response = await client.delete(f"/category/{category_id}", headers=headers)
    
    assert response.status_code == 204
    
    # Проверяем, что категория действительно удалена
    get_response = await client.get(f"/category/{category_id}", headers=headers)
    assert get_response.status_code == 404

@pytest.mark.asyncio
async def test_get_nonexistent_category(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест получения несуществующей категории"""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    response = await client.get("/category/99999", headers=headers)
    
    assert response.status_code == 404
    assert "не существует" in response.json()["detail"]