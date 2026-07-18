from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Book Schemas
class BookBase(BaseModel):
    title: str
    author: str
    published_year: int = Field(ge=0, le=2100)


class BookCreate(BookBase):
    pass


class Book(BookBase):
    id: int

    class Config:
        from_attributes = True


# Member Schemas
class MemberBase(BaseModel):
    name: str
    email: EmailStr


class MemberCreate(MemberBase):
    pass


class Member(MemberBase):
    id: int
    joined_date: datetime

    class Config:
        from_attributes = True


# Borrow Record Schemas
class BorrowRecordBase(BaseModel):
    book_id: int
    member_id: int


class BorrowRecordCreate(BorrowRecordBase):
    pass


class BorrowRecord(BorrowRecordBase):
    id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None

    class Config:
        from_attributes = True