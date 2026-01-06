from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone

from ..database.connection import get_session
from ..models.operations import Operation
from ..models.categories import Category
from ..schemas.operations import OperationCreate, OperationUpdate, OperationResponse
from .dependencies import get_current_user, current_sessions

operation_router = APIRouter(
    prefix="/operation",
    tags=["Operations"]
)

@operation_router.get("", response_model=List[OperationResponse])
async def retrieve_all_operations(
    author: int = Query(None),
    categoryId: int = Query(None),
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> List[OperationResponse]:
    query = select(Operation)

    if author:
        if author != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other user's operations"
            )
        query = query.where(Operation.author == author)
    else:
        query = query.where(Operation.author == current_user.id)

    if categoryId:
        query = query.where(Operation.category_id == categoryId)

    if start_date:
        if start_date.tzinfo is None:
            start_date = start_date.replace(tzinfo=timezone.utc)
        else:
            start_date = start_date.astimezone(timezone.utc)
        query = query.where(Operation.date >= start_date)
    
    if end_date:
        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
        else:
            end_date = end_date.astimezone(timezone.utc)
        query = query.where(Operation.date <= end_date)
    
    query = query.order_by(Operation.date.desc())
    
    result = await session.execute(query)
    operations = result.scalars().all()
    
    return operations

@operation_router.get("/{id}", response_model=OperationResponse)
async def retrieve_operation(
    id: int,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> OperationResponse:
    result = await session.execute(
        select(Operation).where(Operation.id == id)
    )
    operation = result.scalar_one_or_none()
    
    if not operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Operation with supplied ID does not exist"
        )
    
    if operation.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other user's operation"
        )
    
    return operation

@operation_router.post("", response_model=OperationResponse, status_code=status.HTTP_201_CREATED)
async def create_operation(
    body: OperationCreate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> OperationResponse:
    category_result = await session.execute(
        select(Category).where(Category.id == body.categoryId)
    )
    category = category_result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create operation in other user's category"
        )

    operation = Operation(
        name=body.name,
        date=body.date,
        amount=body.amount,
        category_id=body.categoryId,
        author=current_user.id
    )
    
    session.add(operation)
    await session.commit()
    await session.refresh(operation)
    
    return operation

@operation_router.put("/{id}", response_model=OperationResponse)
async def update_operation(
    id: int,
    body: OperationUpdate,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> OperationResponse:
    result = await session.execute(
        select(Operation).where(Operation.id == id)
    )
    operation = result.scalar_one_or_none()
    
    if not operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operation with supplied ID does not exist"
        )
    
    if operation.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's operation"
        )

    if body.categoryId is not None:
        category_result = await session.execute(
            select(Category).where(Category.id == body.categoryId)
        )
        category = category_result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        if category.author != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot move operation to other user's category"
            )
        operation.category_id = body.categoryId

    if body.name is not None:
        operation.name = body.name
    if body.date is not None:
        operation.date = body.date
    if body.amount is not None:
        operation.amount = body.amount
    
    await session.commit()
    await session.refresh(operation)
    
    return operation

@operation_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_operation(
    id: int,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(Operation).where(Operation.id == id)
    )
    operation = result.scalar_one_or_none()
    
    if not operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operation with supplied ID does not exist"
        )
    
    if operation.author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other user's operation"
        )
    
    await session.delete(operation)
    await session.commit()