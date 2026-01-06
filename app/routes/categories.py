from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database.connection import get_session
from ..models.categories import Category
from ..schemas.categories import CategoryCreate, CategoryUpdate, CategoryResponse
from .dependencies import get_current_user, current_sessions

category_router = APIRouter(
    prefix="/category",
    tags=["Categories"]
)

@category_router.get("", response_model=List[CategoryResponse])
async def retrieve_all_categories(
    author: int = Query(None),
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> List[CategoryResponse]:
    query = select(Category)

    if author:
        if author != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other user's categories"
            )
        query = query.where(Category.author == author)
    else:
        query = query.where(Category.author == current_user.id)
    
    result = await session.execute(query)
    categories = result.scalars().all()
    
    return categories

@category_router.get("/{id}", response_model=CategoryResponse)
async def retrieve_category(
    id: int,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> CategoryResponse:
    result = await session.execute(
        select(Category).where(Category.id == id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category with supplied ID does not exist"
        )
    
    if category.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other user's category"
        )
    
    return category

@category_router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> CategoryResponse:
    category = Category(
        name=body.name,
        color=body.color,
        category_type=body.category_type,
        author=current_user.id
    )
    
    session.add(category)
    await session.commit()
    await session.refresh(category)
    
    return category

@category_router.put("/{id}", response_model=CategoryResponse)
async def update_category(
    id: int,
    body: CategoryUpdate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> CategoryResponse:
    result = await session.execute(
        select(Category).where(Category.id == id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category with supplied ID does not exist"
        )
    
    if category.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's category"
        )

    if body.name is not None:
        category.name = body.name
    if body.color is not None:
        category.color = body.color
    if body.category_type is not None:
        category.category_type = body.category_type
    
    await session.commit()
    await session.refresh(category)
    
    return category

@category_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    id: int,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(Category).where(Category.id == id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category with supplied ID does not exist"
        )
    
    if category.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other user's category"
        )
    
    await session.delete(category)
    await session.commit()