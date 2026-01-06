from fastapi import APIRouter, Body, HTTPException, status, Query
from ..models.categories import Category
from typing import List

category_router = APIRouter(
    tags=["Categories"]
)

categories_db: List[Category] = []
category_counter = 1

@category_router.get("", response_model=List[Category])
async def retrieve_all_categories(author: int = Query(None)) -> List[Category]:
    if author:
        return [cat for cat in categories_db if cat.author == author]
    return categories_db

@category_router.get("/{id}", response_model=Category)
async def retrieve_category(id: int) -> Category:
    for category in categories_db:
        if category.id == id:
            return category
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail="Category with supplied ID does not exist"
    )

@category_router.post("", response_model=Category)
async def create_category(body: Category = Body(...)) -> dict:
    global category_counter

    if not body.name or not body.category_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name and category_type are required"
        )

    body.id = category_counter
    category_counter += 1
    
    categories_db.append(body)
    return body

@category_router.delete("/{id}")
async def delete_category(id: int) -> dict:
    for i, category in enumerate(categories_db):
        if category.id == id:
            del categories_db[i]
            return {"message": "Category deleted successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Category with supplied ID does not exist"
    )