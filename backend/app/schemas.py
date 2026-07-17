from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional



# BOOK SCHEMAS

class BookBase(BaseModel):
    title: str
    author: str
    published_year: int



class BookCreate(BookBase):
    pass



class Book(BookBase):
    id: int

    class Config:
        from_attributes = True





# MEMBER SCHEMAS

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





# BORROW RECORD SCHEMAS

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