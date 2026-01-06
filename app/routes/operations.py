from fastapi import APIRouter, Body, HTTPException, status, Query
from ..models.operations import Operation
from typing import List

operation_router = APIRouter(
    tags=["Operations"]
)

operations_db: List[Operation] = []
operation_counter = 1

@operation_router.get("", response_model=List[Operation])
async def retrieve_all_operations(
    author: int = Query(None),
    categoryId: int = Query(None)
) -> List[Operation]:
    filtered_operations = operations_db
    
    if author:
        filtered_operations = [op for op in filtered_operations if op.author == author]
    
    if categoryId:
        filtered_operations = [op for op in filtered_operations if op.categoryId == categoryId]
    
    return filtered_operations

@operation_router.get("/{id}", response_model=Operation)
async def retrieve_operation(id: int) -> Operation:
    for operation in operations_db:
        if operation.id == id:
            return operation
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail="Operation with supplied ID does not exist"
    )

@operation_router.post("", response_model=Operation)
async def create_operation(body: Operation = Body(...)) -> Operation:
    global operation_counter

    if not body.name or not body.date or body.amount is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, date and amount are required"
        )

    body.id = operation_counter
    operation_counter += 1
    
    operations_db.append(body)
    return body

@operation_router.delete("/{id}")
async def delete_operation(id: int) -> dict:
    for i, operation in enumerate(operations_db):
        if operation.id == id:
            del operations_db[i]
            return {"message": "Operation deleted successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Operation with supplied ID does not exist"
    )