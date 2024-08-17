import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep
from app.models import Category, CategoryCreate, CategoryPublic, CategoryPublic, CategoryUpdate, Message

router = APIRouter()

@router.get('/', response_model=list[Category])
def read_categories(
    session: SessionDep, 
    skip: int = 0, 
    limit: int = 100) -> Any:
    """
    Retrieve categories.
    Get categories with optional skip and limit parameters.
    """
    categories = session.exec(
        select(Category).offset(skip).limit(limit)
    ).all()
    
    return categories

@router.get('/{id}', response_model=CategoryPublic)
def read_category(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get category by ID.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category    
    
    
@router.post('/', response_model=CategoryPublic)
def create_category(
    *, session: SessionDep, category_in: CategoryCreate) -> Any:
    """
    Create new category.
    """
    category = Category(**category_in.dict())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category        

@router.put('/{id}', response_model=CategoryPublic)
def update_category(
    *, session: SessionDep, id: uuid.UUID, category_in: CategoryUpdate) -> Any:
    """
    Update category.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category_data = category_in.dict(exclude_unset=True)
    for key, value in category_data.items():
        setattr(category, key, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.delete('/{id}', response_model=Message)
def delete_category(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Delete category.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(category)
    session.commit()
    return Message(message="Category deleted")