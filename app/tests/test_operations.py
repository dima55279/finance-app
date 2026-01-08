"""
Тесты для маршрутов работы с финансовыми операциями
"""
import pytest
import httpx
from datetime import datetime, timezone, timedelta

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

@pytest.fixture
async def category_id(client: httpx.AsyncClient, access_token: str) -> int:
    """Фикстура для создания категории и возврата ее ID"""
    payload = {
        "name": "Тестовая категория для операций",
        "color": "#33FF57",
        "category_type": "Доход"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.post("/category", json=payload, headers=headers)
    return response.json()["id"]

@pytest.mark.asyncio
async def test_create_operation(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест создания операции"""
    payload = {
        "name": "Начисление стипендии",
        "date": "2024-12-25T00:00:00Z",
        "amount": 3516.48,
        "categoryId": category_id
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.post("/operation", json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Начисление стипендии"
    assert data["amount"] == 3516.48
    assert data["category_id"] == category_id
    assert "id" in data
    assert "author" in data

@pytest.mark.asyncio
async def test_get_all_operations(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест получения всех операций"""
    # Создаем несколько операций
    operations = [
        {"name": "Зарплата", "date": "2024-12-01T00:00:00Z", "amount": 50000.0, "categoryId": category_id},
        {"name": "Покупка продуктов", "date": "2024-12-02T00:00:00Z", "amount": -2500.0, "categoryId": category_id},
        {"name": "Оплата интернета", "date": "2024-12-03T00:00:00Z", "amount": -800.0, "categoryId": category_id}
    ]
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    for operation in operations:
        await client.post("/operation", json=operation, headers=headers)
    
    # Получаем все операции
    response = await client.get("/operation", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3

@pytest.mark.asyncio
async def test_get_operation_by_id(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест получения операции по ID"""
    # Создаем операцию
    create_payload = {
        "name": "Тестовая операция",
        "date": "2024-12-10T12:30:00Z",
        "amount": 1000.0,
        "categoryId": category_id
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    create_response = await client.post("/operation", json=create_payload, headers=headers)
    operation_id = create_response.json()["id"]
    
    # Получаем операцию по ID
    response = await client.get(f"/operation/{operation_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == operation_id
    assert data["name"] == "Тестовая операция"
    assert data["amount"] == 1000.0

@pytest.mark.asyncio
async def test_get_operations_with_filters(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест получения операций с фильтрацией по дате"""
    # Создаем операции с разными датами
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    # Операция за ноябрь
    await client.post("/operation", json={
        "name": "Ноябрьская операция",
        "date": "2024-11-15T00:00:00Z",
        "amount": 1000.0,
        "categoryId": category_id
    }, headers=headers)
    
    # Операции за декабрь
    await client.post("/operation", json={
        "name": "Декабрьская операция 1",
        "date": "2024-12-05T00:00:00Z",
        "amount": 2000.0,
        "categoryId": category_id
    }, headers=headers)
    
    await client.post("/operation", json={
        "name": "Декабрьская операция 2",
        "date": "2024-12-20T00:00:00Z",
        "amount": 3000.0,
        "categoryId": category_id
    }, headers=headers)
    
    # Фильтруем по декабрю
    start_date = "2024-12-01T00:00:00Z"
    end_date = "2024-12-31T23:59:59Z"
    
    response = await client.get(
        f"/operation?start_date={start_date}&end_date={end_date}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    for operation in data:
        assert "Декабрьская" in operation["name"]

@pytest.mark.asyncio
async def test_update_operation(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест обновления операции"""
    # Создаем операцию
    create_payload = {
        "name": "Старая операция",
        "date": "2024-12-01T00:00:00Z",
        "amount": 1000.0,
        "categoryId": category_id
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    create_response = await client.post("/operation", json=create_payload, headers=headers)
    operation_id = create_response.json()["id"]
    
    # Обновляем операцию
    update_payload = {
        "name": "Обновленная операция",
        "date": "2024-12-02T12:00:00Z",
        "amount": 1500.0
    }
    
    response = await client.put(f"/operation/{operation_id}", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Обновленная операция"
    assert data["amount"] == 1500.0

@pytest.mark.asyncio
async def test_delete_operation(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест удаления операции"""
    # Создаем операцию
    create_payload = {
        "name": "Операция для удаления",
        "date": "2024-12-01T00:00:00Z",
        "amount": 1000.0,
        "categoryId": category_id
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    create_response = await client.post("/operation", json=create_payload, headers=headers)
    operation_id = create_response.json()["id"]
    
    # Удаляем операцию
    response = await client.delete(f"/operation/{operation_id}", headers=headers)
    
    assert response.status_code == 204
    
    # Проверяем, что операция действительно удалена
    get_response = await client.get(f"/operation/{operation_id}", headers=headers)
    assert get_response.status_code == 404

@pytest.mark.asyncio
async def test_create_operation_with_nonexistent_category(client: httpx.AsyncClient, access_token: str) -> None:
    """Тест создания операции с несуществующей категорией"""
    payload = {
        "name": "Операция с несуществующей категорией",
        "date": "2024-12-01T00:00:00Z",
        "amount": 1000.0,
        "categoryId": 99999  # Несуществующий ID
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    response = await client.post("/operation", json=payload, headers=headers)
    
    assert response.status_code == 404
    assert "Категория" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_operations_by_category(client: httpx.AsyncClient, access_token: str, category_id: int) -> None:
    """Тест получения операций по категории"""
    # Создаем еще одну категорию
    category2_payload = {
        "name": "Вторая категория",
        "color": "#FF33A8",
        "category_type": "Расход"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    category2_response = await client.post("/category", json=category2_payload, headers=headers)
    category2_id = category2_response.json()["id"]
    
    # Создаем операции в разных категориях
    await client.post("/operation", json={
        "name": "Операция в категории 1",
        "date": "2024-12-01T00:00:00Z",
        "amount": 1000.0,
        "categoryId": category_id
    }, headers=headers)
    
    await client.post("/operation", json={
        "name": "Операция в категории 2",
        "date": "2024-12-02T00:00:00Z",
        "amount": 2000.0,
        "categoryId": category2_id
    }, headers=headers)
    
    await client.post("/operation", json={
        "name": "Еще операция в категории 1",
        "date": "2024-12-03T00:00:00Z",
        "amount": 3000.0,
        "categoryId": category_id
    }, headers=headers)
    
    # Фильтруем по первой категории
    response = await client.get(f"/operation?categoryId={category_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    for operation in data:
        assert "категории 1" in operation["name"]